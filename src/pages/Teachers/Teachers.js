import React, { useEffect, useState } from "react";
import axios from "axios";
import TeacherModal from "./TeacherModal";
import Table from "../../components/Table/Table";
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import "./Teachers.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [sortColumn, setSortColumn] = useState("name");
    const [sortOrder, setSortOrder] = useState("asc"); // asc | desc
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // State for search term
    const [searchType, setSearchType] = useState("name"); // New state for search type: 'name', 'email', 'faculty'
    const [currentPage, setCurrentPage] = useState(1); // State for current page
    const [modalError, setModalError] = useState(null);
    const itemsPerPage = 10; // Items per page

    // Call API to get the list of teachers
    useEffect(() => {
        fetchTeachers();
        fetchFaculties();
    }, []);

const fetchTeachers = async () => {
        try {
            // 2. Sửa URL
            const response = await axios.get(`${API_URL}/teachers`);
            setTeachers(response.data);
        } catch (error) {
            console.error("Error fetching teachers:", error); // Thêm log
            toast.error("Lỗi khi tải danh sách giảng viên: " + error.message);
        }
    };

    const fetchFaculties = async () => {
        try {
            // 3. Sửa URL
            const response = await axios.get(`${API_URL}/faculties`);
            setFaculties(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách khoa:", error); // Thêm log
            toast.error("Lỗi khi lấy danh sách khoa: " + error.message);
        }
    };

const getFacultyName = (facultyId) => {
        const faculty = faculties.find((f) => f.facultyId === facultyId);
        return faculty ? faculty.facultyName : "N/A";
    };

const handleSort = (columnKey) => {
        const isAsc = sortColumn === columnKey && sortOrder === "asc";
        const newSortOrder = isAsc ? "desc" : "asc";
        setSortColumn(columnKey);
        setSortOrder(newSortOrder);

      // Nên sort trên filteredTeachers thay vì teachers gốc
        const sorted = [...teachers].sort((a, b) => { // Sửa: sort teachers
            let aVal = a[columnKey];
            let bVal = b[columnKey];

            // Xử lý trường facultyName đặc biệt
            if (columnKey === 'facultyName') {
                aVal = getFacultyName(a.facultyId);
                bVal = getFacultyName(b.facultyId);
            }

            if (aVal == null) aVal = ''; // Xử lý null/undefined
            if (bVal == null) bVal = '';

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return newSortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            } else if (typeof aVal === 'number' && typeof bVal === 'number') {
                return newSortOrder === "asc" ? aVal - bVal : bVal - aVal;
            } else {
                // Fallback nếu kiểu dữ liệu khác nhau
                const strA = String(aVal);
                const strB = String(bVal);
                return newSortOrder === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
            }
        });
        setTeachers(sorted); // Cập nhật state teachers đã sort
    };

const handleAdd = () => {
        setEditingTeacher(null);
        setModalError(null); // Reset lỗi modal
        setIsModalOpen(true);
    };

    const handleEdit = (teacher) => {
        // Cần lấy teacher gốc chưa map tên khoa
        const originalTeacher = teachers.find(t => t.teacherId === teacher.teacherId);
        setEditingTeacher(originalTeacher || teacher); // Ưu tiên lấy teacher gốc
        setModalError(null); // Reset lỗi modal
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this teacher?")) {
            try {
                // 4. Sửa URL
                await axios.delete(`${API_URL}/teachers/${id}`);
                fetchTeachers();
                toast.success("Đã xóa giảng viên thành công!"); // Thêm toast success
            } catch (error) {
                console.error("Error deleting teacher:", error); // Thêm log chi tiết
                const errorMessage = error.response?.data?.message || "Lỗi khi xóa giảng viên.";
                toast.error(errorMessage);
            }
        }
    };

    const handleSave = async (teacherData) => {
        try {
            // Xóa bỏ validation client-side đơn giản vì backend đã làm tốt hơn
            if (editingTeacher) {
                // 5. Sửa URL
                await axios.put(`${API_URL}/teachers/${editingTeacher.teacherId}`, teacherData);
                toast.success("Cập nhật giảng viên thành công!");
            } else {
                // 6. Sửa URL
                await axios.post(`${API_URL}/teachers`, teacherData);
                toast.success("Thêm giảng viên mới thành công!");
            }
            fetchTeachers();
            setIsModalOpen(false);
            setModalError(null); // Xóa lỗi khi thành công
        } catch (error) {
            console.error("Error saving teacher:", error); // Thêm log chi tiết
            const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi khi lưu giảng viên.";
            setModalError(errorMessage); // Hiển thị lỗi trong modal
            // Không dùng toast.error ở đây nữa
        }
    };
const columns = [
        { title: 'ID', key: 'teacherId' },
        { title: 'Tên', key: 'name', sortable: true },
        { title: 'Học hàm', key: 'academicRank' },
        { title: 'Kinh nghiệm', key: 'experience', sortable: true },
        { title: 'Khoa', key: 'facultyName', sortable: true }, // SỬA: Đổi key
        { title: 'SĐT', key: 'phoneNumber' },
        { title: 'Email', key: 'email' },
    ];

// SỬA: Filter teachers
    const filteredTeachers = teachers.filter(teacher => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const facultyName = getFacultyName(teacher.facultyId)?.toLowerCase() || ''; // Lấy text

        switch (searchType) {
            case 'name':
                return teacher.name?.toLowerCase().includes(lowerCaseSearchTerm);
            case 'email':
                return teacher.email?.toLowerCase().includes(lowerCaseSearchTerm);
            case 'faculty':
                return facultyName.includes(lowerCaseSearchTerm); // Tìm trên text
            default: // Tìm kiếm chung
                return (
                  (teacher.name?.toLowerCase().includes(lowerCaseSearchTerm)) ||
                  (teacher.email?.toLowerCase().includes(lowerCaseSearchTerm)) ||
                  facultyName.includes(lowerCaseSearchTerm)
                );
        }
    });

    // Get current teachers for pagination
    const indexOfLastTeacher = currentPage * itemsPerPage;
    const indexOfFirstTeacher = indexOfLastTeacher - itemsPerPage;
    const currentTeachers = filteredTeachers.slice(indexOfFirstTeacher, indexOfLastTeacher);

    // Calculate total pages
    const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Thêm tên khoa vào dữ liệu giảng viên
const teacherDataWithFaculty = currentTeachers.map((teacher) => ({
        ...teacher,
        facultyName: getFacultyName(teacher.facultyId), // Giờ là text
    }));

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalError(null); // Reset lỗi khi đóng
    };

    return (
        <div className="page-container">
            <h2>Trang Quản lý Giảng viên</h2>

            <div className="search-pagination-controls">
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        placeholder={`Tìm kiếm theo ${searchType === 'name' ? 'Tên' : searchType === 'email' ? 'Email' : 'Khoa'}...`}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset to first page on search
                        }}
                        className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                </div>
                <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="search-type-select"
                >
                    <option value="name">Tìm theo Tên</option>
                    <option value="email">Tìm theo Email</option>
                    <option value="faculty">Tìm theo Khoa</option>
                </select>
                <button onClick={handleAdd} className="add-button">
                    Thêm Giảng viên
                </button>
            </div>

            <div className="table-scroll-container">
                <Table
                    columns={columns}
                    data={teacherDataWithFaculty}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSort={handleSort}
                    sortOrder={sortOrder}
                    sortColumn={sortColumn}
                />
            </div>

            <div className="pagination">
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Trước</button>
                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={currentPage === index + 1 ? "active" : ""}
                    >
                        {index + 1}
                    </button>
                ))}
                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Tiếp</button>
            </div>

            <TeacherModal
                isOpen={isModalOpen}
                onClose={handleCloseModal} // Dùng hàm close mới
                onSave={handleSave}
                teacher={editingTeacher}
                faculties={faculties} // Truyền faculties xuống modal
                serverError={modalError} // Truyền lỗi modal
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