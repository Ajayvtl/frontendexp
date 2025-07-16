// instructions: These instructions should not be deleted, modified, or edited. Follow the work according to these instructions.
// This file defines the Transaction Details page component.

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { FaQuestionCircle } from 'react-icons/fa';

const TransactionDetails = () => {
    const { hash } = useParams();
    const navigate = useNavigate();
    const [transactionData, setTransactionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTransactionDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/transactions/${hash}`);
                const result = await response.json();
                if (result.success) {
                    setTransactionData(result.data);
                } else {
                    setError(result.message);
                }
            } catch (err) {
                setError("Failed to fetch transaction details.");
                console.error("Error fetching transaction details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactionDetails();
    }, [hash]);

    if (loading) return <p>Loading transaction details...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!transactionData) return <p>No transaction data found.</p>;

    const DetailItem = ({ label, children, className }) => (
        <div className={`detail-item ${className || ''}`}>
            <span className="detail-label">
                <FaQuestionCircle className="help-icon" /> {label}:
            </span>
            <span className="detail-value">{children}</span>
        </div>
    );

    return (
        <div className="transaction-details-page">
            <div className="page-header">
                <h1>Transaction</h1>
                <p>
                    <span className="secondary-text">
                        {transactionData.from}
                    </span>
                    <span className="primary-text"> transferred </span>
                    <span className="primary-text bold">
                        {transactionData.value} {transactionData.token || 'KROSS'}
                    </span>
                    <span className="primary-text"> to </span>
                    <span className="secondary-text">
                        {transactionData.to}
                    </span>
                </p>
            </div>

            <Card>
                <DetailItem label="Hash">
                    {transactionData.hash}
                </DetailItem>
                <DetailItem label="Result">
                    <span className={`status-${transactionData.status?.toLowerCase()}`}>{transactionData.status || 'SUCCESSFUL'}</span>
                </DetailItem>
                <DetailItem label="Block & Time">
                    <a href={`/blocks/${transactionData.blockNumber}`}>{transactionData.blockNumber}</a> | {new Date(transactionData.timestamp * 1000).toLocaleString()}
                </DetailItem>
                <DetailItem label="Status">
                    <span className={`status-${transactionData.status?.toLowerCase()}`}>{transactionData.status || 'UNCONFIRMED'}</span> Confirmed by {transactionData.confirmedBy || 21} blocks
                </DetailItem>
                {/* <DetailItem label="Confirmed SRs">
                    {transactionData.confirmedSRs ? transactionData.confirmedSRs.join(' ') : '18 L Kiln_Staking OKX Earn TronSpark P2P.ORG'}
                </DetailItem> */}
                <DetailItem label="Resources Consumed & Fee">
                    {transactionData.gasUsed} Gas
                </DetailItem>
            </Card>

            <Card>
                <DetailItem label="Owner Address">
                    {transactionData.from}
                </DetailItem>
                <DetailItem label="Contract Address">
                    {transactionData.contractAddress || 'N/A'}
                </DetailItem>
                <DetailItem label="Token Transfer">
                    From {transactionData.from} To {transactionData.to} {transactionData.value} {transactionData.token || 'KROSS'}
                </DetailItem>
                <DetailItem label="Value">
                    {transactionData.trxValue || transactionData.value || 0} KROSS
                </DetailItem>
                <DetailItem label="Method Called">
                    <div className="method-call-table">
                        <div className="method-call-header">
                            <span>#</span>
                            <span>Name</span>
                            <span>Type</span>
                            <span>Data</span>
                        </div>
                        <div className="method-call-row">
                            <span>0</span>
                            <span>_to</span>
                            <span>address</span>
                            <span>{transactionData.to}</span>
                        </div>
                        <div className="method-call-row">
                            <span>1</span>
                            <span>_value</span>
                            <span>uint256</span>
                            <span>{transactionData.value * 1000000}</span>
                        </div>
                    </div>
                </DetailItem>
                <button className="switch-back-button" onClick={() => navigate(-1)}>
                    Switch Back
                </button>
            </Card>
        </div>
    );
};

export default TransactionDetails;
