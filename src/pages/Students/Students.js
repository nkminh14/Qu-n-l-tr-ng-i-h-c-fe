import React, { useEffect, useState } from "react";
import axios from "axios";

const Students = () => {
    const [students, setStudents] = useState([]);
    const [sortOrder, setSortOrder] = useState("asc"); // asc | desc

    // Gọi API lấy danh sách sinh viên
    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await axios.get("http://localhost:8080/students");
            setStudents(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sinh viên:", error);
        }
    };

    // Sắp xếp danh sách theo tên
    const handleSortByName = () => {
        const sorted = [...students].sort((a, b) => {
            if (sortOrder === "asc") {
                return a.name.localeCompare(b.name);
            } else {
                return b.name.localeCompare(a.name);
            }
        });
        setStudents(sorted);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    };

    return (
        <div style={{ padding: "40px", textAlign: "center" }}>
            <h2>📚 Trang Quản lý Sinh viên</h2>
            <div style={{ overflowX: "auto", marginTop: "30px" }}>
                <table style={styles.table}>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>MSSV</th>
                        <th>
                            Tên{" "}
                            <button onClick={handleSortByName} style={styles.sortButton}>
                                {sortOrder === "asc" ? "↑" : "↓"}
                            </button>
                        </th>
                        <th>Ngày sinh</th>
                        <th>Lớp</th>
                        <th>Khoa</th>
                        <th>SĐT</th>
                        <th>Email</th>
                    </tr>
                    </thead>
                    <tbody>
                    {students.length > 0 ? (
                        students.map((s, index) => (
                            <tr key={s.studentId || index}>
                                <td>{s.studentId}</td>
                                <td>{s.studentCode}</td>
                                <td>{s.name}</td>
                                <td>{s.dateOfBirth}</td>
                                <td>{s.gradeId}</td>
                                <td>{s.facultyId}</td>
                                <td>{s.phone}</td>
                                <td>{s.email}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" style={{ padding: "20px" }}>
                                Không có dữ liệu sinh viên.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// CSS nội tuyến
const styles = {
    table: {
        width: "100%",
        borderCollapse: "collapse",
        backgroundColor: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    },
    sortButton: {
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "16px",
        marginLeft: "5px",
    },
};

export default Students;
