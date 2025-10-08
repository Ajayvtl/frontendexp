// instructions: These instructions should not be deleted, modified, or edited. Follow the work according to these instructions.
// This file defines the Blocks list page component.

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Table from '../components/Table';
import Card from '../components/Card';
import { getLatestBlocks } from '../kross'; // Import getLatestBlocks from kross.js

const Blocks = () => {
    const { t } = useTranslation();
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlocks = async () => {
            try {
                setLoading(true);
                const result = getLatestBlocks(20); // Fetch latest 20 blocks using kross.js
                if (result.success) {
                    setBlocks(result.data);
                } else {
                    setError(result.message);
                }
            } catch (err) {
                setError(t('error_fetching_blocks'));
                console.error("Error fetching blocks:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBlocks();
    }, [t]);

    const blockHeaders = [
        { key: 'blockNumber', label: t('block_number') },
        { key: 'timestamp', label: t('timestamp') },
        { key: 'txCount', label: t('tx_count') },
        { key: 'miner', label: t('miner') },
        { key: 'gasUsed', label: t('gas_used') },
        { key: 'hash', label: t('hash') },
    ];

    const handleRowClick = (block) => {
        navigate(`/block/${block.blockNumber}`);
    };

    if (loading) return <p>{t('loading_blocks')}</p>;
    if (error) return <p className="error-message">{error}</p>;
    if (!blocks || blocks.length === 0) return <p>{t('no_blocks_found')}</p>;

    return (
        <div className="blocks-page">
            <h1>{t('latest_blocks')}</h1>
            <Card>
                <Table headers={blockHeaders} data={blocks} rowKey="blockNumber" onRowClick={handleRowClick} />
            </Card>
        </div>
    );
};

export default Blocks;
