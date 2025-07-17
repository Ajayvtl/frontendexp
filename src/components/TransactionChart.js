import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

const TransactionChart = () => {
    const { t } = useTranslation();
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAndProcessTransactions = async () => {
            try {
                setLoading(true);
                // const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/transactions?limit=500`);
                // const result = await response.json();

                // Simulate realistic data for last 7 days
                const dailyData = {};
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const date = d.toISOString().slice(0, 10);
                    dailyData[date] = { total: 0, kross: 0, other: 0 };

                    dailyData[date].total = Math.floor(Math.random() * 5000000) + 1000000; // 1M to 6M
                    dailyData[date].kross = Math.floor(Math.random() * dailyData[date].total * 0.4);
                    dailyData[date].other = Math.floor(Math.random() * dailyData[date].total * 0.3);
                }

                const formattedData = Object.keys(dailyData).map(date => ({
                    timestamp: date,
                    Transactions: dailyData[date].total,
                    'KROSS Transfers': dailyData[date].kross,
                    'Other Transfers': dailyData[date].other,
                })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                setChartData(formattedData);
                setError(null);
            } catch (err) {
                setError(t('error_fetching_chart_data'));
                console.error("Error fetching historical transactions for chart:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAndProcessTransactions();
    }, [t]);

    if (loading) return <p>{t('loading_chart_data')}</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (chartData.length === 0) return <p>{t('no_chart_data_found')}</p>;

    // Y-axis upper bound logic...
    const maxTransactionCount = Math.max(...chartData.map(d => d.Transactions));
    let yAxisUpper = 0;
    if (maxTransactionCount > 0) {
        yAxisUpper = Math.ceil(maxTransactionCount / 1000000) * 1000000;
        if (yAxisUpper === 0) yAxisUpper = 1000000;
    } else {
        yAxisUpper = 1000000;
    }
    const yAxisDomain = [0, yAxisUpper];

    return (
        <div style={{ width: '100%', height: 300, fontFamily: 'var(--font-family-global)' }}>
            <h3 style={{ textAlign: 'left', marginLeft: '20px', fontSize: 'var(--font-size-heading-md)', color: 'var(--color-text-primary-light)' }}>{t('transactions_chart_title')}</h3>
            <ResponsiveContainer>
                <LineChart
                    data={chartData}
                    margin={{
                        top: 10, right: 30, left: 10, bottom: 40,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-light)" />
                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={tick => {
                            const [, month, day] = tick.split('-');
                            return `${month}-${day}`;
                        }}
                        interval="preserveStartEnd"
                        tick={{ fontSize: 10, fill: 'var(--color-text-secondary-light)' }}
                    />
                    <YAxis
                        domain={yAxisDomain}
                        tickFormatter={tick => {
                            if (tick >= 1000000) return `${tick / 1000000}M`;
                            if (tick >= 1000) return `${tick / 1000}K`;
                            return tick;
                        }}
                        tick={{ fontSize: 10, fill: 'var(--color-text-secondary-light)' }}
                    />
                    <Tooltip formatter={value => `${value.toLocaleString()}`} />
                    <Legend
                        wrapperStyle={{
                            paddingTop: '10px',
                            fontSize: '12px',
                            display: 'flex',
                            justifyContent: 'center'
                        }}
                        iconType="circle"
                    />
                    <Line type="monotone" dataKey="Transactions" stroke="#60A5FA" strokeWidth={2} dot={false} name={t('total_transactions_chart')} />
                    <Line type="monotone" dataKey="KROSS Transfers" stroke="#EF4444" strokeWidth={2} dot={false} name={t('kross_transfers_chart')} />
                    <Line type="monotone" dataKey="Other Transfers" stroke="#10B981" strokeWidth={2} dot={false} name={t('other_transfers_chart')} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TransactionChart;
