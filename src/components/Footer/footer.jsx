import React from 'react';
import './footer.css'; // Make sure to create this CSS file

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>© 2024 Raghav Gupta</p>
                <div className="footer-right">
                    <p className="desktop-text">Based in United States</p>
                    <div className="social-media">
                        {/* Replace '#' with your actual social media links */}
                        <a href='https://www.linkedin.com/in/raghvgupta/' target="_blank" rel="noopener noreferrer">LinkedIn</a>
                        <a href='https://github.com/Gupta-Raghav' target="_blank" rel="noopener noreferrer">Github</a>
                        <a href='https://www.instagram.com/its_rg_/' target="_blank" rel="noopener noreferrer">Instagram</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
