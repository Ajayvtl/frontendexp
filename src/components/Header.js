// instructions: These instructions should not be deleted, modified, or edited. Follow the work according to these instructions.
// This file defines the Header component for the frontend UI.

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const navLinks = [
        { path: '/', label: 'Home' },
        { path: '/swap', label: 'Swap' },
        { path: '/blocks', label: 'Blockchain' },
        { path: '/data', label: 'Data' },
        // { path: '/tron-ecosystem', label: 'TRON Ecosystem' },
        { path: '/developer-hub', label: 'Developers' },
        // { path: '/more', label: 'More' },
        // { path: '/sun-pump-mine', label: 'SunPump Mine' },
    ];

const handleSearch = async (e) => {
    e.preventDefault();
    const query = searchTerm.trim();

    if (!query) return;

    if (query.startsWith('0x')) {
        if (query.length === 42) {
            navigate(`/address/${query}`);
        } else if (query.length === 66) {
            try {
                const res = await fetch(`/api/block/${query}`);
                if (res.ok) {
                    navigate(`/block/${query}`);
                } else {
                    navigate(`/tx/${query}`);
                }
            } catch {
                navigate(`/tx/${query}`); // fallback
            }
        } else {
            alert("Invalid hash length");
        }
    } else if (!isNaN(query)) {
        navigate(`/block/${query}`); // block number
    } else {
        alert("Unsupported search term");
    }
};


    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header className="app-header">
            <div className="header-left">
                <div className="logo">
                    <img src="/assets/images/kross-logo.png" alt="Kross Chain" />
                </div>
                <nav className={`main-nav ${isMobileMenuOpen ? 'open' : ''}`}>
                    <ul>
                        {navLinks.map((link) => (
                            <li key={link.path}>
                                <Link to={link.path} onClick={() => setIsMobileMenuOpen(false)}>{link.label}</Link>
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
                <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                    ☰
                </button>
            </div>
        </header>
    );
};

export default Header;
