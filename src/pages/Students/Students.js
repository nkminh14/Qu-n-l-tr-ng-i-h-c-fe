import React, { useEffect, useState } from "react";
import axios from "axios";
import StudentModal from "./StudentModal";
import Table from "../../components/Table/Table";

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

    const columns = [
        { title: 'ID', key: 'studentId' },
        { title: 'MSSV', key: 'studentCode' },
        { title: 'Tên', key: 'name', sortable: true },
        { title: 'Ngày sinh', key: 'dateOfBirth' },
        { title: 'Lớp', key: 'gradeId' },
        { title: 'Khoa', key: 'facultyId' },
        { title: 'SĐT', key: 'phone' },
        { title: 'Email', key: 'email' },
    ];

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>📚 Trang Quản lý Sinh viên</h2>
            <button onClick={handleAdd} style={styles.addButton}>
                Thêm Sinh viên
            </button>
            <Table
                columns={columns}
                data={students}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSort={handleSortByName}
                sortOrder={sortOrder}
            />
            <StudentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                student={editingStudent}
            />
        </div>
    );
};

// CSS for buttons can be kept or moved to a separate CSS file.
const styles = {
    addButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        marginBottom: '20px',
    },
};

export default Students;
