// instructions: These instructions should not be deleted, modified, or edited. Follow the work according to these instructions.
// This file defines the Dashboard page component.

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Card from '../components/Card';
import Table from '../components/Table';
import TransactionChart from '../components/TransactionChart'; // Import the new chart component
import { Link } from 'react-router-dom';
import { compressAddress, formatGasToEther } from '../utils/formatters'; // Import the formatter at the top
import tokenListData from '../data/tokenlist.json'; // Import the tokenlist data
import { getLatestBlocks, getLatestTransactions, getBlockByNumber, getTransactionByHash, getBlockByHash } from '../kross'; // Import functions from kross.js

const KROSS_DECIMALS = 18;

// Helper to format hex value to a readable number string
const formatHexValue = (hex, decimals = KROSS_DECIMALS) => {
  if (!hex) return '0';
  /* eslint-disable no-undef */
  const number = BigInt(hex);
  const divisor = BigInt(10) ** BigInt(decimals);
  /* eslint-enable no-undef */
  // Format with high precision and remove trailing zeros
  return (Number(number) / Number(divisor)).toFixed(6).replace(/\.?0+$/, '');
};

// Helper to format time as "x ago"
function getTimeAgo(timestamp) {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - Number(timestamp);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

// Helper to shorten hashes
function shortHash(hash) {
    if (!hash) return "";
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}
const Dashboard = () => {
    const { t } = useTranslation();
    const [latestBlocks, setLatestBlocks] = useState([]);
    const [latestTransactions, setLatestTransactions] = useState([]);
    const [loadingBlocks, setLoadingBlocks] = useState(true);
    const [errorBlocks, setErrorBlocks] = useState(null);
    const [errorTransactions, setErrorTransactions] = useState(null);
    const [blockAges, setBlockAges] = useState([]);
    const [tokenMap, setTokenMap] = useState({}); // State to store token data
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        e.preventDefault();
        const query = searchTerm.trim();

        if (!query) return;

        if (query.startsWith('0x')) {
            if (query.length === 42) {
                navigate(`/address/${query}`);
            } else if (query.length === 66) {
                // It could be a block hash or a transaction hash.
                // Let's try to find a transaction first, then a block.
                const txResult = getTransactionByHash(query);
                if (txResult.success) {
                    navigate(`/tx/${query}`);
                } else {
                    // If not a transaction, it might be a block.
                    // The BlockDetails page will handle the lookup.
                    navigate(`/block/${query}`);
                }
            } else {
                alert("Invalid hash format");
            }
        } else if (!isNaN(query)) {
            navigate(`/block/${query}`);
        } else {
            alert("Unsupported search input");
        }
    };
    useEffect(() => {
        // Process token list data
        const map = {};
        tokenListData.tokens.forEach(token => {
            map[token.symbol] = token;
        });
        setTokenMap(map);
    }, []);

    useEffect(() => {
        if (latestBlocks && latestBlocks.length > 0) {
            setBlockAges(latestBlocks.map(b => getTimeAgo(b.timestamp)));
            const interval = setInterval(() => {
                setBlockAges(latestBlocks.map(b => getTimeAgo(b.timestamp)));
            }, 60000); // update every 60s
            return () => clearInterval(interval);
        }
    }, [latestBlocks]);
    useEffect(() => {
        const fetchLatestBlocks = async () => {
            try {
                setLoadingBlocks(true);
                const result = getLatestBlocks(5); // Fetch latest 5 blocks using kross.js
                console.log("Dashboard - getLatestBlocks result:", result); // Debugging line
                if (result.success) {
                    setLatestBlocks(result.data);
                    setErrorBlocks(null); // Clear any previous error
                    console.log("Dashboard - latestBlocks state:", result.data); // Debugging line
                } else {
                    setErrorBlocks(result.message);
                }
            } catch (err) {
                setErrorBlocks(t('error_fetching_blocks'));
                console.error("Error fetching latest blocks:", err);
            } finally {
                setLoadingBlocks(false);
            }
        };

        const fetchLatestTransactions = async () => {
            try {
                const result = getLatestTransactions(); // Fetch all transactions using kross.js
                console.log("Dashboard - getLatestTransactions result:", result); // Debugging line
                if (result.success) {
                    setLatestTransactions(result.data);
                    setErrorTransactions(null); // Clear any previous error
                    console.log("Dashboard - latestTransactions state:", result.data); // Debugging line
                } else {
                    setErrorTransactions(result.message);
                }
            } catch (err) {
                setErrorTransactions(t('error_fetching_transactions'));
                console.error("Error fetching latest transactions:", err);
            } finally {
                // Ensure loading state is reset even if there's an error
                // setLoadingTransactions(false); // Assuming a loading state for transactions
            }
        };

        const fetchData = () => {
            fetchLatestBlocks();
            fetchLatestTransactions();
        };

        fetchData(); // Initial fetch
        const interval = setInterval(fetchData, 16000); // refresh every 16 seconds

        return () => clearInterval(interval);
    }, [t]);

    const transactionHeaders = [
        {
            key: 'hash',
            label: t('tx_id'),
            render: (row) => <Link to={`/tx/${row.hash}`} className="table-link" title={row.hash}>{compressAddress(row.hash)}</Link>
        },
        {
            key: 'participants',
            label: t('participants'), // New label for combined From/To
            render: (row) => (
                <div>
                    <div className="tx-participant">From: <Link to={`/address/${row.from}`} className="table-link" title={row.from}>{compressAddress(row.from)}</Link></div>
                    <div className="tx-participant">To: <Link to={`/address/${row.to}`} className="table-link" title={row.to}>{compressAddress(row.to)}</Link></div>
                </div>
            )
        },
        {
            key: 'blockNumber',
            label: t('block_number'),
            render: (row) => <Link to={`/block/${parseInt(row.blockNumber, 16)}`} className="table-link">{parseInt(row.blockNumber, 16)}</Link>
        },
        {
            key: 'value',
            label: t('value'),
            render: (row) => {
                if (row.type === 'token_transfer' && row.tokenTransfer) {
                    const token = tokenMap[row.tokenTransfer.symbol];
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {row.tokenTransfer.valueFormatted}{' '}
                            {token && <img src={token.logoURI} alt={token.symbol} style={{ width: '16px', height: '16px', verticalAlign: 'middle' }} />}
                            {row.tokenTransfer.symbol}
                        </div>
                    );
                }
                const krossToken = tokenMap['KROSS'];
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {formatHexValue(row.value)}{' '}
                        {krossToken && <img src={krossToken.logoURI} alt="KROSS" style={{ width: '16px', height: '16px', verticalAlign: 'middle' }} />}
                        KROSS
                    </div>
                );
            }
        },
        {
            key: 'fee',
            label: t('fee'),
            render: (row) => <span>{formatGasToEther(row.gasUsed)}</span>
        },
        {
            key: 'timestamp',
            label: t('timestamp'),
            render: (row) => <span>{getTimeAgo(row.timestamp)}</span>
        },
    ];

    const trendingTokens = [
        tokenMap['KROSS'],
        tokenMap['USDT']
    ].filter(Boolean); // Filter out undefined if a token isn't found

    return (
        <div className="dashboard-page">
            <div className="announcement-banner">
                <p>📢 Announcements: Rating Rules on KROSS  (2025-06-24)</p>
                <span className="close-button">✕</span>
            </div>

            <div className="search-trending-section">
                <div className="search-container-large" style={{ display: 'flex', gap: '10px', justifyContent: 'center', margin: '20px 0' }}>
                    <input
                        type="text"
                        placeholder="Search by Account / Txn Hash / Block"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            width: '300px',
                            borderRadius: '6px',
                            border: '1px solid #ccc'
                        }}
                    />
                    <button className="search-icon" onClick={handleSearch} style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}>
                        🔍
                    </button>
                </div>

                <div className="trending-search">
                    <span>Trending Search:</span>
                    {trendingTokens.map(token => (
                        <span key={token.symbol} className="tag" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            {token.logoURI && <img src={token.logoURI} alt={token.symbol} style={{ width: '16px', height: '16px', verticalAlign: 'middle' }} />}
                            {token.symbol}
                        </span>
                    ))}
                </div>
            </div>

            <div className="dashboard-section-wrapper">
                <div className="stats-grid">
                    <div className="main-stats">
                        <Card title={t('total_accounts')} className="stat-card">
                            <div className="stat-value">316,094,289</div>
                            <div className="stat-change green">+296,544</div>
                        </Card>
                        <Card title={t('total_value_locked')} className="stat-card">
                            <div className="stat-value">$21,756,592,959</div>
                            <div className="stat-change red">-0.08%</div>
                        </Card>
                        <Card title="KRSS" className="stat-card-trx">
                            <div className="trx-header">
                                {tokenMap['KROSS'] && <img src={tokenMap['KROSS'].logoURI} alt="KRSS" className="trx-icon" style={{ width: '24px', height: '24px', verticalAlign: 'middle' }} />}
                                <div className="trx-price">$0.12712 <span className="red">-0.37%</span></div>
                            </div>
                            <div className="trx-volume">Volume 24h: $452.2M</div>
                            {/* <div className="trx-chart"> */}
                            {/* Placeholder for chart */}
                            {/* {tokenMap['KROSS'] && <img src={tokenMap['KROSS'].logoURI} alt="KRSS Chart" style={{ width: '24px', height: '24px', verticalAlign: 'middle' }} />}
                            </div> */}
                        </Card>
                        <Card title={t('total_transactions')} className="stat-card">
                            <div className="stat-value">10,754,756,608</div>
                            <div className="stat-change green">+579,000</div>
                        </Card>
                        <Card title={t('total_transfer_volume')} className="stat-card">
                            <span>Valuation($)</span>
                            <div className="stat-value">$2880000000</div>
                        </Card>
                        <Card title={t('total_supply')} className="stat-card-supply">
                            <div className="supply-item">
                                <span>Supply (KROSS)</span>
                                <span>144,00,000,0</span>
                            </div>
                            {/* <div className="supply-item">
                                <span>Total Staked</span>
                                <span>44,202,140,998</span>
                            </div> */}
                        </Card>
                    </div>
                    <div className="ad-banner">
                        <img src="https://tronscan.org/static/media/boost-banner.d21744b.png" alt="Boost ETF Approval" />
                    </div>
                </div>
            </div>

            {/* <div className="dashboard-section-wrapper"> */}
            {/* <div className="dashboard-sections"> */}
            <div className="blocks-section">
                <div className="section-header">
                    <h2>{t('blocks')}</h2>
                    <Link to="/blocks" className="view-more">More {'>'}</Link>
                </div>
                <div className="blocks-grid">
                    {loadingBlocks ? (
                        <p>{t('loading_blocks')}</p>
                    ) : errorBlocks ? (
                        <p className="error-message">{errorBlocks}</p>
                    ) : latestBlocks && latestBlocks.length > 0 ? (
                        latestBlocks.map((block, index) => (
                            <Card key={index} className="block-card">
                                    <div className="block-header">
                                        <Link to={`/block/${block.blockNumber}`} className="block-number-link">#{parseInt(block.blockNumber, 16)}</Link>
                                        <Link
                                            to={`/block/${block.hash}`}
                                            className="hash-link"
                                            title={block.hash}
                                        >
                                            {shortHash(block.hash)}
                                        </Link>
                                    </div>
                                    <div className="timestamp">{blockAges[index]}</div>
                                    <div className="block-stats">
                                        <div className="stat-item">
                                            <span className="icon">📦</span>
                                            <span className="value">{block.txCount} KROSS</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="icon">👤</span>
                                            <span className="value">{block.confirmations}</span>
                                        </div>
                                        <div className="stat-item">
                                            <span className="icon">🔥</span>
                                            <span className="value">{block.gasUsed} KROSS</span>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <p>{t('no_blocks_found')}</p>
                        )}
                </div>

            </div>
            {/* </div> */}
            {/* <div className="dashboard-sections"> */}
            <div className="transactions-section">
                <div className="section-header">
                    <h2>{t('transactions')}</h2>
                    <Link to="/transactions" className="view-more">More {'>'}</Link>
                </div>
                <div className="transactions-content">
                    {errorTransactions ? (
                        <p className="error-message">{errorTransactions}</p>
                    ) : latestTransactions && latestTransactions.length > 0 ? (
                        <Table headers={transactionHeaders} data={latestTransactions.filter(tx => ['transfer', 'contract_deployment', 'token_transfer', 'contract_call'].includes(tx.type))} rowKey="hash" />
                    ) : (
                        <p>{t('no_transactions_found')}</p>
                    )}
                    <div className="transactions-chart-placeholder">
                        <TransactionChart />
                    </div>
                </div>
            </div>
        </div>
        // </div>
        // </div>
    );
};

export default Dashboard;
