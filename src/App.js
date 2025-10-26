import React, { useState, useEffect } from "react";
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Sidebar from "./components/Sidebar/Sidebar";
import Home from "./pages/Home/Home";
import Students from "./pages/Students/Students";
import Teachers from "./pages/Teachers/Teachers";
import Classes from "./pages/Classes/Classes";
import Faculties from "./pages/Faculties/faculties";
import Subjects from "./pages/Subjects/Subjects";
import Grades from "./pages/Grades/Grades";
import Tuition from "./pages/Tuition/Tuition";
import LoginModal from "./components/LoginModal/LoginModal"; // Import the modal
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLogin, setShowLogin] = useState(false);

    useEffect(() => {
        const loggedInStatus = localStorage.getItem('isLoggedIn');
        if (loggedInStatus === 'true') {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogin = (username, password) => {
        // Hardcoded admin credentials
        if (username === 'admin' && password === 'admin') {
            setIsLoggedIn(true);
            localStorage.setItem('isLoggedIn', 'true');
            setShowLogin(false); // Close modal on successful login
        } else {
            alert('Tên đăng nhập hoặc mật khẩu không đúng!');
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        localStorage.removeItem('isLoggedIn');
    };

    const handleShowLogin = () => setShowLogin(true);
    const handleCloseLogin = () => setShowLogin(false);

    return (
        <Router>
            <div className="app-layout">
                <Navbar isLoggedIn={isLoggedIn} />
                <Sidebar isLoggedIn={isLoggedIn} onLogout={handleLogout} onShowLogin={handleShowLogin} />
                <div className="main-content-area"> {/* Area for main content and footer */}
                    <div className="main-content">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            {isLoggedIn ? (
                                <>
                                    <Route path="/students" element={<Students />} />
                                    <Route path="/teachers" element={<Teachers />} />
                                    <Route path="/classes" element={<Classes />} />
                                    <Route path="/faculties" element={<Faculties />} />
                                    <Route path="/subjects" element={<Subjects />} />
                                    <Route path="/grades" element={<Grades />} />
                                    <Route path="/tuition" element={<Tuition />} />
                                </>
                            ) : (
                                // Redirect any other path to home if not logged in
                                <Route path="*" element={<Navigate to="/" />} />
                            )}
                        </Routes>
                    </div>
                    <Footer />
                </div>
                <LoginModal show={showLogin} handleClose={handleCloseLogin} handleLogin={handleLogin} />
            </div>
        </Router>
    );
}

export default App;
