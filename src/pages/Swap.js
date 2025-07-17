import React, { useState } from 'react';
import { ethers } from 'ethers';
import '../styles/Swap.css';

// Use your uploaded icon here!
const krossLogo = '/assets/images/kross-logo.png'; // replace with your real path
const kusdtLogo = '/assets/images/tokens/kross-usdt.png'; // can be same as kross for demo
const usdtLogo = 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png';

const currencies = [
    { name: 'KROSS', symbol: 'KROSS', logo: krossLogo, decimals: 18 },
    { name: 'Kross USDT', symbol: 'KUSDT', logo: kusdtLogo, decimals: 6 },
    { name: 'USDT', symbol: 'USDT', logo: usdtLogo, decimals: 6 },
];
// Conversion rates (define as needed)
const RATES = {
    'KROSS:USDT': 0.01,
    'KROSS:Kross USDT': 0.01,
    'Kross USDT:USDT': 1,
    'USDT:Kross USDT': 1,
    'USDT:KROSS': 100,
    'Kross USDT:KROSS': 100,
    'KROSS:KROSS': 1,
    'USDT:USDT': 1,
    'Kross USDT:Kross USDT': 1,
};
const KROSS_CHAIN_ID_DEC = 102024;
const KROSS_CHAIN_ID_HEX = '0x18e98';
const KROSS_RPC_URLS = ['http://rpc.kroschain.com', 'http://159.198.79.126'];
const KROSS_USDT_CONTRACT = '0xbcA860752974f2842b8becc2E3592FBaFE441E33';
// Get the conversion rate for any pair
function getRate(from, to) {
    return RATES[`${from.name}:${to.name}`] || 1;
}
const Swap = () => {
    const [fromToken, setFromToken] = useState(currencies[0]);
    const [toToken, setToToken] = useState(currencies[1]);
    const [fromAmount, setFromAmount] = useState('1');
    const [toAmount, setToAmount] = useState('');
    const [walletAddress, setWalletAddress] = useState(null);
    const [balance, setBalance] = useState({ KROSS: 0, 'Kross USDT': 0, USDT: 0.1 });
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [showNetworkPopup, setShowNetworkPopup] = useState(false);
    const [showFromDropdown, setShowFromDropdown] = useState(false);
    const [showToDropdown, setShowToDropdown] = useState(false);
    const [showBusy, setShowBusy] = useState(false);

    // Only filter out the one opposite selected token!
    const getDropdownOptions = (otherToken) => currencies.filter(c => c.name !== otherToken.name);

    const calculateToAmount = (from, to, amount) => {
        if (!amount || isNaN(Number(amount))) return '';
        const rate = getRate(from, to);
        return (parseFloat(amount) * rate).toFixed(6).replace(/\.?0+$/, '');
    };

    React.useEffect(() => {
        setToAmount(calculateToAmount(fromToken, toToken, fromAmount));
    }, [fromToken, toToken, fromAmount]);

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                await provider.send("eth_requestAccounts", []);
                const signer = await provider.getSigner();
                const address = await signer.getAddress();
                setWalletAddress(address);
                setIsWalletConnected(true);

                const network = await provider.getNetwork();
                if (fromToken.name === 'KROSS' && network.chainId !== KROSS_CHAIN_ID_DEC) {
                    setShowNetworkPopup(true);
                    return;
                }

                let krossBal = 0, kusdtBal = 0, usdtBal = 0.1;
                try {
                    krossBal = await provider.getBalance(address);
                    krossBal = ethers.formatEther(krossBal);
                } catch { }
                try {
                    const usdtContract = new ethers.Contract(
                        KROSS_USDT_CONTRACT,
                        ['function balanceOf(address) view returns (uint256)'],
                        provider
                    );
                    kusdtBal = await usdtContract.balanceOf(address);
                    kusdtBal = ethers.formatUnits(kusdtBal, 6);
                } catch { }
                setBalance({
                    KROSS: Number(Number(krossBal).toFixed(4)),
                    'Kross USDT': Number(Number(kusdtBal).toFixed(4)),
                    USDT: Number(Number(usdtBal).toFixed(4))
                });
            } catch (error) {
                alert('Failed to connect wallet!');
            }
        } else {
            alert('Please install MetaMask!');
        }
    };

    const handleFromTokenSelect = (token) => {
        if (token.name === toToken.name) setToToken(getDropdownOptions(token)[0]);
        setFromToken(token);
        setShowFromDropdown(false);
    };

    const handleToTokenSelect = (token) => {
        if (token.name === fromToken.name) setFromToken(getDropdownOptions(token)[0]);
        setToToken(token);
        setShowToDropdown(false);
    };

    const handleInterchange = () => {
        setFromToken(toToken);
        setToToken(fromToken);
    };

    const handleFromAmountChange = (e) => {
        const value = e.target.value.replace(/[^0-9.]/g, '');
        setFromAmount(value);
    };

    const addAndSwitchNetwork = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: KROSS_CHAIN_ID_HEX,
                    chainName: 'Kross Chain',
                    rpcUrls: KROSS_RPC_URLS,
                    nativeCurrency: { name: 'KROSS', symbol: 'KROSS', decimals: 18 }
                }]
            });
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: KROSS_CHAIN_ID_HEX }]
            });
            setShowNetworkPopup(false);
        } catch (err) { alert('Failed to switch network.'); }
    };

    const handleSwap = () => setShowBusy(true);

    React.useEffect(() => {
        if (showBusy) {
            const timer = setTimeout(() => setShowBusy(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [showBusy]);

    return (
        <div className="swap-abstract-bg">
            <div className="swap-bg-shape shape1"></div>
            <div className="swap-bg-shape shape2"></div>
            <div className="swap-bg-shape shape3"></div>
            {showNetworkPopup && (
                <div className="network-popup">
                    <div className="network-popup-content">
                        <h3>Wrong Network</h3>
                        <p>Please connect to the <b>Kross Chain</b> network to continue.</p>
                        <button onClick={addAndSwitchNetwork}>Switch to Kross Chain</button>
                        <button onClick={() => setShowNetworkPopup(false)} className="secondary">Cancel</button>
                    </div>
                </div>
            )}
            {showBusy && (
                <div className="network-popup busy-popup">
                    <div className="network-popup-content busy">
                        <span className="busy-spinner"></span>
                        <h3>Pool is busy</h3>
                        <p>Try again after some time...</p>
                    </div>
                </div>
            )}
            <div className="swap-card">
                <div className="swap-header">
                    <button className="main-action-button active">Swap</button>
                </div>
                <div className="swap-body">
                    <div className="swap-input-container">
                        <div className="swap-input-header">
                            <span>You pay</span>
                            {isWalletConnected &&
                                <span>Balance: {balance[fromToken.name]} {fromToken.symbol}</span>
                            }
                        </div>
                        <div className="swap-input">
                            <input
                                type="text"
                                inputMode="decimal"
                                value={fromAmount}
                                onChange={handleFromAmountChange}
                                placeholder="0.0"
                                autoFocus
                            />
                            <div className="token-selector" onClick={() => setShowFromDropdown(v => !v)}>
                                <img src={fromToken.logo} className="token-logo" alt={fromToken.name} />
                                <span>{fromToken.name}</span>
                                <span className="arrow-down">▼</span>
                            </div>
                            {showFromDropdown && (
                                <div className="dropdown-menu">
                                    {getDropdownOptions(toToken).map(token => (
                                        <div
                                            key={token.name}
                                            className="dropdown-item"
                                            onClick={() => handleFromTokenSelect(token)}
                                        >
                                            <img src={token.logo} className="token-logo" alt={token.name} />
                                            <span>{token.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="swap-arrow" onClick={handleInterchange} title="Interchange tokens">
                        <span className="swap-arrow-icon">⇅</span>
                    </div>
                    <div className="swap-input-container">
                        <div className="swap-input-header">
                            <span>You receive</span>
                            {isWalletConnected &&
                                <span>Balance: {balance[toToken.name]} {toToken.symbol}</span>
                            }
                        </div>
                        <div className="swap-input">
                            <input
                                type="text"
                                value={toAmount}
                                readOnly
                                placeholder="0.0"
                            />
                            <div className="token-selector" onClick={() => setShowToDropdown(v => !v)}>
                                <img src={toToken.logo} className="token-logo" alt={toToken.name} />
                                <span>{toToken.name}</span>
                                <span className="arrow-down">▼</span>
                            </div>
                            {showToDropdown && (
                                <div className="dropdown-menu">
                                    {getDropdownOptions(fromToken).map(token => (
                                        <div
                                            key={token.name}
                                            className="dropdown-item"
                                            onClick={() => handleToTokenSelect(token)}
                                        >
                                            <img src={token.logo} className="token-logo" alt={token.name} />
                                            <span>{token.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="exchange-rate">
                    <span>
                        1 {fromToken.symbol} ≈ {getRate(fromToken, toToken)} {toToken.symbol}
                    </span>
                </div>
                <div className="swap-footer">
                    {isWalletConnected ? (
                        <button className="connect-wallet-button" onClick={handleSwap}>Swap</button>
                    ) : (
                        <button className="connect-wallet-button" onClick={connectWallet}>Connect Wallet</button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Swap;
