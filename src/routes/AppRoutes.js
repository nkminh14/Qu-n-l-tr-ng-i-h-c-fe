import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import Home from '../pages/Home/Home';
import Students from '../pages/Students/Students';
import Teachers from '../pages/Teachers/Teachers';
import Classes from '../pages/Classes/Classes';
import Departments from '../pages/Departments/Departments';
import Subjects from '../pages/Subjects/Subjects';
import Grades from '../pages/Grades/Grades';
import Tuition from '../pages/Tuition/Tuition';

const AppRoutes = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/students" element={<Students />} />
                <Route path="/teachers" element={<Teachers />} />
                <Route path="/classes" element={<Classes />} />
                <Route path="/departments" element={<Departments />} />
                <Route path="/subjects" element={<Subjects />} />
                <Route path="/grades" element={<Grades />} />
                <Route path="/tuition" element={<Tuition />} />
            </Routes>
            <Footer />
        </Router>
    );
};

export default AppRoutes;
