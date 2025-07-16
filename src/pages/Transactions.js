// instructions: These instructions should not be deleted, modified, or edited. Follow the work according to these instructions.
// This file defines the Transactions list page component.

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Table from '../components/Table';
import Card from '../components/Card';

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
                const response = await fetch('/api/transactions?limit=20'); // Fetch latest 20 transactions
                const result = await response.json();
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
        { key: 'hash', label: t('tx_id') },
        { key: 'from', label: t('from') },
        { key: 'to', label: t('to') },
        { key: 'value', label: t('value') },
        { key: 'status', label: t('status') },
        { key: 'gasUsed', label: t('gas_used') },
        { key: 'blockNumber', label: t('block_number') },
        { key: 'timestamp', label: t('timestamp') },
    ];

    const handleRowClick = (transaction) => {
        navigate(`/tx/${transaction.hash}`);
    };

    if (loading) return <p>{t('loading_transactions')}</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!transactions || transactions.length === 0) return <p>{t('no_transactions_found')}</p>;

    return (
        <div className="transactions-page">
            <h1>{t('latest_transactions')}</h1>
            <Card>
                <Table headers={transactionHeaders} data={transactions} rowKey="hash" onRowClick={handleRowClick} />
            </Card>
        </div>
    );
};

export default Transactions;
