import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/Card'; // Assuming Card component is available and suitable
import { FaLink, FaQuestionCircle, FaRegCopy, FaSearch, FaChevronRight, FaCheckCircle } from 'react-icons/fa'; // Added FaCheckCircle to the import
import tokenListData from '../data/tokenlist.json';
import '../styles/Details.css';

// Token map and helper functions
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

const formatAge = (timestamp) => {
    if (!timestamp) return 'N/A';
    const now = new Date();
    const past = new Date(timestamp * 1000); // Convert seconds to milliseconds
    const seconds = Math.floor((now - past) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
};

const CopyButton = ({ value }) => (
    <button
        className="copy-btn"
        onClick={() => navigator.clipboard.writeText(value)}
        style={{
            background: 'none', border: 'none', cursor: 'pointer', marginLeft: 3, padding: 0
        }}
        title="Copy"
    >
        <FaRegCopy style={{ fontSize: 14, color: 'var(--color-text-secondary-light)' }} />
    </button>
);

const ResponsiveAddress = ({ value }) => (
    <span className="responsive-address" style={{ display: 'inline-flex', alignItems: 'center' }}>
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
const getMostRecentTransactionTime = (transactions) => {
  if (!transactions.length) return null;
  const mostRecent = transactions.reduce((a, b) =>
    a.timestamp > b.timestamp ? a : b
  );
  const now = Date.now() / 1000;
  const diff = now - mostRecent.timestamp;

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};
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
    const nativeToken = getTokenDetails("KROSS") || getTokenDetails("0x0000000000000000000000000000000000000000");
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
            <TokenLogo token={nativeToken} size={15} />
            <span style={{ fontWeight: 600 }}>{tx.value}</span> {nativeToken ? nativeToken.symbol : 'KROSS'}
            <VerifiedIcon verified={true} />
        </span>
    );
};

const AccountDetails = () => {
    const { address } = useParams();
    // Removed useNavigate as it's not used in this component
    const [accountData, setAccountData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('transactions'); // Default active tab
    const [tokenSearchTerm, setTokenSearchTerm] = useState('');

    const displayedTokens = React.useMemo(() => {
        if (!accountData || !accountData.transactions) return [];

        const calculatedBalances = new Map();
        const currentAddressLower = address.toLowerCase();

        accountData.transactions
            .filter(tx => tx.type === 'token_transfer' && tx.tokenTransfer)
            .forEach(tx => {
                const { contract, symbol, name, value,valueFormatted,decimals: txDecimals, from, to } = tx.tokenTransfer;
                if (!contract) return; // Skip if no contract address
                const contractLower = contract.toLowerCase();
                const tokenMeta = getTokenDetails(contract) || getTokenDetails(symbol) || {};
                // const value = parseFloat(String(valueFormatted).replace(/,/g, '')) || 0;

            const decimals = tokenMeta?.decimals != null
                ? parseInt(tokenMeta.decimals)
                : (txDecimals != null ? parseInt(txDecimals) : 18); // fallback

            const parsedValue = parseFloat(value) / Math.pow(10, decimals);
                if (!calculatedBalances.has(contractLower)) {
                    const tokenDetails = getTokenDetails(contract) || { name: name || 'Unknown', symbol: symbol || 'UNK',contractAddress: contract,decimals, balance: 0,};
                    calculatedBalances.set(contractLower, {
                        ...tokenDetails,
                        contractAddress: contract,
                        balance: 0,
                    });
                }

                const tokenData = calculatedBalances.get(contractLower);

                if (to && to.toLowerCase() === currentAddressLower) {
                    tokenData.balance += value;
                }
                if (from && from.toLowerCase() === currentAddressLower) {
                    tokenData.balance -= value;
                }
            });

        return Array.from(calculatedBalances.values()).map(token => ({
        ...token,
        balance: token.balance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: token.decimals > 6 ? 5 : 2,
        }),
        }));
    }, [accountData, address]);

    useEffect(() => {
        const fetchAccountDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/wallet/${address}`);
                const result = await response.json();

                if (result.success) {
                    const transactions = result.data.transactions || [];
                    const tokenTransferPromises = transactions
                        .filter(tx => tx.type === 'token_transfer')
                        .map(tx =>
                            fetch(`${process.env.REACT_APP_API_BASE_URL}/api/transactions/${tx.hash}`)
                                .then(res => res.json())
                                .then(detailResult => {
                                    if (detailResult.success && detailResult.data.tokenTransfer) {
                                        return { ...tx, tokenTransfer: detailResult.data.tokenTransfer };
                                    }
                                    return tx; // Return original tx if fetch fails or no tokenTransfer data
                                })
                                .catch(() => tx) // In case of fetch error, return original tx
                        );

                    const resolvedTransactions = await Promise.all(tokenTransferPromises);

                    // Create a map of resolved transactions for easy lookup
                    const resolvedTxMap = new Map(resolvedTransactions.map(tx => [tx.hash, tx]));

                    // Update the original transactions array with the new data
                    const updatedTransactions = transactions.map(tx =>
                        resolvedTxMap.has(tx.hash) ? resolvedTxMap.get(tx.hash) : tx
                    );

                    setAccountData({ ...result.data, transactions: updatedTransactions });
                } else {
                    setError(result.message || "Failed to fetch account details.");
                }
            } catch (err) {
                setError("Failed to fetch account details. Please check the address or try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchAccountDetails();
    }, [address]);

    // Filter tokens based on search term
    const filteredTokens = displayedTokens.filter(token =>
        token.name?.toLowerCase().includes(tokenSearchTerm.toLowerCase()) ||
        token.symbol?.toLowerCase().includes(tokenSearchTerm.toLowerCase()) ||
        token.contractAddress?.toLowerCase().includes(tokenSearchTerm.toLowerCase())
    ) || [];

    // Filter transactions based on active tab
    const filteredTransactions = accountData?.transactions?.filter(tx => {
        if (activeTab === 'transactions') return tx.type === 'transfer' || tx.type === 'contract_call' || tx.type === 'contract_deployment';
        if (activeTab === 'internal_transfers') return tx.type === 'token_transfer';
        return true; // Default to all if tab is not recognized
    }) || [];

    if (loading) {
        return <div className="account-details-page" style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary-light)' }}>Loading Account Details...</div>;
    }

    if (error) {
        return <div className="account-details-page" style={{ padding: '20px', textAlign: 'center', color: 'var(--color-error)' }}>Error: {error}</div>;
    }

    if (!accountData) {
        return <div className="account-details-page" style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary-light)' }}>No account data found.</div>;
    }

    const { address: accountAddress, balance, creationDate, tokenBalances, transactions } = accountData;
    const nativeToken = getTokenDetails("KROSS") || getTokenDetails("0x0000000000000000000000000000000000000000");
const hasKrossTransfer = transactions.some(tx =>
  tx.type === 'native' &&
  (tx.from === address || tx.to === address)
);
const isActive = hasKrossTransfer;
    return (
        <div className="account-details-page details-page">
            <div className="details-header-section">
                <h1 style={{ fontSize: 'var(--font-size-heading-xl)', marginBottom: '10px', color: 'var(--color-text-primary-light)' }}>Account</h1>
<div className="account-address-info" style={{
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap'
}}>
    <ResponsiveAddress value={accountAddress} />
    
    {isActive ? (
        <button className="add-private-name-btn" style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: 'var(--font-size-table)'
        }}>
            <FaQuestionCircle style={{ fontSize: '14px' }} /> Add a private name
        </button>
    ) : (
        <div style={{
            backgroundColor: '#fff1f0',
            color: '#a8071a',
            border: '1px solid #ffa39e',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: 'var(--font-size-table)',
            fontWeight: 500
        }}>
            🔴 Inactive – Please fund at least <strong>33 KROSS</strong> to activate this account.
        </div>
    )}
</div>

                <div className="account-activity-info" style={{ display: 'flex', gap: '30px', fontSize: 'var(--font-size-table)', color: 'var(--color-text-secondary-light)', flexWrap: 'wrap' }}>
                    <div>
                        <span style={{ color: 'var(--color-text-primary-light)' }}>Recent Activity:</span> {getMostRecentTransactionTime(accountData.transactions) || 'N/A'}
                    </div>
                    <div>
                        <span style={{ color: 'var(--color-text-primary-light)' }}>Created on (UTC):</span> {accountData.creationDate ? new Date(accountData.creationDate).toLocaleString() : 'N/A'}
                    </div>
                </div>
            </div>

            <div className="details-summary-section">
                {/* Net Asset Card */}
                <Card title="Net Asset" className="net-asset-card">
                    <div className="net-asset-content" style={{ padding: '15px 0' }}>
                        <div className="asset-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: 'var(--font-size-table)' }}>
                            <span className="asset-label" style={{ color: 'var(--color-text-secondary-light)' }}>KROSS Available:</span>
                            <span className="asset-value" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'var(--font-weight-medium)' }}>
                                <TokenLogo token={nativeToken} size={15} />
                                {accountData.balance} KROSS
                            </span>
                        </div>
                        <div className="asset-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: 'var(--font-size-table)' }}>
                            <span className="asset-label" style={{ color: 'var(--color-text-secondary-light)' }}>KROSS Staked:</span>
                            <span className="asset-value" style={{ fontWeight: 'var(--font-weight-medium)' }}>0 KROSS</span> {/* Placeholder */}
                        </div>
                        <div className="asset-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: 'var(--font-size-table)' }}>
                            <span className="asset-label" style={{ color: 'var(--color-text-secondary-light)' }}>Transactions:</span>
                            <span className="asset-value" style={{ fontWeight: 'var(--font-weight-medium)' }}>{accountData.transactions?.length || 0}</span>
                        </div>
                    </div>
                </Card>

                {/* Tokens Card */}
                <Card title={`Tokens (${displayedTokens.length})`} className="tokens-card">
                    <div className="tokens-search-container" style={{ marginBottom: '15px' }}>
                        <div className="search-bar" style={{ border: '1px solid var(--color-border-light)', borderRadius: '20px', padding: '5px 10px', display: 'flex', alignItems: 'center', backgroundColor: 'var(--color-background-light)' }}>
                            <FaSearch style={{ color: 'var(--color-text-secondary-light)', marginRight: '8px' }} />
                            <input
                                type="text"
                                placeholder="Search by Token Name / Symbol / Contract Address"
                                value={tokenSearchTerm}
                                onChange={(e) => setTokenSearchTerm(e.target.value)}
                                className="search-input"
                                style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--color-text-primary-light)', padding: '5px', fontSize: 'var(--font-size-table)', width: '100%' }}
                            />
                        </div>
                    </div>
                    <div className="token-list">
                        {filteredTokens.length > 0 ? (
                            filteredTokens.map((token, index) => {
                                const tokenDetails = getTokenDetails(token.contractAddress) || getTokenDetails(token.symbol);
                                const isVerified = !!tokenDetails;
                                return (
                                    <div key={index} className="token-item" style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--color-border-light)' }}>
                                        <TokenLogo token={tokenDetails} size={24} />
                                        <div style={{ marginLeft: '10px', flexGrow: 1 }}>
                                            <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary-light)' }}>
                                                {token.name || 'Unknown Token'} ({token.symbol || 'UNK'})
                                                <VerifiedIcon verified={isVerified} />
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-secondary-light)' }}>
                                                {shorten(token.contractAddress)}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            {/* <div style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary-light)' }}>{token.balance}</div>
                                            <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-secondary-light)' }}>$5.18</div> Placeholder for USD value */}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--color-text-secondary-light)', padding: '20px 0' }}>No tokens found.</div>
                        )}
                    </div>
                    <div className="more-link" style={{ textAlign: 'right', marginTop: '15px' }}>
                        <a href="#" style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            More <FaChevronRight style={{ fontSize: '12px' }} />
                        </a>
                    </div>
                </Card>
            </div>

            {/* Tabs for Transactions, Portfolio, Approval */}
            <div className="details-tabs">
                <div className="tab-headers" style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--color-border-light)', paddingBottom: '10px', marginBottom: '20px' }}>
                    <button
                        className={`tab-header ${activeTab === 'transactions' ? 'active' : ''}`}
                        onClick={() => setActiveTab('transactions')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--font-size-heading-md)', fontWeight: 'var(--font-weight-medium)', color: activeTab === 'transactions' ? 'var(--color-primary)' : 'var(--color-text-secondary-light)', padding: '5px 0' }}
                    >
                        Transactions
                    </button>
                    <button
                        className={`tab-header ${activeTab === 'internal_transfers' ? 'active' : ''}`}
                        onClick={() => setActiveTab('internal_transfers')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--font-size-heading-md)', fontWeight: 'var(--font-weight-medium)', color: activeTab === 'internal_transfers' ? 'var(--color-primary)' : 'var(--color-text-secondary-light)', padding: '5px 0' }}
                    >
                        Internal transfer
                    </button>
                    {/* Add other tabs as needed based on the image/API response */}
                </div>

                <div className="tab-content">
                    {activeTab === 'transactions' && (
                        <div className="transaction-list details-table-container">
                            {filteredTransactions.length > 0 ? (
                                <table className="app-table">
                                    <thead>
                                        <tr>
                                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-secondary-light)', fontSize: 'var(--font-size-table)' }}>Txn Hash</th>
                                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-secondary-light)', fontSize: 'var(--font-size-table)' }}>Block</th>
                                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-secondary-light)', fontSize: 'var(--font-size-table)' }}>Age</th>
                                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-secondary-light)', fontSize: 'var(--font-size-table)' }}>From</th>
                                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-secondary-light)', fontSize: 'var(--font-size-table)' }}>To</th>
                                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-secondary-light)', fontSize: 'var(--font-size-table)' }}>Token</th>
                                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-secondary-light)', fontSize: 'var(--font-size-table)' }}>Value</th>
                                            <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-secondary-light)', fontSize: 'var(--font-size-table)' }}>Txn Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTransactions.map((tx, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                                                <td style={{ padding: '10px 8px', fontSize: 'var(--font-size-table)', color: 'var(--color-primary)' }}>
                                                    <Link to={`/tx/${tx.hash}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                                                        <ResponsiveAddress value={tx.hash} />
                                                    </Link>
                                                </td>
                                                <td style={{ padding: '10px 8px', fontSize: 'var(--font-size-table)', color: 'var(--color-primary)' }}>
                                                    <Link to={`/block/${tx.blockNumber}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>{tx.blockNumber}</Link>
                                                </td>
                                                <td style={{ padding: '10px 8px', fontSize: 'var(--font-size-small)', color: 'var(--color-text-secondary-light)' }}>{formatAge(tx.timestamp)}</td>
                                                <td style={{ padding: '10px 8px', fontSize: 'var(--font-size-table)', color: 'var(--color-primary)' }}>
                                                    <Link to={`/address/${tx.from}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                                                        <ResponsiveAddress value={tx.from} />
                                                    </Link>
                                                </td>
                                                <td style={{ padding: '10px 8px', fontSize: 'var(--font-size-table)', color: 'var(--color-primary)' }}>
                                                    {tx.to ? (
                                                        <Link to={`/address/${tx.to}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                                                            <ResponsiveAddress value={tx.to} />
                                                        </Link>
                                                    ) : <span style={{ color: 'var(--color-text-secondary-light)' }}>Contract Creation</span>}
                                                </td>
                                                <td style={{ padding: '10px 8px', fontSize: 'var(--font-size-table)', color: 'var(--color-text-secondary-light)' }}>
                                                    {tx.type === 'token_transfer' && tx.tokenTransfer ? (
                                                        <>
                                                            <TokenLogo token={getTokenDetails(tx.tokenTransfer.contract) || getTokenDetails(tx.tokenTransfer.symbol)} size={15} />
                                                            {tx.tokenTransfer.symbol}
                                                        </>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                                <td style={{ padding: '10px 8px', fontSize: 'var(--font-size-table)', color: 'var(--color-text-primary-light)' }}>
                                                    {renderValueCell(tx)}
                                                </td>
                                                <td style={{ padding: '10px 8px', fontSize: 'var(--font-size-table)', color: 'var(--color-text-secondary-light)' }}>{tx.type}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{ textAlign: 'center', color: 'var(--color-text-secondary-light)', padding: '20px 0' }}>No transactions found for this account.</div>
                            )}
                        </div>
                    )}
                    {activeTab === 'internal_transfers' && (
                        <div className="transfer-list details-table-container">
                            {/* Similar table structure for transfers */}
                            <table className="app-table">
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-secondary-light)', fontSize: 'var(--font-size-table)' }}>Txn Hash</th>
                                        <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-secondary-light)', fontSize: 'var(--font-size-table)' }}>Block</th>
                                        <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-secondary-light)', fontSize: 'var(--font-size-table)' }}>Age</th>
                                        <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-secondary-light)', fontSize: 'var(--font-size-table)' }}>From</th>
                                        <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-secondary-light)', fontSize: 'var(--font-size-table)' }}>To</th>
                                        <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-secondary-light)', fontSize: 'var(--font-size-table)' }}>Token</th>
                                        <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid var(--color-border-light)', color: 'var(--color-text-secondary-light)', fontSize: 'var(--font-size-table)' }}>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.map((tx, index) => (
                                        <tr key={index} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                                            <td style={{ padding: '10px 8px', fontSize: 'var(--font-size-table)', color: 'var(--color-primary)' }}>
                                                <Link to={`/tx/${tx.hash}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                                                    <ResponsiveAddress value={tx.hash} />
                                                </Link>
                                            </td>
                                            <td style={{ padding: '10px 8px', fontSize: 'var(--font-size-table)', color: 'var(--color-primary)' }}>
                                                <Link to={`/block/${tx.blockNumber}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>{tx.blockNumber}</Link>
                                            </td>
                                            <td style={{ padding: '10px 8px', fontSize: 'var(--font-size-small)', color: 'var(--color-text-secondary-light)' }}>{formatAge(tx.timestamp)}</td>
                                            <td style={{ padding: '10px 8px', fontSize: 'var(--font-size-table)', color: 'var(--color-primary)' }}>
                                                <Link to={`/address/${tx.from}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                                                    <ResponsiveAddress value={tx.from} />
                                                </Link>
                                            </td>
                                            <td style={{ padding: '10px 8px', fontSize: 'var(--font-size-table)', color: 'var(--color-primary)' }}>
                                                {tx.to ? (
                                                    <Link to={`/address/${tx.to}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                                                        <ResponsiveAddress value={tx.to} />
                                                    </Link>
                                                ) : <span style={{ color: 'var(--color-text-secondary-light)' }}>Contract Creation</span>}
                                            </td>
                                            <td style={{ padding: '10px 8px', fontSize: 'var(--font-size-table)', color: 'var(--color-text-secondary-light)' }}>
                                                {tx.type === 'token_transfer' && tx.tokenTransfer ? (
                                                    <>
                                                        <TokenLogo token={getTokenDetails(tx.tokenTransfer.contract) || getTokenDetails(tx.tokenTransfer.symbol)} size={15} />
                                                        {tx.tokenTransfer.symbol}
                                                    </>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                            <td style={{ padding: '10px 8px', fontSize: 'var(--font-size-table)', color: 'var(--color-text-primary-light)' }}>
                                                {renderValueCell(tx)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    {/* Add content for other tabs here */}
                </div>
            </div>

            {/* Placeholder for the banner ad */}
            {/* <div className="banner-ad" style={{ marginTop: '30px', textAlign: 'center' }}>
                <img src="/assets/images/kross-logo.png" alt="Ad Banner" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
            </div> */}
        </div>
    );
};

export default AccountDetails;
