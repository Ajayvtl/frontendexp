// instructions: These instructions should not be deleted, modified, or edited. Follow the work according to these instructions.
// This file defines the Dashboard page component.

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../components/Card';
import Table from '../components/Table';
import TransactionChart from '../components/TransactionChart'; // Import the new chart component
import { Link } from 'react-router-dom';
import { compressAddress, formatGasToEther } from '../utils/formatters'; // Import the formatter at the top
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
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/blocks?limit=5`); // Fetch latest 5 blocks
                const result = await response.json();
                if (result.success) {
                    setLatestBlocks(result.data);
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
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/transactions`); // Fetch all transactions, not limited to 5
                const result = await response.json();
                if (result.success) {
                    setLatestTransactions(result.data);
                } else {
                    setErrorTransactions(result.message);
                }
            } catch (err) {
                setErrorTransactions(t('error_fetching_transactions'));
                console.error("Error fetching latest transactions:", err);
            }
        };

        const fetchData = () => {
            fetchLatestBlocks();
            fetchLatestTransactions();
        };

        fetchData();
        const interval = setInterval(() => {
            fetchData();
        }, 16000); // refresh every 16 seconds

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
            render: (row) => <Link to={`/block/${row.blockNumber}`} className="table-link">{row.blockNumber}</Link>
        },
        {
            key: 'value',
            label: t('value'),
            render: (row) => {
                if (row.type === 'token_transfer' && row.tokenTransfer) {
                    return (
                        <>
                            {row.tokenTransfer.valueFormatted}{' '}
                            <Link to={`/tokens/${row.contractAddress}`} className="table-link">{row.tokenTransfer.symbol}</Link>
                        </>
                    );
                }
                return `${row.value} KROSS`;
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

    return (
        <div className="dashboard-page">
            <div className="announcement-banner">
                <p>📢 Announcements: Rating Rules on KROSSCAN (2025-06-24)</p>
                <span className="close-button">✕</span>
            </div>

            <div className="search-trending-section">
                <div className="search-container-large">
                    <input type="text" placeholder="Search by Account / Content / Txn Hash / Block" />
                    <button>All <span className="arrow-down">▼</span></button>
                    <button className="search-icon">🔍</button>
                </div>
                <div className="trending-search">
                    <span>Trending Search:</span>
                    <span className="tag">KROSS</span>
                    {/* <span className="tag">USDT</span> */}
                    {/* <span className="tag">SUNUSD</span>
                    <span className="tag">WIN</span>
                    <span className="tag">BTTOLD</span>
                    <span className="tag">JST</span>
                    <span className="tag">More ></span> */}
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
                                <img src="https://tronscan.org/static/media/trx.2d21744b.svg" alt="KRSS" className="trx-icon" />
                                <div className="trx-price">$0.12712 <span className="red">-0.37%</span></div>
                            </div>
                            <div className="trx-volume">Volume 24h: $452.2M</div>
                            <div className="trx-chart">
                                {/* Placeholder for chart */}
                                <img src="https://tronscan.org/static/media/trx-chart.d21744b.svg" alt="KRSS Chart" />
                            </div>
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
                                    <Link to={`/block/${block.blockNumber}`} className="block-number-link">#{block.blockNumber}</Link>
                                    <Link
                                        to={`/txs/${block.hash}`}
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
