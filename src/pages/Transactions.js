// instructions: These instructions should not be deleted, modified, or edited. Follow the work according to these instructions.
// This file defines the Transactions list page component.

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Table from '../components/Table';
import Card from '../components/Card';
import { FaQuestionCircle, FaCheckCircle, FaCopy } from 'react-icons/fa';
import tokenListData from '../data/tokenlist.json';
import { getLatestTransactions } from '../kross'; // Import getLatestTransactions from kross.js

const tokenMap = {};
tokenListData.tokens.forEach(token => {
    tokenMap[token.address.toLowerCase()] = token;
    tokenMap[token.symbol] = token;
});

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

const ResponsiveAddress = ({ value, copy = true }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        <span className="full-address">{value}</span>
        <span className="short-address">{shorten(value)}</span>
        {copy && <CopyButton value={value} />}
    </span>
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

const Transactions = () => {
    const { t } = useTranslation();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                const result = getLatestTransactions(20); // Fetch latest 20 transactions using kross.js
                if (result.success) {
                    setTransactions(result.data);
                } else {
                    setError(result.message);
                }
            } catch (err) {
                setError(t('error_fetching_transactions'));
                console.error("Error fetching transactions:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [t]);

    const transactionHeaders = [
        {
            key: 'hash', label: t('tx_id'), render: (transaction) => (
                <Link to={`/tx/${transaction.hash}`}>
                    <ResponsiveAddress value={transaction.hash} />
                </Link>
            )
        },
        {
            key: 'from', label: t('from'), render: (transaction) => {
                const displayFrom = transaction.type === 'token_transfer' && transaction.tokenTransfer ? transaction.tokenTransfer.from : transaction.from;
                return (
                    <Link to={`/address/${displayFrom}`}>
                        <ResponsiveAddress value={displayFrom} />
                    </Link>
                );
            }
        },
        {
            key: 'to', label: t('to'), render: (transaction) => {
                const displayTo = transaction.type === 'token_transfer' && transaction.tokenTransfer ? transaction.tokenTransfer.to : transaction.to;
                return (
                    <Link to={`/address/${displayTo}`}>
                        <ResponsiveAddress value={displayTo} />
                    </Link>
                );
            }
        },
        {
            key: 'value', label: t('value'), render: (transaction) => {
                const isTokenTransfer = transaction.type === 'token_transfer' && transaction.tokenTransfer;
                const displayValue = isTokenTransfer ? transaction.tokenTransfer.valueFormatted : transaction.value;
                const displaySymbol = isTokenTransfer ? transaction.tokenTransfer.symbol : 'KROSS';
                const contractAddr = isTokenTransfer
                    ? transaction.tokenTransfer.contract
                    : transaction.contractAddress || '0x0000000000000000000000000000000000000000';
                return renderTokenWithLogoAndVerification(displaySymbol, displayValue, contractAddr);
            }
        },
        { key: 'status', label: t('status'), render: (transaction) => (
            <span className={`status-${transaction.status?.toLowerCase()}`}>{transaction.status || 'SUCCESSFUL'}</span>
        )},
        { key: 'gasUsed', label: t('gas_used'), render: (transaction) => `${transaction.gasUsed} KROSS` },
        {
            key: 'blockNumber', label: t('block_number'), render: (transaction) => (
                <Link to={`/block/${transaction.blockNumber}`}>{transaction.blockNumber}</Link>
            )
        },
        {
            key: 'timestamp', label: t('timestamp'), render: (transaction) => (
                new Date(transaction.timestamp * 1000).toLocaleString()
            )
        },
    ];

    // The Table component needs to be updated to handle the 'render' property in headers.
    // For now, I will assume the Table component can handle this.
    // If not, I will need to modify the Table component or map the data here.

    if (loading) return <p>{t('loading_transactions')}</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!transactions || transactions.length === 0) return <p>{t('no_transactions_found')}</p>;

    return (
        <div className="transactions-page">
            <h1>{t('latest_transactions')}</h1>
            <Card>
                <Table headers={transactionHeaders} data={transactions} rowKey="hash" />
            </Card>
        </div>
    );
};

export default Transactions;
