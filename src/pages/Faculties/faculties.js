import React, { useEffect, useState } from "react";
import axios from "axios";
import FacultyModal from "./FacultyModal"; // Đổi tên từ StudentModal
import Table from "../../components/Table/Table";

const Faculties = () => {
    const [faculties, setFaculties] = useState([]);
    const [sortOrder, setSortOrder] = useState("asc"); // asc | desc
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);

    // Gọi API lấy danh sách khoa
    useEffect(() => {
        fetchFaculties();
    }, []);

    const fetchFaculties = async () => {
        try {
            // Sửa lại endpoint API cho đúng
            const response = await axios.get("http://localhost:8080/api/faculties");
            setFaculties(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách khoa:", error);
        }
    };

    // Sắp xếp danh sách theo tên khoa
    const handleSortByFacultyName = () => {
        const sorted = [...faculties].sort((a, b) => {
            if (sortOrder === "asc") {
                // Sửa lại thuộc tính sắp xếp là 'facultyName'
                return a.facultyName.localeCompare(b.facultyName);
            } else {
                return b.facultyName.localeCompare(a.facultyName);
            }
        });
        setFaculties(sorted);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    };

    const handleAdd = () => {
        setEditingFaculty(null);
        setIsModalOpen(true);
    };

    const handleEdit = (faculty) => {
        setEditingFaculty(faculty);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa khoa này không?")) {
            try {
                await axios.delete(`http://localhost:8080/api/faculties/${id}`);
                fetchFaculties(); // Tải lại danh sách
            } catch (error) {
                console.error("Lỗi khi xóa khoa:", error);
            }
        }
    };

    const handleSave = async (facultyData) => {
        try {
            if (editingFaculty) {
                // Sửa endpoint và ID cho đúng với faculty
                await axios.put(`http://localhost:8080/api/faculties/${editingFaculty.facultyId}`, facultyData);
            } else {
                await axios.post("http://localhost:8080/api/faculties", facultyData);
            }
            fetchFaculties();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Lỗi khi lưu thông tin khoa:", error);
        }
    };

    // Cập nhật lại các cột cho bảng Khoa
    const columns = [
        { title: 'ID', key: 'facultyId' },
        { title: 'Tên Khoa', key: 'facultyName', sortable: true },
        { title: 'Trưởng Khoa', key: 'dean' },
        { title: 'SĐT', key: 'phone' },
        { title: 'Email', key: 'email' },
        { title: 'Địa chỉ', key: 'address' },
    ];

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>📚 Trang Quản lý Khoa</h2>
            <button onClick={handleAdd} style={styles.addButton}>
                Thêm Khoa
            </button>
            <Table
                columns={columns}
                data={faculties}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSort={handleSortByFacultyName}
                sortOrder={sortOrder}
            />
            <FacultyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                faculty={editingFaculty} // Truyền dữ liệu faculty
            />
        </div>
    );
};

// CSS có thể giữ nguyên
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

export default Faculties;