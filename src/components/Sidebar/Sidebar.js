import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isLoggedIn, onLogout, onShowLogin }) => {
    const navLinks = [
        { to: "/students", icon: "👨‍🎓", text: "Sinh viên" },
        { to: "/teachers", icon: "👨‍🏫", text: "Giảng viên" },
        { to: "/classes", icon: "📚", text: "Lớp học" },
        { to: "/Faculties", icon: "🏛️", text: "Khoa" },
        { to: "/subjects", icon: "📖", text: "Môn học" },
        { to: "/grades", icon: "💯", text: "Điểm số" },
        { to: "/tuition", icon: "💰", text: "Học phí" },
    ];

    return (
        <div className="sidebar">
            <nav>
                <ul>
                    <li><Link to="/"><span className="menu-icon">🏠</span> Trang chủ</Link></li>
                    {navLinks.map((link) => (
                        <li key={link.to} className={!isLoggedIn ? 'disabled-link' : ''}>
                            <Link
                                to={link.to}
                                onClick={(e) => {
                                    if (!isLoggedIn) {
                                        e.preventDefault();
                                    }
                                }}
                            >
                                <span className="menu-icon">{link.icon}</span> {link.text}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="sidebar-bottom">
                {isLoggedIn ? (
                    <button onClick={onLogout}>Đăng xuất</button>
                ) : (
                    <button onClick={onShowLogin}>Đăng nhập</button>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
