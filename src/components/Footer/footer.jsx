import React from 'react';
import './footer.css'; // Make sure to create this CSS file

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>© 2024 Your Company Name</p>
                <div className="footer-right">
                    <p className="desktop-text">Based in United States</p>
                    <div className="social-media">
                        {/* Replace '#' with your actual social media links */}
                        <a href="#" target="_blank" rel="noopener noreferrer">Facebook</a>
                        <a href="#" target="_blank" rel="noopener noreferrer">Twitter</a>
                        <a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
