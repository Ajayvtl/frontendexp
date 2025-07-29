// instructions: These instructions should not be deleted, modified, or edited. Follow the work according to these instructions.
// This file defines the Transaction Details page component.

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { FaQuestionCircle, FaCheckCircle, FaCopy } from 'react-icons/fa';
import tokenListData from '../data/tokenlist.json';
import '../styles/Details.css';

const tokenMap = {};
tokenListData.tokens.forEach(token => {
    tokenMap[token.address.toLowerCase()] = token;
    tokenMap[token.symbol] = token;
});
const ResponsiveAddress = ({ value, copy = true }) => (
    <span className="responsive-address" style={{ display: 'inline-flex', alignItems: 'center' }}>
        <span className="full-address">{value}</span>
        <span className="short-address">{shorten(value)}</span>
        {copy && <CopyButton value={value} />}
    </span>
);
// Utility
const shorten = (str, start = 6, end = 4) => {
    if (!str) return '';
    return str.length > start + end + 3
        ? str.slice(0, start) + '...' + str.slice(-end)
        : str;
};

const CopyButton = ({ value }) => (
    <button
        className="copy-btn"
        onClick={() => navigator.clipboard.writeText(value)}
        style={{
            background: 'none', border: 'none', cursor: 'pointer', marginLeft: 5, padding: 0
        }}
        title="Copy"
    >
        <FaCopy style={{ fontSize: 14, color: '#888' }} />
    </button>
);

const VerifiedIcon = ({ verified }) =>
    verified
        ? <FaCheckCircle style={{ color: '#18C964', marginLeft: 4 }} title="Verified" />
        : <FaQuestionCircle style={{ color: 'orange', marginLeft: 4 }} title="Unverified" />;

const TokenLogo = ({ token, size = 18 }) =>
    token && token.logoURI ? (
        <img src={token.logoURI} alt={token.symbol} style={{
            width: size, height: size, verticalAlign: 'middle', borderRadius: '50%', marginRight: 4, background: '#fff', objectFit: 'contain'
        }} />
    ) : (
        <span style={{
            width: size, height: size, display: 'inline-block', verticalAlign: 'middle', background: '#eee', borderRadius: '50%'
        }} />
    );

const getTokenDetails = (symbolOrAddress) => {
    if (!symbolOrAddress) return null;
    return tokenMap[symbolOrAddress.toLowerCase()] || tokenMap[symbolOrAddress];
};

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
                setError(null);
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/transactions/${hash}`);
                const result = await response.json();
                if (result.success) {
                    setTransactionData(result.data);
                } else {
                    setError(result.message);
                }
            } catch (err) {
                setError("Failed to fetch transaction details.");
            } finally {
                setLoading(false);
            }
        };
        fetchTransactionDetails();
    }, [hash]);

    if (loading) return <p>Loading transaction details...</p>;
    if (error) return <p className="error-message">Error: {error}</p>;
    if (!transactionData) return <p>No transaction data found.</p>;

    const isTokenTransfer = transactionData.type === 'token_transfer' && transactionData.tokenTransfer;
    const displayValue = isTokenTransfer ? transactionData.tokenTransfer.valueFormatted : transactionData.value;
    const displaySymbol = isTokenTransfer ? transactionData.tokenTransfer.symbol : 'KROSS';
    const displayFrom = isTokenTransfer ? transactionData.tokenTransfer.from : transactionData.from;
    const displayTo = isTokenTransfer ? transactionData.tokenTransfer.to : transactionData.to;
    const contractAddr = isTokenTransfer
        ? transactionData.tokenTransfer.contract
        : transactionData.contractAddress || '0x0000000000000000000000000000000000000000';
    const token = getTokenDetails(isTokenTransfer ? contractAddr : displaySymbol) || getTokenDetails(contractAddr);

    // Call Method
    let callMethodText = '';
    let isMethodVerified = false;
    if (transactionData.type === 'transfer') {
        callMethodText = 'Kross Transfer';
        isMethodVerified = true;
    } else if (transactionData.type === 'token_transfer' && transactionData.tokenTransfer) {
        callMethodText = `${transactionData.tokenTransfer.symbol} Transfer`;
        isMethodVerified = !!getTokenDetails(transactionData.tokenTransfer.contract);
    } else if (transactionData.type === 'contract_call' || transactionData.type === 'contract_deployment') {
        callMethodText = 'Contract Creation';
        isMethodVerified = !!getTokenDetails(transactionData.contractAddress);
    }

    // Render Token/Value
    const renderTokenWithLogoAndVerification = (symbol, value, addressOrSymbol) => {
        const token = getTokenDetails(addressOrSymbol || symbol);
        const isVerified = !!token;
        return (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {token && <TokenLogo token={token} size={16} />}
                <span style={{ fontWeight: 600, marginRight: 2 }}>{value}</span>
                <span>{symbol}</span>
                <VerifiedIcon verified={isVerified} />
            </span>
        );
    };

    // Detail Row
    const DetailItem = ({ label, children, className }) => (
        <div className={`detail-item ${className || ''}`}>
            <span className="detail-label">{label}:</span>
            <span className="detail-value">{children}</span>
        </div>
    );

    return (
        <div className="transaction-details-page details-page">
            <div className="page-header details-header-section">
                <h1>Transaction</h1>
                <p>
                    <span className="secondary-text">
                        <ResponsiveAddress value={displayFrom} />
                    </span>
                    <span className="primary-text"> transferred </span>
                    <span className="primary-text bold">
                        {renderTokenWithLogoAndVerification(displaySymbol, displayValue, contractAddr)}
                    </span>
                    <span className="primary-text"> to </span>
                    <span className="secondary-text">
                        <ResponsiveAddress value={displayTo} />
                    </span>
                </p>
            </div>

            <Card>
                <DetailItem label="Hash">
                    <span><ResponsiveAddress value={transactionData.hash} /></span>
                </DetailItem>
                <DetailItem label="Call method">
                    {callMethodText} {renderTokenWithLogoAndVerification(displaySymbol, displayValue, contractAddr)}
                </DetailItem>
                <DetailItem label="Result">
                    <span className={`status-${transactionData.status?.toLowerCase()}`}>{transactionData.status || 'SUCCESSFUL'}</span>
                </DetailItem>
                <DetailItem label="Block & Time">
                    <a href={`/blocks/${transactionData.blockNumber}`}>{transactionData.blockNumber}</a> | {new Date(transactionData.timestamp * 1000).toLocaleString()}
                </DetailItem>
                <DetailItem label="Status">
                    <span className={`status-${transactionData.status?.toLowerCase()}`}>{transactionData.status || 'UNCONFIRMED'}</span>
                    {transactionData.confirmedBy !== undefined ? <> Confirmed by {transactionData.confirmedBy} blocks</> : null}
                </DetailItem>
                <DetailItem label="Fee">
                    {transactionData.gasUsed} KROSS
                </DetailItem>
            </Card>

            <Card>
                <DetailItem label="Owner Address">
                    <ResponsiveAddress value={transactionData.from} />
                </DetailItem>
                <DetailItem label="Contract Address">
                    {transactionData.contractAddress ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{
                                color: getTokenDetails(transactionData.contractAddress) ? '#18C964' : '#FFA500',
                                fontWeight: getTokenDetails(transactionData.contractAddress) ? 'bold' : 'normal'
                            }}>
                                <ResponsiveAddress value={transactionData.contractAddress} />
                            </span>
                            <VerifiedIcon verified={!!getTokenDetails(transactionData.contractAddress)} />
                        </span>
                    ) : 'N/A'}
                </DetailItem>
                {isTokenTransfer && (
                    <DetailItem label="Token Transfer">
                        From {shorten(transactionData.tokenTransfer.from)} <CopyButton value={transactionData.tokenTransfer.from} />
                        To {shorten(transactionData.tokenTransfer.to)} <CopyButton value={transactionData.tokenTransfer.to} />
                        {renderTokenWithLogoAndVerification(displaySymbol, displayValue, contractAddr)}
                    </DetailItem>
                )}
                <DetailItem label="Value">
                    {renderTokenWithLogoAndVerification(displaySymbol, displayValue, contractAddr)}
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
                            <span>{shorten(displayTo)} <CopyButton value={displayTo} /></span>
                        </div>
                        <div className="method-call-row">
                            <span>1</span>
                            <span>_value</span>
                            <span>uint256</span>
                            <span>{renderTokenWithLogoAndVerification(displaySymbol, displayValue, contractAddr)}</span>
                        </div>
                    </div>
                </DetailItem>
            </Card>
            <button className="switch-back-button" onClick={() => navigate(-1)}>
                Switch Back
            </button>
        </div>
    );
};

export default TransactionDetails;
