import React from 'react';
import { useParams } from 'react-router-dom';

const AccountDetails = () => {
    const { address } = useParams();

    return (
        <div className="account-details-page">
            <h1>Account Details</h1>
            <p>Address: {address}</p>
            {/* Further details about the account will be displayed here */}
        </div>
    );
};

export default AccountDetails;
