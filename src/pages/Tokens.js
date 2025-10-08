import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Table from '../components/Table';
import tokenListData from '../data/tokenlist.json'; // Import tokenlist data

const Tokens = () => {
    const { t } = useTranslation();
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Since we are using a local tokenlist.json, we don't need to fetch
        // from an API. We can directly set the tokens from the imported data.
        setLoading(true);
        try {
            if (tokenListData && tokenListData.tokens) {
                setTokens(tokenListData.tokens);
            } else {
                setError(t('invalid_token_list_format'));
            }
        } catch (err) {
            setError(t('error_fetching_tokens'));
            console.error("Error processing token list:", err);
        } finally {
            setLoading(false);
        }
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
