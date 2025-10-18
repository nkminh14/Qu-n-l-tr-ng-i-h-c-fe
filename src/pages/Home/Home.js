import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

const Home = () => {
    const features = [
        { title: "Quản lý Sinh viên", desc: "Thêm, sửa, xóa và xem thông tin sinh viên.", link: "/students" },
        { title: "Quản lý Giảng viên", desc: "Theo dõi danh sách và bộ môn của giảng viên.", link: "/teachers" },
        { title: "Quản lý Lớp học", desc: "Tổ chức lớp học và danh sách sinh viên.", link: "/classes" },
        { title: "Quản lý Khoa", desc: "Thông tin các khoa trong trường.", link: "/departments" },
        { title: "Quản lý Môn học", desc: "Thêm và chỉnh sửa thông tin môn học.", link: "/subjects" },
        { title: "Quản lý Điểm", desc: "Theo dõi và cập nhật điểm số sinh viên.", link: "/grades" },
        { title: "Quản lý Học phí", desc: "Theo dõi học phí của sinh viên.", link: "/tuition" },
    ];

    return (
        <div className="home-container">
            <div class="welcome-box">
                <div class="welcome-section">
                    <h1>Chào mừng đến với Website quản lý trường đại học</h1>
                    <p>Hệ thống giúp quản lý toàn diện thông tin sinh viên, giảng viên và các hoạt động học tập.</p>
                </div>
            </div>

            <div className="cards-container">
                {features.map((f, index) => (
                    <div key={index} className="feature-card">
                        <h3>{f.title}</h3>
                        <p>{f.desc}</p>
                        <Link to={f.link} className="feature-btn">Xem chi tiết</Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
