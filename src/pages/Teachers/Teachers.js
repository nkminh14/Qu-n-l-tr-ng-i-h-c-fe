import React, { useEffect, useState } from "react";
import axios from "axios";
import TeacherModal from "./TeacherModal";
import Table from "../../components/Table/Table";
import { Link } from "react-router-dom";

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [sortColumn, setSortColumn] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc"); // asc | desc
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);

    // Call API to get the list of teachers
    useEffect(() => {
        fetchTeachers();
        fetchFaculties();
    }, []);

    const fetchTeachers = async () => {
        try {
            const response = await axios.get("http://localhost:8080/teachers");
            setTeachers(response.data);
        } catch (error) {
            console.error("Error fetching teachers:", error);
        }
    };

    const fetchFaculties = async () => {
        try {
            const response = await axios.get("http://localhost:8080/faculties");
            setFaculties(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách khoa:", error);
        }
    };

    const getFacultyName = (facultyId) => {
        const faculty = faculties.find((f) => f.facultyId === facultyId);
        return faculty ? <Link to={`/faculties`}>{faculty.facultyName}</Link> : "N/A";
    };

    const handleSort = (columnKey) => {
        const isAsc = sortColumn === columnKey && sortOrder === "asc";
        const newSortOrder = isAsc ? "desc" : "asc";
        
        const sorted = [...teachers].sort((a, b) => {
            if (a[columnKey] < b[columnKey]) {
                return newSortOrder === "asc" ? -1 : 1;
            }
            if (a[columnKey] > b[columnKey]) {
                return newSortOrder === "asc" ? 1 : -1;
            }
            return 0;
        });

        setTeachers(sorted);
        setSortOrder(newSortOrder);
        setSortColumn(columnKey);
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
                await axios.delete(`http://localhost:8080/teachers/${id}`);
                fetchTeachers();
            } catch (error) {
                console.error("Error deleting teacher:", error);
            }
        }
    };

    const handleSave = async (teacherData) => {
        try {
            if (editingTeacher) {
                await axios.put(`http://localhost:8080/teachers/${editingTeacher.teacherId}`, teacherData);
            } else {
                await axios.post("http://localhost:8080/teachers", teacherData);
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
        { title: 'Kinh nghiệm', key: 'experience', sortable: true },
        { title: 'Khoa', key: 'facultyId' },
        { title: 'SĐT', key: 'phone' },
        { title: 'Email', key: 'email' },
    ];

    const teacherDataWithFaculty = teachers.map((teacher) => ({
        ...teacher,
        facultyId: getFacultyName(teacher.facultyId),
    }));

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>📚 Trang Quản lý Giảng viên</h2>
            <button onClick={handleAdd} style={styles.addButton}>
                Thêm Giảng viên
            </button>
            <Table
                columns={columns}
                data={teacherDataWithFaculty}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSort={handleSort}
                sortOrder={sortOrder}
                sortColumn={sortColumn}
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