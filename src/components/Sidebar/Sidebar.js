import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isLoggedIn, onLoginToggle }) => {
    return (
        <div className="sidebar">
            <nav>
                <ul>
                    <li><Link to="/"><span className="menu-icon">🏠</span> Trang chủ</Link></li>
                    <li><Link to="/students"><span className="menu-icon">👨‍🎓</span> Sinh viên</Link></li>
                    <li><Link to="/teachers"><span className="menu-icon">👨‍🏫</span> Giảng viên</Link></li>
                    <li><Link to="/classes"><span className="menu-icon">📚</span> Lớp học</Link></li>
                    <li><Link to="/Faculties"><span className="menu-icon">🏛️</span> Khoa</Link></li>
                    <li><Link to="/subjects"><span className="menu-icon">📖</span> Môn học</Link></li>
                    <li><Link to="/grades"><span className="menu-icon">💯</span> Điểm số</Link></li>
                    <li><Link to="/tuition"><span className="menu-icon">💰</span> Học phí</Link></li>
                </ul>
            </nav>
            <div className="sidebar-bottom">
                {isLoggedIn ? (
                    <button onClick={onLoginToggle}>Đăng xuất</button>
                ) : (
                    <Link to="/login" onClick={onLoginToggle}>Đăng nhập</Link>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
