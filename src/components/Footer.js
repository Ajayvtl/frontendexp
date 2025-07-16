// instructions: These instructions should not be deleted, modified, or edited. Follow the work according to these instructions.
// This file defines the Footer component for the frontend UI.

import React from 'react';

const Footer = () => {
    return (
        <footer className="app-footer">
            <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} Blockchain Explorer. All rights reserved.</p>
                {/* Add static links or social media icons here */}
            </div>
        </footer>
    );
};

export default Footer;
