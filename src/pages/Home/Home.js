import React, { useEffect, useState } from "react";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Link } from "react-router-dom";
import "./Home.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Home = () => {
    const [totalStudents, setTotalStudents] = useState(0);
    const [totalClasses, setTotalClasses] = useState(0);
    const [totalTeachers, setTotalTeachers] = useState(0);
    const [totalSubjects, setTotalSubjects] = useState(0);
    const [totalFaculties, setTotalFaculties] = useState(0);
    const [paidTuitionsCount, setPaidTuitionsCount] = useState(0);
    const [tuitions, setTuitions] = useState([]);

    const [totalGradesRecorded, setTotalGradesRecorded] = useState(0);
    const [studentsPerClassChartData, setStudentsPerClassChartData] = useState({
        labels: [],
        datasets: [],
    });
    const [tuitionStatusChartData, setTuitionStatusChartData] = useState({
        labels: [],
        datasets: [],
    });
    const [averageGradesPerSubjectChartData, setAverageGradesPerSubjectChartData] = useState({
        labels: [],
        datasets: [],
    });
    const [gradeDistributionChartData, setGradeDistributionChartData] = useState({
        labels: [],
        datasets: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

useEffect(() => {
        const fetchData = async () => {
            try {
                // 2. Sử dụng API_URL cho tất cả các request
                const [
                    studentsRes,
                    classesRes,
                    teachersRes,
                    subjectsRes,
                    facultiesRes,
                    tuitionsRes,
                    gradesRes,
                ] = await axios.all([
                    axios.get(`${API_URL}/students`),
                    axios.get(`${API_URL}/classes`),
                    axios.get(`${API_URL}/teachers`),
                    axios.get(`${API_URL}/subjects`),
                    axios.get(`${API_URL}/faculties`),
                    axios.get(`${API_URL}/tuitions`),
                    axios.get(`${API_URL}/grades`),
                ]);

                const students = studentsRes.data || [];
                const classes = classesRes.data || [];
                const teachers = teachersRes.data || [];
                const subjects = subjectsRes.data || [];
                const faculties = facultiesRes.data || [];
                const tuitionsData = tuitionsRes.data || [];
                setTuitions(tuitionsData);
                const grades = gradesRes.data || [];

                setTotalStudents(students.length);
                setTotalClasses(classes.length);
                setTotalTeachers(teachers.length);
                setTotalSubjects(subjects.length);
                setTotalFaculties(faculties.length);
                setTotalGradesRecorded(grades.length);

                const paidTuitionsCountValue = tuitionsData.filter(t => t.status === "PAID").length;
                const unpaidTuitionsCount = tuitionsData.filter(t => t.status === "UNPAID").length;
                const partialTuitionsCount = tuitionsData.filter(t => t.status === "PARTIAL").length;

                setPaidTuitionsCount(paidTuitionsCountValue);

                // Calculate students per class
                const classMap = new Map();
                classes.forEach((cls) => {
                    classMap.set(cls.classId, cls.subjectName); // Assuming subjectName is a good class identifier
                });

                const studentsInClass = {};
                students.forEach((student) => {
                    if (student.classId && classMap.has(student.classId)) {
                        const className = classMap.get(student.classId);
                        studentsInClass[className] = (studentsInClass[className] || 0) + 1;
                    }
                });

                const classLabels = Object.keys(studentsInClass);
                const studentCounts = Object.values(studentsInClass);

                setStudentsPerClassChartData({
                    labels: classLabels,
                    datasets: [
                        {
                            label: 'Số lượng Sinh viên',
                            data: studentCounts,
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                        },
                    ],
                });

                setTuitionStatusChartData({
                    labels: ['Đã đóng', 'Chưa đóng', 'Đóng một phần'],
                    datasets: [
                        {
                            label: 'Số lượng',
                            data: [paidTuitionsCountValue, unpaidTuitionsCount, partialTuitionsCount],
                            backgroundColor: [
                                'rgba(54, 162, 235, 0.6)',
                                'rgba(255, 99, 132, 0.6)',
                                'rgba(255, 206, 86, 0.6)',
                            ],
                            borderColor: [
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 99, 132, 1)',
                                'rgba(255, 206, 86, 1)',
                            ],
                            borderWidth: 1,
                        },
                    ],
                });

                // Calculate average grades per subject
                const subjectNameMap = new Map();
                subjects.forEach(sub => {
                    subjectNameMap.set(sub.subjectId, sub.subjectName);
                });

                const gradesBySubject = {};
                grades.forEach(grade => {
                    // Assuming an overall score calculation, e.g., simple average of available scores
                    const scores = [
                        grade.attendanceScore,
                        grade.midtermScore,
                        grade.finalScore
                    ].filter(s => typeof s === 'number');

                    if (scores.length > 0) {
                        const overallScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
                        const classInfo = classes.find(cls => cls.classId === grade.classId);
                        if (classInfo && subjectNameMap.has(classInfo.subjectId)) {
                            const subjectName = subjectNameMap.get(classInfo.subjectId);
                            if (!gradesBySubject[subjectName]) {
                                gradesBySubject[subjectName] = { totalScore: 0, count: 0 };
                            }
                            gradesBySubject[subjectName].totalScore += overallScore;
                            gradesBySubject[subjectName].count += 1;
                        }
                    }
                });

                const avgGradesLabels = Object.keys(gradesBySubject);
                const avgGradesScores = Object.values(gradesBySubject).map(data => (data.totalScore / data.count).toFixed(2));

                setAverageGradesPerSubjectChartData({
                    labels: avgGradesLabels,
                    datasets: [
                        {
                            label: 'Điểm trung bình',
                            data: avgGradesScores,
                            backgroundColor: 'rgba(255, 159, 64, 0.6)',
                            borderColor: 'rgba(255, 159, 64, 1)',
                            borderWidth: 1,
                        },
                    ],
                });

                // Calculate grade distribution for chart
                const scoreCounts = {};
                grades.forEach(grade => {
                    const scores = [
                        grade.attendanceScore,
                        grade.midtermScore,
                        grade.finalScore
                    ].filter(s => typeof s === 'number');

                    if (scores.length > 0) {
                        const overallScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
                        const roundedScore = Math.round(overallScore);
                        scoreCounts[roundedScore] = (scoreCounts[roundedScore] || 0) + 1;
                    }
                });

                const gradeDistributionLabels = Object.keys(scoreCounts).sort((a, b) => parseInt(a) - parseInt(b));
                const gradeDistributionCounts = gradeDistributionLabels.map(score => scoreCounts[score]);

                setGradeDistributionChartData({
                    labels: gradeDistributionLabels,
                    datasets: [
                        {
                            label: 'Số lượng Sinh viên',
                            data: gradeDistributionCounts,
                            backgroundColor: 'rgba(153, 102, 255, 0.6)',
                            borderColor: 'rgba(153, 102, 255, 1)',
                            borderWidth: 1,
                        },
                    ],
                });

            } catch (err) {
                console.error("Error fetching data for Home page:", err);
                setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="page-container">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className="page-container error-message">Lỗi: {error}</div>;
    }

    const barChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Số lượng Sinh viên theo Lớp',
            },
        },
    };

    const doughnutChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Tình trạng Học phí',
            },
        },
    };

    const averageGradesChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Điểm trung bình theo Môn học',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 10, // Assuming grades are out of 10
            },
        },
    };

    const gradeDistributionChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Phân bố Điểm',
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Điểm',
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Số lượng Sinh viên',
                },
            },
        },
    };

    return (
        <div className="page-container home-dashboard">
            <h1>Thống kê Tổng quan</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Tổng số Sinh viên</h3>
                    <p className="stat-value">{totalStudents}</p>
                </div>
                <div className="stat-card">
                    <h3>Tổng số Lớp học</h3>
                    <p className="stat-value">{totalClasses}</p>
                </div>
                <div className="stat-card">
                    <h3>Tổng số Giảng viên</h3>
                    <p className="stat-value">{totalTeachers}</p>
                </div>
                <div className="stat-card">
                    <h3>Tổng số Môn học</h3>
                    <p className="stat-value">{totalSubjects}</p>
                </div>
                <div className="stat-card">
                    <h3>Tổng số Khoa</h3>
                    <p className="stat-value">{totalFaculties}</p>
                </div>
                <div className="stat-card">
                    <h3>Tổng số học phí</h3>
                    <p className="stat-value">{tuitions.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Tổng số Điểm đã ghi nhận</h3>
                    <p className="stat-value">{totalGradesRecorded}</p>
                </div>
            </div>

            <div className="charts-container">
                <div className="chart-card">
                    <Bar data={studentsPerClassChartData} options={barChartOptions} />
                </div>
                <Link to="/tuition" className="chart-card-link">
                    <div className="chart-card">
                        <Doughnut data={tuitionStatusChartData} options={doughnutChartOptions} />
                    </div>
                </Link>
                <div className="chart-card">
                    <Bar data={averageGradesPerSubjectChartData} options={averageGradesChartOptions} />
                </div>
                <div className="chart-card">
                    <Bar data={gradeDistributionChartData} options={gradeDistributionChartOptions} />
                </div>
            </div>
        </div>
    );
};

export default Home;
