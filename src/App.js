import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";

// Các trang tạm thời
const Students = () => <h2 style={{textAlign:'center', marginTop:'40px'}}>Đây là trang Sinh viên</h2>;
const Teachers = React.lazy(() => import('./pages/Teachers/Teachers'));
const Classes = () => <h2 style={{textAlign:'center', marginTop:'40px'}}>Đây là trang Lớp</h2>;
const Departments = () => <h2 style={{textAlign:'center', marginTop:'40px'}}>Đây là trang Khoa</h2>;
const Subjects = () => <h2 style={{textAlign:'center', marginTop:'40px'}}>Đây là trang Môn học</h2>;
const Grades = () => <h2 style={{textAlign:'center', marginTop:'40px'}}>Đây là trang Điểm</h2>;
const Login = () => <h2 style={{textAlign:'center', marginTop:'40px'}}>Trang đăng nhập</h2>;

function App() {
    return (
        <Router>
            <div className="app-container">
                <Navbar />
                <div className="main-content">
                    <Suspense fallback={<div>Loading...</div>}>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/students" element={<Students />} />
                            <Route path="/teachers" element={<Teachers />} />
                            <Route path="/classes" element={<Classes />} />
                            <Route path="/departments" element={<Departments />} />
                            <Route path="/subjects" element={<Subjects />} />
                            <Route path="/grades" element={<Grades />} />
                            <Route path="/login" element={<Login />} />
                        </Routes>
                    </Suspense>
                </div>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
