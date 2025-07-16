import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Table from '../components/Table';

const Tokens = () => {
    const { t } = useTranslation();
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTokens = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tokens`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const result = await response.json();
                if (result && result.tokens) {
                    setTokens(result.tokens);
                } else {
                    setError(t('invalid_token_list_format'));
                }
            } catch (err) {
                setError(t('error_fetching_tokens'));
                console.error("Error fetching tokens:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTokens();
    }, [t]);

    const tokenHeaders = [
        { key: 'name', label: t('token_name') },
        { key: 'symbol', label: t('token_symbol') },
        { key: 'address', label: t('token_address') },
        { key: 'decimals', label: t('token_decimals') },
        { key: 'chainId', label: t('token_chain_id') },
        { key: 'logoURI', label: t('token_logo') },
    ];

    return (
        <div className="tokens-page">
            <h2>{t('tokens')}</h2>
            {loading ? (
                <p>{t('loading_tokens')}</p>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : tokens && tokens.length > 0 ? (
                <Table headers={tokenHeaders} data={tokens} rowKey="address" />
            ) : (
                <p>{t('no_tokens_found')}</p>
            )}
        </div>
    );
};

export default Tokens;
