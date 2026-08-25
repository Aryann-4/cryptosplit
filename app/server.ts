import express from 'express';
import cors from 'cors';
import { WebSocket } from 'ws';
import pino from 'pino';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract, submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { fromHex, toHex } from '@midnight-ntwrk/midnight-js-utils';

import { getConfig } from './src/config.js';
import { MidnightWalletProvider, syncWallet } from './src/wallet.js';
import { buildCryptoSplitProviders } from './src/providers.js';
import { CompiledCryptoSplit, cryptoSplitZkConfigPath } from './src/contract.js';
import { generateSecret, getMemberId, bytesToHex } from './src/crypto.js';

(globalThis as any).WebSocket = WebSocket;

const logger = pino({ level: 'info', transport: { target: 'pino-pretty' } });
const app = express();
app.use(cors());
app.use(express.json());

let wallet: MidnightWalletProvider | null = null;
let contractAddress: string | null = null;
let organizerSecret: Uint8Array | null = null;

async function initWallet() {
  const seed = process.env['MIDNIGHT_SEED'];
  if (!seed) {
    logger.warn('MIDNIGHT_SEED not set — running in demo mode without on-chain interaction');
    return;
  }

  const network = process.env['MIDNIGHT_NETWORK'] ?? 'preprod';
  setNetworkId(network);

  const config = getConfig();
  logger.info(`Initializing wallet on ${network}...`);

  wallet = await MidnightWalletProvider.build(logger, config as any, {
    kind: 'seed',
    value: seed,
  });
  await wallet.start();

  logger.info('Syncing wallet...');
  await syncWallet(logger, wallet.wallet, 60 * 60_000);
  logger.info('Wallet synced.');

  const providers = buildCryptoSplitProviders(wallet, cryptoSplitZkConfigPath, config);
  (app as any).providers = providers;
  (app as any).config = config;

  const seedBytes = new TextEncoder().encode(seed.padEnd(64, '0').slice(0, 64));
  organizerSecret = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    organizerSecret[i] = parseInt(seed.substring(i * 2, i * 2 + 2), 16) || seedBytes[i];
  }
}

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    walletConnected: wallet !== null,
    contractAddress,
  });
});

app.post('/api/deploy', async (_req, res) => {
  try {
    if (!wallet) {
      return res.status(503).json({ error: 'Wallet not initialized. Set MIDNIGHT_SEED env var.' });
    }

    const providers = (app as any).providers;
    organizerSecret = generateSecret();
    const tokenColor = new Uint8Array(32);

    logger.info('Deploying CryptoSplit contract...');
    const deployed = await deployContract(providers, {
      compiledContract: CompiledCryptoSplit as any,
      privateStateId: 'cryptosplit-deploy',
      initialPrivateState: {},
      args: [organizerSecret, tokenColor],
    } as any);

    contractAddress = (deployed as any).deployTxData.public.contractAddress;
    logger.info(`Contract deployed at: ${contractAddress}`);

    res.json({ contractAddress, status: 'deployed' });
  } catch (err) {
    logger.error('Deploy failed:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Deploy failed' });
  }
});

app.post('/api/add-member', async (req, res) => {
  try {
    if (!wallet || !contractAddress || !organizerSecret) {
      return res.status(503).json({ error: 'Service not ready' });
    }

    const { memberSecretHex } = req.body;
    const memberSecret = memberSecretHex
      ? fromHex(memberSecretHex)
      : generateSecret();

    const providers = (app as any).providers;
    logger.info('Calling addMember circuit...');

    await submitCallTx(providers, {
      compiledContract: CompiledCryptoSplit as any,
      contractAddress,
      privateStateId: 'cryptosplit-deploy',
      circuitId: 'addMember',
      args: [organizerSecret, memberSecret],
    } as any);

    const memberId = getMemberId(memberSecret);
    logger.info(`Member added: ${bytesToHex(memberId).slice(0, 16)}...`);

    res.json({
      status: 'success',
      circuit: 'addMember',
      memberId: bytesToHex(memberId),
      memberIdPartial: bytesToHex(memberId).slice(0, 16),
    });
  } catch (err) {
    logger.error('addMember failed:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'addMember failed' });
  }
});

app.post('/api/set-net-debt', async (req, res) => {
  try {
    if (!wallet || !contractAddress || !organizerSecret) {
      return res.status(503).json({ error: 'Service not ready' });
    }

    const { debtorIdHex, creditorIdHex, amount } = req.body;
    if (!debtorIdHex || !creditorIdHex || amount === undefined) {
      return res.status(400).json({ error: 'Missing required fields: debtorIdHex, creditorIdHex, amount' });
    }

    const debtorId = fromHex(debtorIdHex);
    const creditorId = fromHex(creditorIdHex);

    const providers = (app as any).providers;
    logger.info(`Calling setNetDebt circuit: ${amount} from ${debtorIdHex.slice(0, 8)} to ${creditorIdHex.slice(0, 8)}...`);

    await submitCallTx(providers, {
      compiledContract: CompiledCryptoSplit as any,
      contractAddress,
      privateStateId: 'cryptosplit-deploy',
      circuitId: 'setNetDebt',
      args: [organizerSecret, debtorId, creditorId, BigInt(amount)],
    } as any);

    logger.info('setNetDebt completed successfully');

    res.json({
      status: 'success',
      circuit: 'setNetDebt',
      amount,
    });
  } catch (err) {
    logger.error('setNetDebt failed:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'setNetDebt failed' });
  }
});

app.post('/api/settle', async (req, res) => {
  try {
    if (!wallet || !contractAddress) {
      return res.status(503).json({ error: 'Service not ready' });
    }

    const { debtorSecretHex, creditorIdHex, amount, creditorAddressHex } = req.body;
    if (!debtorSecretHex || !creditorIdHex || amount === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const debtorSecret = fromHex(debtorSecretHex);
    const creditorId = fromHex(creditorIdHex);
    const creditorAddress = creditorAddressHex ? fromHex(creditorAddressHex) : new Uint8Array(32);

    const providers = (app as any).providers;
    logger.info(`Calling settle circuit: ${amount} from ${debtorSecretHex.slice(0, 8)}...`);

    await submitCallTx(providers, {
      compiledContract: CompiledCryptoSplit as any,
      contractAddress,
      privateStateId: 'cryptosplit-deploy',
      circuitId: 'settle',
      args: [debtorSecret, creditorId, BigInt(amount), { bytes: creditorAddress }],
    } as any);

    logger.info('settle completed successfully');

    res.json({
      status: 'success',
      circuit: 'settle',
      amount,
      message: 'Settlement confirmed on-chain',
    });
  } catch (err) {
    logger.error('settle failed:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'settle failed' });
  }
});

const PORT = parseInt(process.env['API_PORT'] ?? '3001', 10);

initWallet()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`CryptoSplit API server running on http://localhost:${PORT}`);
      if (contractAddress) {
        logger.info(`Deployed contract: ${contractAddress}`);
      }
    });
  })
  .catch((err) => {
    logger.error('Failed to initialize wallet:', err);
    logger.info('Starting server in demo mode...');
    app.listen(PORT, () => {
      logger.info(`CryptoSplit API server (demo mode) on http://localhost:${PORT}`);
    });
  });
