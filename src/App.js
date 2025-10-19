import React from "react";
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import Students from "./pages/Students/Students";
import Teachers from "./pages/Teachers/Teachers";
import Classes from "./pages/Classes/Classes";
import Departments from "./pages/Departments/Departments";
import Subjects from "./pages/Subjects/Subjects";
import Grades from "./pages/Grades/Grades";
import Tuition from "./pages/Tuition/Tuition";

// Placeholder for Login page if it doesn't exist as a file
const Login = () => <h2 style={{textAlign:'center', marginTop:'40px'}}>Trang đăng nhập</h2>;

function App() {
    return (
        <Router>
            <div className="app-container">
                <Navbar />
                <div className="main-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/students" element={<Students />} />
                        <Route path="/teachers" element={<Teachers />} />
                        <Route path="/classes" element={<Classes />} />
                        <Route path="/departments" element={<Departments />} />
                        <Route path="/subjects" element={<Subjects />} />
                        <Route path="/grades" element={<Grades />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/tuition" element={<Tuition />} />
                    </Routes>
                </div>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
