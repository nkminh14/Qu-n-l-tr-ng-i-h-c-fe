import React, { useEffect, useState } from "react";
import axios from "axios";
import StudentModal from "./StudentModal";

const Students = () => {
    const [students, setStudents] = useState([]);
    const [sortOrder, setSortOrder] = useState("asc"); // asc | desc
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

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

    const handleAdd = () => {
        setEditingStudent(null);
        setIsModalOpen(true);
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa sinh viên này không?")) {
            try {
                await axios.delete(`http://localhost:8080/students/${id}`);
                fetchStudents();
            } catch (error) {
                console.error("Lỗi khi xóa sinh viên:", error);
            }
        }
    };

    const handleSave = async (studentData) => {
        console.log("Saving student data:", studentData);
        console.log("Editing student:", editingStudent);
        try {
            if (editingStudent) {
                await axios.put(`http://localhost:8080/students/${editingStudent.studentId}`, studentData);
            } else {
                await axios.post("http://localhost:8080/students", studentData);
            }
            fetchStudents();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Lỗi khi lưu sinh viên:", error);
        }
    };

    return (
        <div style={{ padding: "40px", textAlign: "center" }}>
            <h2>📚 Trang Quản lý Sinh viên</h2>
            <button onClick={handleAdd} style={styles.addButton}>
                Thêm Sinh viên
            </button>
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
                        <th>Hành động</th>
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
                                <td>
                                    <button onClick={() => handleEdit(s)} style={styles.editButton}>Sửa</button>
                                    <button onClick={() => handleDelete(s.studentId)} style={styles.deleteButton}>Xóa</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9" style={{ padding: "20px" }}>
                                Không có dữ liệu sinh viên.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
            <StudentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                student={editingStudent}
            />
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
    addButton: {
        backgroundColor: "#4CAF50",
        color: "white",
        padding: "10px 20px",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "16px",
        marginBottom: "20px",
    },
    editButton: {
        backgroundColor: "#2196F3",
        color: "white",
        padding: "5px 10px",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        marginRight: "5px",
    },
    deleteButton: {
        backgroundColor: "#f44336",
        color: "white",
        padding: "5px 10px",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },
};

export default Students;
