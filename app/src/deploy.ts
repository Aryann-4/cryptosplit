import { WebSocket } from 'ws';
import pino from 'pino';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract, submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { fromHex } from '@midnight-ntwrk/midnight-js-utils';

import { getConfig } from './config.js';
import { MidnightWalletProvider, syncWallet } from './wallet.js';
import { buildCryptoSplitProviders } from './providers.js';
import { CompiledCryptoSplit, cryptoSplitZkConfigPath } from './contract.js';
import { generateSecret, getMemberId } from './crypto.js';

(globalThis as any).WebSocket = WebSocket;
const logger = pino({ level: 'info', transport: { target: 'pino-pretty' } });

async function main() {
  const seed = process.env['MIDNIGHT_SEED'];
  if (!seed) {
    console.error('Set MIDNIGHT_SEED env var (64 hex characters)');
    process.exit(1);
  }

  const network = process.env['MIDNIGHT_NETWORK'] ?? 'preprod';
  setNetworkId(network);

  const config = getConfig();
  logger.info(`Deploying CryptoSplit to ${network}...`);

  // Build wallet
  const wallet = await MidnightWalletProvider.build(logger, config as any, {
    kind: 'seed',
    value: seed,
  });
  await wallet.start();

  logger.info('Syncing wallet (this may take a while on first run)...');
  await syncWallet(logger, wallet.wallet, 60 * 60_000); // 60 min timeout for public networks

  // Build providers
  const providers = buildCryptoSplitProviders(wallet, cryptoSplitZkConfigPath, config);

  // Deploy contract
  const organizerSecret = generateSecret();
  const tokenColor = unshieldedToken().raw;
  const tokenColorBytes = fromHex(tokenColor);

  logger.info('Deploying CryptoSplit contract...');
  const deployed = await deployContract(providers as any, {
    compiledContract: CompiledCryptoSplit as any,
    privateStateId: 'cryptosplit-deploy',
    initialPrivateState: {},
    args: [organizerSecret, tokenColorBytes],
  } as any);

  const contractAddress = (deployed as any).deployTxData.public.contractAddress;
  logger.info(`Contract deployed at: ${contractAddress}`);

  // Add a test member
  const memberSecret = generateSecret();
  logger.info('Adding test member...');
  await submitCallTx(providers as any, {
    compiledContract: CompiledCryptoSplit as any,
    contractAddress,
    privateStateId: 'cryptosplit-deploy',
    circuitId: 'addMember',
    args: [organizerSecret, memberSecret],
  } as any);

  logger.info('Test member added successfully!');
  logger.info(`\nDone! Contract address: ${contractAddress}`);

  await wallet.stop();
}

main().catch((err) => {
  logger.error(err);
  process.exit(1);
});
