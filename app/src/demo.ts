// Deploys SplitBill, registers three friends on an equal split of a
// 300-unit dinner bill, has each of them deposit their share, then settles
// the pot to the friend who fronted the tab.
//
// For clarity this demo drives every step from a single funded wallet
// (the local devnet's genesis wallet). In a real deployment each
// participant would run this from their own wallet/app instance and only
// ever need: (a) the contract address, and (b) a secret only they know.
// The organizer secret and each participant secret below stand in for
// those per-person secrets.
//
// Run with (see README for full setup):
//   MIDNIGHT_NETWORK=local \
//   MIDNIGHT_SEED=0000000000000000000000000000000000000000000000000000000000000001 \
//   npx tsx src/demo.ts

import { randomBytes } from 'node:crypto';
import { WebSocket } from 'ws';
import { firstValueFrom } from 'rxjs';
import { filter, timeout as rxTimeout } from 'rxjs/operators';
import pino from 'pino';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { deployContract, submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import { type EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
import { UnshieldedAddress } from '@midnight-ntwrk/wallet-sdk';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { toHex, fromHex } from '@midnight-ntwrk/midnight-js-utils';

import { getConfig } from './config.js';
import { MidnightWalletProvider, syncWallet } from './wallet.js';
import { buildProviders } from './providers.js';
import { CompiledSplitBill, ledger, zkConfigPath, BillStatus } from './contract.js';
import { equalSplit } from './split.js';

(globalThis as any).WebSocket = WebSocket;
const logger = pino({ level: 'info', transport: { target: 'pino-pretty' } });

function toUserAddressBytes(unshielded: any): Uint8Array {
  const pk = unshielded?.state?.publicKey ?? unshielded?.publicKey;
  if (pk?.address instanceof Uint8Array) return pk.address;
  if (typeof pk?.addressHex === 'string') return fromHex(pk.addressHex);
  const addr = unshielded?.address;
  if (addr?.bytes instanceof Uint8Array) return addr.bytes;
  if (addr?.data instanceof Uint8Array) return addr.data;
  if (typeof addr?.addressHex === 'string') return fromHex(addr.addressHex);
  throw new Error('Could not find raw unshielded address bytes.');
}

async function main() {
  const config = getConfig();
  setNetworkId(config.networkId);

  const env: EnvironmentConfiguration = {
    walletNetworkId: config.networkId,
    networkId: config.networkId,
    indexer: config.indexer,
    indexerWS: config.indexerWS,
    node: config.node,
    nodeWS: config.nodeWS,
    faucet: config.faucet,
    proofServer: config.proofServer,
  };

  const seed = process.env['MIDNIGHT_SEED'];
  if (!seed) {
    throw new Error('Set MIDNIGHT_SEED to your wallet seed (hex, no 0x prefix).');
  }

  const wallet = await MidnightWalletProvider.build(logger, env, { kind: 'seed', value: seed });
  await wallet.start();

  const initialState = await firstValueFrom(wallet.wallet.state());
  const address = UnshieldedAddress.codec
    .encode(config.networkId, initialState.unshielded.address)
    .asString();
  logger.info(`Wallet address (fund this on preprod/preview): ${address}`);

  const nightRaw = unshieldedToken().raw;

  logger.info('Waiting for NIGHT...');
  await firstValueFrom(
    wallet.wallet.state().pipe(
      filter((s: any) => (s.unshielded.balances[nightRaw] ?? 0n) > 0n),
      rxTimeout({ each: 30 * 60_000 }),
    ),
  );

  logger.info('Waiting for the unshielded channel to sync...');
  const syncedState = await firstValueFrom(
    wallet.wallet.state().pipe(
      filter((s: any) => s.unshielded.progress?.isStrictlyComplete() === true),
      rxTimeout({ each: 30 * 60_000 }),
    ),
  );

  const unregistered = syncedState.unshielded.availableCoins.filter(
    (coin: any) => coin.utxo.type === nightRaw && coin.meta.registeredForDustGeneration === false,
  );
  if (unregistered.length > 0) {
    logger.info(`Registering ${unregistered.length} NIGHT UTXO(s) for DUST generation...`);
    const recipe = await wallet.wallet.registerNightUtxosForDustGeneration(
      unregistered,
      wallet.unshieldedKeystore.getPublicKey(),
      (payload: Uint8Array) => wallet.unshieldedKeystore.signData(payload),
    );
    const finalized = await wallet.wallet.finalizeRecipe(recipe);
    const txId = await wallet.wallet.submitTransaction(finalized);
    logger.info(`DUST registration submitted: ${txId}`);
  }

  logger.info('Waiting for DUST...');
  const dustDeadline = Date.now() + 30 * 60_000;
  let dustBalance = 0n;
  while (Date.now() < dustDeadline) {
    const s = await firstValueFrom(wallet.wallet.state());
    try {
      dustBalance = s.dust.balance(new Date());
    } catch {
      dustBalance = 0n;
    }
    if (dustBalance > 0n) break;
    await new Promise((r) => setTimeout(r, 15_000));
  }
  if (dustBalance <= 0n) {
    throw new Error('Timed out waiting for DUST.');
  }
  logger.info(`DUST available: ${dustBalance}`);

  const providers = buildProviders(wallet, zkConfigPath, config);

  // --- The bill itself -------------------------------------------------

  const BILL_TOTAL = 300n; // e.g. 300 units of the native NIGHT token
  const friends = ['Alex', 'Bri', 'Cass'];
  const shares = equalSplit(BILL_TOTAL, friends);
  logger.info(`Split: ${shares.map((s) => `${s.label}=${s.amount}`).join(', ')}`);

  // Stand-in secrets. In production each of these lives only on the
  // corresponding person's device.
  const organizerSecret = randomBytes(32);
  const participantSecrets = new Map(friends.map((f) => [f, randomBytes(32)]));

  // Whoever fronted the dinner bill gets the pooled funds. Using this
  // wallet's own address for the demo so the payout is easy to verify.
  const recipientAddress = { bytes: toUserAddressBytes(syncedState.unshielded) };

  logger.info('Deploying SplitBill...');
  const deployed = await deployContract(providers, {
    compiledContract: CompiledSplitBill,
    privateStateId: 'split-bill',
    initialPrivateState: {},
    args: [organizerSecret, recipientAddress, fromHex(nightRaw), BILL_TOTAL],
  });
  const contractAddress = deployed.deployTxData.public.contractAddress;
  logger.info(`Deployed at ${contractAddress}`);

  async function readLedger() {
    const state = await providers.publicDataProvider.queryContractState(contractAddress);
    return ledger(state!.data);
  }

  logger.info(`status after deploy: ${BillStatus[(await readLedger()).status]}`); // SETUP

  // --- Register participants --------------------------------------------

  for (const share of shares) {
    const participantSecret = participantSecrets.get(share.label)!;
    logger.info(`Registering ${share.label} for ${share.amount}...`);
    await submitCallTx(providers, {
      compiledContract: CompiledSplitBill,
      contractAddress,
      privateStateId: 'split-bill',
      circuitId: 'addParticipant',
      args: [organizerSecret, participantSecret, share.amount],
    });
  }

  await submitCallTx(providers, {
    compiledContract: CompiledSplitBill,
    contractAddress,
    privateStateId: 'split-bill',
    circuitId: 'finalizeSetup',
    args: [organizerSecret],
  });
  logger.info(`status after finalizeSetup: ${BillStatus[(await readLedger()).status]}`); // COLLECTING

  // --- Everyone pays their share -----------------------------------------

  for (const share of shares) {
    const participantSecret = participantSecrets.get(share.label)!;
    logger.info(`${share.label} depositing ${share.amount}...`);
    await submitCallTx(providers, {
      compiledContract: CompiledSplitBill,
      contractAddress,
      privateStateId: 'split-bill',
      circuitId: 'deposit',
      args: [participantSecret, share.amount],
    });
  }

  const afterDeposits = await readLedger();
  logger.info(
    `status after all deposits: ${BillStatus[afterDeposits.status]}, ` +
      `totalDeposited: ${afterDeposits.totalDeposited}`,
  ); // FUNDED, 300

  // --- Settle --------------------------------------------------------------

  logger.info('Settling...');
  await submitCallTx(providers, {
    compiledContract: CompiledSplitBill,
    contractAddress,
    privateStateId: 'split-bill',
    circuitId: 'settle',
    args: [],
  });

  const final = await readLedger();
  logger.info(`status after settle: ${BillStatus[final.status]}`); // SETTLED

  const after = await syncWallet(logger, wallet.wallet, 60 * 60_000);
  logger.info(
    `recipient NIGHT balance: ${after.unshielded.balances[toHex(nightRaw)] ?? after.unshielded.balances[nightRaw] ?? 0n}`,
  );

  await wallet.stop();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
