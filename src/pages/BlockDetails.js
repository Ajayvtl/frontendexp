/* eslint-disable no-undef */
// instructions: These instructions should not be deleted, modified, or edited. Follow the work according to these instructions.
// This file defines the Block Details page component.

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { FaLink, FaQuestionCircle, FaRegCopy, FaArrowLeft, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import tokenListData from '../data/tokenlist.json';
import { getBlockByNumber, getBlockByHash, getLatestBlockNumber } from '../kross'; // Import getBlockByNumber and getLatestBlockNumber from kross.js

const KROSS_DECIMALS = 18;

// Helper to format hex value to a readable number string
const formatHexValue = (hex, decimals = KROSS_DECIMALS) => {
  if (!hex) return '0';
  const number = BigInt(hex);
  const divisor = BigInt(10) ** BigInt(decimals);
  // Format with high precision and remove trailing zeros
  return (Number(number) / Number(divisor)).toFixed(6).replace(/\.?0+$/, '');
};


// Token map
const tokenMap = {};
tokenListData.tokens.forEach(token => {
    tokenMap[token.address.toLowerCase()] = token;
    tokenMap[token.symbol] = token;
});
const getTokenDetails = (symbolOrAddress) => {
    if (!symbolOrAddress) return null;
    return tokenMap[symbolOrAddress.toLowerCase()] || tokenMap[symbolOrAddress];
};
const shorten = (str, start = 6, end = 4) =>
    !str ? '' :
        str.length > start + end + 3
            ? str.slice(0, start) + '...' + str.slice(-end)
            : str;

// Responsive address/hash with copy
const CopyButton = ({ value }) => (
    <button
        className="copy-btn"
        onClick={() => navigator.clipboard.writeText(value)}
        style={{
            background: 'none', border: 'none', cursor: 'pointer', marginLeft: 3, padding: 0
        }}
        title="Copy"
    >
        <FaRegCopy style={{ fontSize: 14, color: '#888' }} />
    </button>
);
const ResponsiveAddress = ({ value }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        <span className="full-address">{value}</span>
        <span className="short-address">{shorten(value)}</span>
        <CopyButton value={value} />
    </span>
);
const VerifiedIcon = ({ verified }) =>
    verified
        ? <FaCheckCircle style={{ color: '#18C964', marginLeft: 4 }} title="Verified" />
        : <span style={{
            display: 'inline-block',
            width: 14, height: 14, marginLeft: 4, background: '#FFA500', borderRadius: '50%'
        }} title="Unverified" />;

const TokenLogo = ({ token, size = 16 }) =>
    token && token.logoURI ? (
        <img src={token.logoURI} alt={token.symbol}
            style={{
                width: size, height: size, verticalAlign: 'middle', borderRadius: '50%',
                marginRight: 3, background: '#fff', objectFit: 'contain'
            }} />
    ) : (
        <span style={{
            width: size, height: size, display: 'inline-block', verticalAlign: 'middle', background: '#eee', borderRadius: '50%'
        }} />
    );

// Unified value rendering
const renderValueCell = (tx) => {
    if (tx.type === 'token_transfer' && tx.tokenTransfer) {
        const token = getTokenDetails(tx.tokenTransfer.contract) || getTokenDetails(tx.tokenTransfer.symbol);
        const isVerified = !!token;
        return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <TokenLogo token={token} size={15} />
                <span style={{ fontWeight: 600 }}>{tx.tokenTransfer.valueFormatted}</span>
                <span>{tx.tokenTransfer.symbol}</span>
                <VerifiedIcon verified={isVerified} />
            </span>
        );
    }
    // Native transfer or others
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            <TokenLogo token={getTokenDetails("KROSS") || getTokenDetails("0x0000000000000000000000000000000000000000")} size={15} />
            <span style={{ fontWeight: 600 }}>{formatHexValue(tx.value)}</span> KROSS
            <VerifiedIcon verified={true} />
        </span>
    );
};

const BlockDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blockData, setBlockData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [latestBlockNumber, setLatestBlockNumber] = useState(null);

    useEffect(() => {
        const fetchLatestBlock = async () => {
            try {
                const latest = getLatestBlockNumber();
                setLatestBlockNumber(latest);
            } catch (err) {
                console.error("Failed to fetch latest block number:", err);
            }
        };

        fetchLatestBlock();
        const fetchBlockDetails = async () => {
            try {
                setLoading(true);
                let result;
                // Check if the ID is a hash or a number
                if (id.startsWith('0x') && id.length === 66) {
                    result = getBlockByHash(id);
                } else {
                    result = getBlockByNumber(id, true);
                }

                if (result.success) {
                    setBlockData(result.data);
                } else {
                    setError(result.message);
                }
            } catch (err) {
                setError("Failed to fetch block details.");
            } finally {
                setLoading(false);
            }
        };

        fetchBlockDetails();
    }, [id]);

    const handlePrevBlock = () => {
        const currentBlockNumber = parseInt(blockData.blockNumber, 10);
        if (!isNaN(currentBlockNumber) && currentBlockNumber > 0) {
            navigate(`/block/${currentBlockNumber - 1}`);
        }
    };

    const handleNextBlock = () => {
        const currentBlockNumber = parseInt(blockData.blockNumber, 10);
        const latestBlockNumber = getLatestBlockNumber();
        if (!isNaN(currentBlockNumber) && currentBlockNumber < latestBlockNumber) {
            navigate(`/block/${currentBlockNumber + 1}`);
        }
    };

    if (loading) return <p>Loading block details...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!blockData) return <p>No block data found.</p>;

    const transactionHeaders = [
        { key: 'hash', label: 'TxID' },
        { key: 'from', label: 'From' },
        { key: 'to', label: 'To' },
        { key: 'value', label: 'Value' },
        { key: 'fee', label: 'Fee' },
        { key: 'timestamp', label: 'Time' },
    ];

    const blockDetailsData = [
        {
            label: 'Block Hash',
            value: <ResponsiveAddress value={blockData.hash} />
        },
        {
            label: 'Time',
            value: new Date(blockData.timestamp * 1000).toLocaleString(),
        },
        {
            label: 'Block Size',
            value: `${blockData.size + 300} Bytes`
        },
        {
            label: 'Status',
            value: `CONFIRMED by over ${blockData.confirmations} blocks`
        },
        {
            label: 'Confirm By',
            value: `By over ${blockData.confirmations} blocks`
        },
        {
            label: 'Parent Block Hash',
            value: <ResponsiveAddress value={blockData.parentHash} />
        }
    ];

    const transactionOverviewData = [
        { label: 'Transaction', value: String(blockData.txCount) },
        { label: 'Kross Transaction', value: String(blockData.coinTransactionsCount) },
        { label: 'Contract', value: String(blockData.contractTransactionsCount) },
    ];

    const totalConsumptionData = [
        { label: 'Network Status', value: 'Healthy' },
        { label: 'Workers', value: String(blockData.confirmations) },
        { label: 'Time', value: '15 Sec' },
    ];

    // Table rendering with advanced value and address logic
    const TransactionTable = ({ headers, data }) => (
        <div className="transaction-table-scroll">
            <table className="app-table">
                <thead>
                    <tr>
                        {headers.map(h => <th key={h.key}>{h.label}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {data.map(tx => (
                        <tr key={tx.hash}>
                            <td><ResponsiveAddress value={tx.hash} /></td>
                            <td><ResponsiveAddress value={tx.from} /></td>
                            <td><ResponsiveAddress value={tx.to} /></td>
                            <td>{renderValueCell(tx)}</td>
                            <td>{tx.fee ? `${tx.fee} Gas` : (tx.gasUsed ? `${tx.gasUsed} Gas` : '--')}</td>
                            <td>{tx.timestamp ? (new Date(tx.timestamp * 1000).toLocaleString()) : '--'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="block-details-page">
            <div className="block-details-header">
                <h1 className="block-details-title">Block Details</h1>
            </div>

            <div className="block-details-content">
                <div className="block-main-info">
                    <Card>
                        <div className="block-header-section">
                            <span className="block-icon"><FaLink /></span>
                            <h2 className="block-number-display">Block #{Number(blockData.number)}</h2>
                            <span className="producer-info">KROSS Chain</span>
                            <div className="navigation-arrows">
                                <button onClick={handlePrevBlock} title="Previous Block"><FaArrowLeft /></button>
                                <button
                                    onClick={handleNextBlock}
                                    title="Next Block"
                                    disabled={!latestBlockNumber || blockData.blockNumber >= latestBlockNumber}
                                >
                                    <FaArrowRight />
                                </button>
                            </div>
                        </div>
                        <div className="block-info-grid">
                            {blockDetailsData.map((item, index) => (
                                <div className="info-item" key={index}>
                                    <span className="info-label"><FaQuestionCircle className="info-icon" /> <span>{item.label}:</span></span>
                                    <span className="info-value">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="block-side-info">
                    <Card title="Transaction Overview">
                        <div className="overview-list">
                            {transactionOverviewData.map((item, idx) => (
                                <div className="overview-item" key={idx}>
                                    <span className="overview-label">{item.label}</span>
                                    <span className="overview-value-container">
                                        <span className="overview-value">{item.value}</span>
                                        {['Transaction', 'Kross Transaction', 'Contract'].includes(item.label) && (
                                            <div className="progress-bar"></div>
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card title="Total Consumption">
                        <div className="consumption-list">
                            {totalConsumptionData.map((item, idx) => (
                                <div className="consumption-item" key={idx}>
                                    <span className="consumption-label">{item.label}</span>
                                    <span className="consumption-value">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            <Card title="Transactions in this Block" fullWidth>
                {blockData.allTransactions && blockData.allTransactions.length > 0 ? (
                    <TransactionTable headers={transactionHeaders} data={blockData.allTransactions} />
                ) : (
                    <p className="no-transactions-message">No transactions in this block.</p>
                )}
            </Card>
        </div>
    );
};

export default BlockDetails;
