import React, { useState } from "react";
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import 'bootstrap/dist/css/bootstrap.min.css';

// Placeholder for Login page if it doesn't exist as a file
const Login = () => <h2 style={{textAlign:'center', marginTop:'40px'}}>Trang đăng nhập</h2>;

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false); // State for login status

    const handleLoginToggle = () => {
        setIsLoggedIn(!isLoggedIn);
        // In a real app, this would involve actual authentication logic
    };

    return (
        <Router>
            <div className="app-layout">
                <Navbar /> {/* Navbar spans full width at the top */}
                <Sidebar isLoggedIn={isLoggedIn} onLoginToggle={handleLoginToggle} /> {/* Sidebar on the left */}
                <div className="main-content-area"> {/* Area for main content and footer */}
                    <div className="main-content">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/students" element={<Students />} />
                            <Route path="/teachers" element={<Teachers />} />
                            <Route path="/classes" element={<Classes />} />
                            <Route path="/Faculties" element={<Faculties/>}/>
                            <Route path="/subjects" element={<Subjects />} />
                            <Route path="/grades" element={<Grades />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/tuition" element={<Tuition />} />
                        </Routes>
                    </div>
                    <Footer />
                </div>
            </div>
        </Router>
    );
}

export default App;
