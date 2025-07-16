export const compressAddress = (address, startLength = 4, endLength = 3) => {
    if (!address || address.length <= startLength + endLength) {
        return address;
    }
    return `${address.substring(0, startLength)}...${address.substring(address.length - endLength)}`;
};

export const formatHash = (hash) => {
    return compressAddress(hash, 6, 6); // Example: 0x1234...abcd
};

export const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
    return date.toLocaleString(); // Format to local date and time string
};

export const formatGasToEther = (gasUsed) => {
    if (gasUsed === null || gasUsed === undefined) {
        return 'N/A';
    }
    // This is a simplified conversion. A more accurate conversion would require the gas price at the time of the transaction.
    // We'll use a static gas price of 20 Gwei for this example.
    const gasPriceGwei = 20;
    const gasPriceWei = gasPriceGwei * 1e9;
    const feeWei = Number(gasUsed) * gasPriceWei;
    const feeEther = feeWei / 1e18;
    return feeEther.toFixed(6);
};
