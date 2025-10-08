/* eslint-disable no-undef */
import { keccak256, toUtf8Bytes } from 'ethers';

// ---------- CONFIG ----------
const BLOCK_INTERVAL_SECONDS = 15; // blocks every 15 seconds
const START_TS_UTC = Date.UTC(2025, 6, 2, 0, 0, 0); // July 2, 2025
const START_TS_SECONDS = Math.floor(START_TS_UTC / 1000);
const CHAIN_SEED = 'KrossChain';
const KROSS_DECIMALS = 18;
const USDT_DECIMALS = 6;
const USDT_CONTRACT = '0xb777BFEc6aEc7528F4Ad8CD61B549936eDF4B06D';
// ----------------------------

// helpers
const keccak = (input) => keccak256(toUtf8Bytes(input));
const toHex = (n) => {
  if (typeof n === 'bigint') return '0x' + n.toString(16);
  if (typeof n === 'number') return '0x' + n.toString(16);
  return n;
};
const padHex = (hexStr, bytes) => {
  let s = hexStr.replace(/^0x/, '');
  while (s.length < bytes * 2) s = '0' + s;
  return '0x' + s;
};
const uintFromHash = (hashHex) => {
  const s = hashHex.replace(/^0x/, '').slice(0, 16);
  return BigInt('0x' + s);
};
const toKrossWei = (kross) => BigInt(kross) * (10n ** BigInt(KROSS_DECIMALS));
const toUSDTWei = (usdt) => BigInt(usdt) * (10n ** BigInt(USDT_DECIMALS));

// --- PREDEFINED TRANSACTION HISTORY ---
const predefinedTransactions = {
  1: [ // July 2, 2025
    { from: '0x0000000000000000000000000000000000000000', to: '0xB9ff77d1a6b9802C32632298eB5CC2FDb278049b', value: toKrossWei('144000000000'), seed: 'genesis-tx' }
  ],
  17281: [ // July 5, 2025
    { from: '0xB9ff77d1a6b9802C32632298eB5CC2FDb278049b', to: '0xaC5aBDb1eBA4376992acbd681484e17347B667e3', value: toKrossWei(10), seed: 'tx-1' },
    { from: '0xB9ff77d1a6b9802C32632298eB5CC2FDb278049b', to: '0xaC5aBDb1eBA4376992acbd681484e17347B667e3', value: toKrossWei(1), seed: 'tx-2' }
  ],
  51841: [ // July 11, 2025
    { from: '0xB9ff77d1a6b9802C32632298eB5CC2FDb278049b', to: '0xaC5aBDb1eBA4376992acbd681484e17347B667e3', value: toKrossWei(1), seed: 'tx-3' }
  ],
  149761: [ // July 28, 2025
    { from: '0xB9ff77d1a6b9802C32632298eB5CC2FDb278049b', to: '0x4E8D4C2cA158d02Ed812F56B25b421c7f0B3d727', value: toKrossWei(1), seed: 'tx-4' }
  ],
  230401: [ // August 11, 2025
    { from: '0xB9ff77d1a6b9802C32632298eB5CC2FDb278049b', to: '0xd372D11e6839e23EEc47D59C1a62b80909FAdCF1', value: toKrossWei(10), seed: 'tx-5' }
  ],
  281601: [ // August 20, 2025
    { from: '0xB9ff77d1a6b9802C32632298eB5CC2FDb278049b', to: '0xaC5aBDb1eBA4376992acbd681484e17347B667e3', value: toUSDTWei(10), type: 'token_transfer', seed: 'usdt-tx-1' },
    { from: '0xB9ff77d1a6b9802C32632298eB5CC2FDb278049b', to: '0xaC5aBDb1eBA4376992acbd681484e17347B667e3', value: toUSDTWei(1), type: 'token_transfer', seed: 'usdt-tx-2' }
  ],
  293121: [ // August 22, 2025
    { from: '0xB9ff77d1a6b9802C32632298eB5CC2FDb278049b', to: '0xaC5aBDb1eBA4376992acbd681484e17347B667e3', value: toUSDTWei(1), type: 'token_transfer', seed: 'usdt-tx-3' }
  ],
  350721: [ // September 1, 2025
    { from: '0xB9ff77d1a6b9802C32632298eB5CC2FDb278049b', to: '0xd372D11e6839e23EEc47D59C1a62b80909FAdCF1', value: toUSDTWei(10), type: 'token_transfer', seed: 'usdt-tx-4' }
  ],
  373761: [ // September 5, 2025
    { from: '0xB9ff77d1a6b9802C32632298eB5CC2FDb278049b', to: '0xd372D11e6839e23EEc47D59C1a62b80909FAdCF1', value: toUSDTWei(10), type: 'token_transfer', seed: 'usdt-tx-5' }
  ],
  402561: [ // September 10, 2025
    { from: '0xB9ff77d1a6b9802C32632298eB5CC2FDb278049b', to: '0xd372D11e6839e23EEc47D59C1a62b80909FAdCF1', value: toUSDTWei(1), type: 'token_transfer', seed: 'usdt-tx-6' }
  ],
  414721: [ // September 12, 2025
    { from: '0xB9ff77d1a6b9802C32632298eB5CC2FDb278049b', to: '0xaC5aBDb1eBA4376992acbd681484e17347B667e3', value: toKrossWei(100), seed: 'tx-6' },
    { from: '0xB9ff77d1a6b9802C32632298eB5CC2FDb278049b', to: '0xd372D11e6839e23EEc47D59C1a62b80909FAdCF1', value: toKrossWei(1000), seed: 'tx-7' }
  ],
  506241: [ // September 28, 2025
    { from: '0xB9ff77d1a6b9802C32632298eB5CC2FDb278049b', to: '0x4E8D4C2cA158d02Ed812F56B25b421c7f0B3d727', value: toUSDTWei(1), type: 'token_transfer', seed: 'usdt-tx-7' }
  ]
};
// ------------------------------------

function blockNumberAtTimeSeconds(tsSeconds) {
  if (tsSeconds < START_TS_SECONDS) return 0;
  const delta = tsSeconds - START_TS_SECONDS;
  const idx = Math.floor(delta / BLOCK_INTERVAL_SECONDS) + 1;
  return idx;
}

function timestampForBlock(blockNumber) {
  const bn = BigInt(blockNumber);
  const ts = BigInt(START_TS_SECONDS) + (bn - 1n) * BigInt(BLOCK_INTERVAL_SECONDS);
  return Number(ts);
}

function makeBlock(blockNumber, includeTxObjects = false) {
  if (blockNumber < 1) return null;
  const bn = BigInt(blockNumber);
  const blockSeed = `${CHAIN_SEED}|block|${blockNumber}`;
  const blockHash = keccak(blockSeed);
  const parentHash = blockNumber === 1 ? '0x0000000000000000000000000000000000000000000000000000000000000000' : keccak(`${CHAIN_SEED}|block|${blockNumber - 1}`);
  const minerAddr = '0x' + keccak(`${blockSeed}|miner`).replace(/^0x/, '').slice(24, 64);
  const difficultyBig = (uintFromHash(keccak(`${blockSeed}|difficulty`)) % 1000000n) + 131072n;
  const gasLimitBig = 30_000_000n;
  const timestamp = timestampForBlock(blockNumber);

  const txs = [];
  const predefinedTxsForBlock = predefinedTransactions[blockNumber];
  let totalGasUsed = 0n;

  if (predefinedTxsForBlock) {
    predefinedTxsForBlock.forEach((txData, i) => {
      const txSeed = `${blockSeed}|tx|${txData.seed}`;
      const txHash = keccak(txSeed);
      const gasLimit = 21000;
      const gasPrice = 10000000000n;
      totalGasUsed += BigInt(gasLimit);

      const txObj = {
        hash: txHash,
        timestamp: timestamp,
        nonce: toHex(i),
        blockHash: blockHash,
        blockNumber: toHex(blockNumber),
        transactionIndex: toHex(i),
        from: txData.from,
        to: txData.to,
        value: txData.type === 'token_transfer' ? '0x0' : toHex(txData.value),
        gas: toHex(gasLimit),
        gasPrice: toHex(gasPrice),
        input: '0x',
        type: txData.type || 'transfer',
        status: 'SUCCESSFUL',
        gasUsed: gasLimit,
        tokenTransfer: txData.type === 'token_transfer' ? {
          contract: USDT_CONTRACT,
          symbol: 'USDT',
          value: toHex(txData.value),
          decimals: USDT_DECIMALS,
          valueFormatted: (Number(txData.value) / (10 ** USDT_DECIMALS)).toString()
        } : null,
      };
      txs.push(txObj);
    });
  }

  const block = {
    number: toHex(blockNumber),
    blockNumber: blockNumber,
    hash: blockHash,
    parentHash: parentHash,
    nonce: '0x' + keccak(`${blockSeed}|nonce`).replace(/^0x/, '').slice(0, 16),
    miner: minerAddr,
    difficulty: toHex(difficultyBig),
    totalDifficulty: toHex(difficultyBig * bn),
    size: 1000 + Number(uintFromHash(keccak(`${blockSeed}|size`)) % 2000n),
    gasLimit: toHex(gasLimitBig),
    gasUsed: Number(totalGasUsed),
    timestamp: timestamp,
    transactions: includeTxObjects ? txs : txs.map((t) => t.hash),
    txCount: txs.length,
    allTransactions: txs,
    uncles: [],
  };
  return block;
}

function getLatestBlockNumber() {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return blockNumberAtTimeSeconds(nowSeconds);
}

function getLatestBlocks(limit = 5) {
  try {
    const latestBn = getLatestBlockNumber();
    const blocks = [];
    for (let i = 0; i < limit; i++) {
      const blockNumber = latestBn - i;
      if (blockNumber < 1) break;
      const block = makeBlock(blockNumber, true);
      if (block) blocks.push(block);
    }
    return { success: true, data: blocks };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

function getBlockByNumber(blockId, includeTx = true) {
  let blockNumber;
  if (blockId === 'latest') {
    blockNumber = getLatestBlockNumber();
  } else if (typeof blockId === 'string' && blockId.startsWith('0x')) {
    blockNumber = parseInt(blockId, 16);
  } else if (!isNaN(Number(blockId))) {
    blockNumber = Number(blockId);
  } else {
    return { success: false, message: 'Invalid block number param' };
  }
  const block = makeBlock(blockNumber, includeTx);
  if (block) return { success: true, data: block };
  return { success: false, message: 'Block not found' };
}

function getLatestTransactions(limit = 20) {
  try {
    const allTxs = [];
    const blockNumbers = Object.keys(predefinedTransactions).sort((a, b) => b - a);
    for (const bnStr of blockNumbers) {
      const block = makeBlock(parseInt(bnStr, 10), true);
      if (block && block.allTransactions) {
        allTxs.push(...block.allTransactions);
      }
    }
    return { success: true, data: allTxs.slice(0, limit) };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

function getTransactionByHash(txHash) {
  const blockNumbersWithTxs = Object.keys(predefinedTransactions);
  for (const blockNumberStr of blockNumbersWithTxs) {
    const blockNumber = parseInt(blockNumberStr, 10);
    const block = makeBlock(blockNumber, true);
    if (block && block.allTransactions) {
      const foundTx = block.allTransactions.find(tx => tx.hash === txHash);
      if (foundTx) return { success: true, data: foundTx };
    }
  }
  return { success: false, message: 'Transaction not found' };
}

function getBlockByHash(blockHash) {
  const latestBn = getLatestBlockNumber();
  for (let i = 0; i < latestBn; i++) {
    const blockNumber = latestBn - i;
    if (blockNumber < 1) break;
    const blockSeed = `${CHAIN_SEED}|block|${blockNumber}`;
    const hash = keccak(blockSeed);
    if (hash === blockHash) {
      const block = makeBlock(blockNumber, true);
      return { success: true, data: block };
    }
  }
  return { success: false, message: 'Block not found' };
}

function getWalletDetails(address) {
  const transactions = [];
  let balance = 0n;
  const blockNumbersWithTxs = Object.keys(predefinedTransactions);

  for (const blockNumberStr of blockNumbersWithTxs) {
    const blockNumber = parseInt(blockNumberStr, 10);
    const block = makeBlock(blockNumber, true);
    if (block && block.allTransactions) {
      for (const tx of block.allTransactions) {
        const fromMatch = tx.from.toLowerCase() === address.toLowerCase();
        const toMatch = tx.to.toLowerCase() === address.toLowerCase();
        if (fromMatch || toMatch) {
          transactions.push(tx);
          const valueBigInt = BigInt(tx.value);
          if (toMatch) balance += valueBigInt;
          if (fromMatch) balance -= valueBigInt;
        }
      }
    }
  }

  const divisor = 10n ** BigInt(KROSS_DECIMALS);
  const formattedBalance = (Number(balance) / Number(divisor)).toFixed(4);
  const creationDate = transactions.length > 0 ? new Date(transactions[transactions.length - 1].timestamp * 1000).toISOString() : new Date(START_TS_SECONDS * 1000).toISOString();

  return {
    success: true,
    data: {
      address: address,
      balance: formattedBalance,
      creationDate: creationDate,
      transactions: transactions.sort((a, b) => b.timestamp - a.timestamp),
      tokenBalances: [],
    }
  };
}

export {
  makeBlock,
  blockNumberAtTimeSeconds,
  timestampForBlock,
  toHex,
  keccak,
  uintFromHash,
  BLOCK_INTERVAL_SECONDS,
  START_TS_SECONDS,
  CHAIN_SEED,
  getLatestBlockNumber,
  getLatestBlocks,
  getBlockByNumber,
  getBlockByHash,
  getLatestTransactions,
  getTransactionByHash,
  getWalletDetails,
};
