import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <div className="navbar-logo">
                    <img src="/CMCUNIVERSITY-logo-vie9-png-630x104.png" alt="CMC University Logo" /> {/* Placeholder for CMC Logo */}
                </div>
                <div className="slogan-container">
                    <span className="sliding-slogan">"Nơi ươm mầm tri thức, kiến tạo tương lai"</span>
                </div>
            </div>
            <div className="navbar-right">
                <div className="user-info">
                    <span className="user-icon">👤</span> {/* User icon placeholder */}
                    <span className="user-name">ADMIN</span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
