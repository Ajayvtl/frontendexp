// instructions: These instructions should not be deleted, modified, or edited. Follow the work according to these instructions.
// This file defines the Block Details page component.

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/Card';
import Table from '../components/Table';
import { formatHash, formatTimestamp } from '../utils/formatters';
import { FaLink, FaQuestionCircle } from 'react-icons/fa'; // Importing icons
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const BlockDetails = () => {
    const { id } = useParams(); // Block number or hash
    const navigate = useNavigate(); // Initialize navigate
    const [blockData, setBlockData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlockDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/blocks/${id}`);
                const result = await response.json();
                if (result.success) {
                    setBlockData(result.data);
                } else {
                    setError(result.message);
                }
            } catch (err) {
                setError("Failed to fetch block details.");
                console.error("Error fetching block details:", err);
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
        if (!isNaN(currentBlockNumber)) {
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
        { label: 'Block Hash', value: formatHash(blockData.hash) },
        { label: 'Time', value: formatTimestamp(blockData.timestamp) },
        { label: 'Block Size', value: `${blockData.size + 300} Bytes` },
        { label: 'Status', value: `CONFIRMED by over ${blockData.confirmations} blocks` },
        { label: 'Confirm By', value: `By over ${blockData.confirmations} blocks` }, // Formatted for consistency
        { label: 'Parent Block Hash', value: formatHash(blockData.parentHash) },
    ];

    const transactionOverviewData = [
        { label: 'Transaction', value: String(blockData.txCount) }, // Ensure 0 is displayed
        { label: 'Kross Transaction', value: String(blockData.coinTransactionsCount) },
        { label: 'Contract', value: String(blockData.contractTransactionsCount) },
    ];

    const totalConsumptionData = [
        { label: 'Network Status', value: 'Healthy' },
        { label: 'Workers', value: String(blockData.confirmations) }, // Ensure 0 is displayed
        { label: 'Time', value: '15 Sec' },
    ];


    return (
        <div className="block-details-page">
            <div className="block-details-header">
                <h1 className="block-details-title">Block Details</h1>
            </div>

            <div className="block-details-content">
                <div className="block-main-info">
                    <Card>
                        <div className="block-header-section">
                            <span className="block-icon"><FaLink /></span> {/* Link icon for block */}
                            <h2 className="block-number-display">Block #{blockData.blockNumber}</h2>
                            <span className="producer-info">KROSS Network</span> {/* Static for now */}
                            <div className="navigation-arrows">
                                <button onClick={handlePrevBlock}>{'<'}</button>
                                <button onClick={handleNextBlock}>{'>'}</button>
                            </div>
                        </div>
                        <div className="block-info-grid">
                            {blockDetailsData.map((item, index) => (
                                <div className="info-item" key={index}>
                                    <span className="info-label"><FaQuestionCircle className="info-icon" /> <span>{item.label}:</span></span> {/* Info icon */}
                                    <span className="info-value">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="block-side-info">
                    <Card title="Transaction Overview">
                        <div className="overview-list">
                            {transactionOverviewData.map((item, index) => (
                                <div className="overview-item" key={index}>
                                    <span className="overview-label">{item.label}</span>
                                    <span className="overview-value-container">
                                        <span className="overview-value">{item.value}</span>
                                        {/* Progress bar only for Transaction Overview */}
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
                            {totalConsumptionData.map((item, index) => (
                                <div className="consumption-item" key={index}>
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
                    <Table headers={transactionHeaders} data={blockData.allTransactions} rowKey="hash" />
                ) : (
                    <p className="no-transactions-message">No transactions in this block.</p>
                )}
            </Card>
        </div>
    );
};

export default BlockDetails;
