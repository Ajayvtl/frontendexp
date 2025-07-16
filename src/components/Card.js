// instructions: These instructions should not be deleted, modified, or edited. Follow the work according to these instructions.
// This file defines a reusable Card component for displaying statistics or grouped information.

import React from 'react';

const Card = ({ children, className = '' }) => {
    return (
        <div className={`app-card ${className}`}>
            <div className="card-content">
                {children}
            </div>
        </div>
    );
};

export default Card;
