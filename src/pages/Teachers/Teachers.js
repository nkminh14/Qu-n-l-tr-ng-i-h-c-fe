import React, { useEffect, useState } from "react";
import axios from "axios";
import TeacherModal from "./TeacherModal";
import Table from "../../components/Table/Table";

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [sortOrder, setSortOrder] = useState("asc"); // asc | desc
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);

    // Call API to get the list of teachers
    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/teachers");
            setTeachers(response.data);
        } catch (error) {
            console.error("Error fetching teachers:", error);
        }
    };

    // Sort the list by name
    const handleSortByName = () => {
        const sorted = [...teachers].sort((a, b) => {
            if (sortOrder === "asc") {
                return a.name.localeCompare(b.name);
            } else {
                return b.name.localeCompare(a.name);
            }
        });
        setTeachers(sorted);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    };

    const handleAdd = () => {
        setEditingTeacher(null);
        setIsModalOpen(true);
    };

    const handleEdit = (teacher) => {
        setEditingTeacher(teacher);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this teacher?")) {
            try {
                await axios.delete(`http://localhost:8080/api/teachers/${id}`);
                fetchTeachers();
            } catch (error) {
                console.error("Error deleting teacher:", error);
            }
        }
    };

    const handleSave = async (teacherData) => {
        try {
            if (editingTeacher) {
                await axios.put(`http://localhost:8080/api/teachers/${editingTeacher.teacherId}`, teacherData);
            } else {
                await axios.post("http://localhost:8080/api/teachers", teacherData);
            }
            fetchTeachers();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving teacher:", error);
        }
    };

    const columns = [
        { title: 'ID', key: 'teacherId' },
        { title: 'Tên', key: 'name', sortable: true },
        { title: 'Học hàm', key: 'academicRank' },
        { title: 'Khoa', key: 'facultyId' },
        { title: 'SĐT', key: 'phone' },
        { title: 'Email', key: 'email' },
    ];

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>📚 Trang Quản lý Giảng viên</h2>
            <button onClick={handleAdd} style={styles.addButton}>
                Thêm Giảng viên
            </button>
            <Table
                columns={columns}
                data={teachers}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSort={handleSortByName}
                sortOrder={sortOrder}
            />
            <TeacherModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                teacher={editingTeacher}
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

export default Teachers;