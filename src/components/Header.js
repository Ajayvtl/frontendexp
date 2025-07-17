// instructions: These instructions should not be deleted, modified, or edited. Follow the work according to these instructions.
// This file defines the Header component for the frontend UI.

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/swap', label: 'Swap' },
        { path: '/blocks', label: 'Blockchain' },
        { path: '/data', label: 'Data' },
        // { path: '/tron-ecosystem', label: 'TRON Ecosystem' },
        { path: '/developers', label: 'Developers' },
        // { path: '/more', label: 'More' },
        // { path: '/sun-pump-mine', label: 'SunPump Mine' },
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            // Implement search logic here: check if it's a block, tx, or address
            // For now, a simple redirect
            if (searchTerm.startsWith('0x') && searchTerm.length === 66) { // Basic TX hash check
                navigate(`/tx/${searchTerm}`);
            } else if (searchTerm.startsWith('0x') && searchTerm.length === 42) { // Basic Address check
                navigate(`/address/${searchTerm}`); // Assuming an /address route will be added
            } else if (!isNaN(searchTerm)) { // Basic Block number check
                navigate(`/block/${searchTerm}`);
            } else {
                // Fallback or error message
                alert('Invalid search term. Please enter a block number, transaction hash, or address.');
            }
            setSearchTerm('');
        }
    };

    return (
        <header className="app-header">
            <div className="header-left">
                <div className="logo">
                    <img src="/assets/images/kross-logo.png" alt="Kross Chain" />
                </div>
                <nav className="main-nav">
                    <ul>
                        {navLinks.map((link) => (
                            <li key={link.path}>
                                <Link to={link.path}>{link.label}</Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
            <div className="header-right">
                <form onSubmit={handleSearch} className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by Block, Tx, Address..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-button">🔍</button>
                </form>
                <div className="header-icons">
                    <span className="icon">🌐</span> {/* Globe icon for language */}
                    <span className="icon">💡</span> {/* Light/Dark mode toggle */}
                    <span className="icon">🔔</span> {/* Notification icon */}
                    <span className="icon">👤</span> {/* User icon */}
                </div>
                <button className="connect-wallet-button">Connect Wallet</button>
            </div>
        </header>
    );
};

export default Header;
