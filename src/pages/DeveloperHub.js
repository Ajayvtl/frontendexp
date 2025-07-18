import React from 'react';
import '../../src/styles/DeveloperHub.css'; // Import the CSS file

const DeveloperHub = () => {
    return (
        <div className="developer-hub-page">
            <div className="hero-section">
                <div className="hero-content">
                    <h1>The KROSS Developer Hub</h1>
                    <p>
                        Welcome to the KROSS developer hub. You'll find comprehensive guides and documentation
                        to help you start working with KROSS as quickly as possible, as well as support if you get stuck.
                        Let's jump right in!
                    </p>
                    <button className="get-started-button">
                        <span className="icon">📖</span> Get Started
                    </button>
                </div>
            </div>

            <div className="navigation-search-section">
                {/* <div className="nav-left">
                    <span className="dropdown">new1-v1(K... ▼</span>
                    <span className="dropdown">Home ▼</span>
                </div> */}
                <div className="nav-right">
                    <div className="search-box">
                        <span className="search-icon">🔍</span> Search
                        <span className="ctrl-k">CTRL-K</span>
                    </div>
                </div>
            </div>

            <div className="content-sections">
                <div className="content-column">
                    <h2>Introduction</h2>
                    <ul>
                        <li><a href="#">Getting Started</a></li>
                        <li><a href="#">Build a Web3 App</a></li>
                        <li><a href="#">Tokenomics</a></li>
                        <li><a href="#">View More...</a></li>
                    </ul>
                </div>
                <div className="content-column">
                    <h2>KROSS Protocol</h2>
                    <ul>
                        <li><a href="#">Accounts</a></li>
                        <li><a href="#">Resource Model</a></li>
                        <li><a href="#">Super Representatives</a></li>
                        <li><a href="#">View More...</a></li>
                    </ul>
                </div>
                <div className="content-column">
                    <h2>Token Standards</h2>
                    <ul>
                        <li><a href="#">Overview</a></li>
                        <li><a href="#">KROSS</a></li>
                        <li><a href="#">LRS-V2</a></li>
                        <li><a href="#">View More...</a></li>
                    </ul>
                </div>
                <div className="content-column">
                    <h2>Smart Contracts</h2>
                    <ul>
                        <li><a href="#">Introduction</a></li>
                        <li><a href="#">Programming Language</a></li>
                        <li><a href="#">Deployment and Invocation</a></li>
                        <li><a href="#">View More...</a></li>
                    </ul>
                </div>
                <div className="content-column">
                    <h2>Build Node</h2>
                    <ul>
                        <li><a href="#">Deploy A Node</a></li>
                        <li><a href="#">Mainnet Database Snapshots</a></li>
                        <li><a href="#">Toolkit</a></li>
                        <li><a href="#">View More...</a></li>
                    </ul>
                </div>
                <div className="content-column">
                    <h2>DApp Development Guide</h2>
                    <ul>
                        <li><a href="#">DApp Development Tools</a></li>
                        <li><a href="#">Smart Contract Development</a></li>
                        <li><a href="#">DApp Integration with KROSSLinks</a></li>
                        <li><a href="#">View More...</a></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DeveloperHub;
