import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-logo">🎓 UniManage</div>
            <ul className="navbar-menu">
                <li><Link to="/">Trang chủ</Link></li>
                <li><Link to="/students">Sinh viên</Link></li>
                <li><Link to="/teachers">Giảng viên</Link></li>
                <li><Link to="/classes">Lớp</Link></li>
                <li><Link to="/departments">Khoa</Link></li>
                <li><Link to="/subjects">Môn học</Link></li>
                <li><Link to="/grades">Điểm</Link></li>
                <li><Link to="/tuition">Học phí</Link></li>
            </ul>
            <div className="navbar-login">
                <Link to="/login">Đăng nhập</Link>
            </div>
        </nav>
    );
};

export default Navbar;
