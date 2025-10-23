import React, { useEffect, useState } from "react";
import axios from "axios";
import TeacherModal from "./TeacherModal";
import Table from "../../components/Table/Table";
import { Link } from "react-router-dom";
import "./Teachers.css";

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
    const itemsPerPage = 10; // Items per page

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
        
        const sorted = [...filteredTeachers].sort((a, b) => {
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
            // Client-side validation for existing phone number and email
            const isPhoneNumberTaken = teachers.some(
                (teacher) =>
                    teacher.phoneNumber === teacherData.phoneNumber &&
                    (!editingTeacher || teacher.teacherId !== teacher.teacherId)
            );

            const isEmailTaken = teachers.some(
                (teacher) =>
                    teacher.email === teacherData.email &&
                    (!editingTeacher || teacher.teacherId !== teacher.teacherId)
            );

            if (isPhoneNumberTaken) {
                alert("Số điện thoại đã tồn tại. Vui lòng sử dụng số điện thoại khác.");
                return;
            }

            if (isEmailTaken) {
                alert("Email đã tồn tại. Vui lòng sử dụng email khác.");
                return;
            }

            if (editingTeacher) {
                await axios.put(`http://localhost:8080/teachers/${editingTeacher.teacherId}`, teacherData);
            } else {
                await axios.post("http://localhost:8080/teachers", teacherData);
            }
            fetchTeachers();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving teacher:", error);
            alert("Đã xảy ra lỗi khi lưu giảng viên. Vui lòng thử lại.");
        }
    };

    const columns = [
        { title: 'ID', key: 'teacherId' },
        { title: 'Tên', key: 'name', sortable: true },
        { title: 'Học hàm', key: 'academicRank' },
        { title: 'Kinh nghiệm', key: 'experience', sortable: true },
        { title: 'Khoa', key: 'facultyId' },
        { title: 'SĐT', key: 'phoneNumber' },
        { title: 'Email', key: 'email' },
    ];

    // Filter teachers based on search term and type
    const filteredTeachers = teachers.filter(teacher => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchType) {
            case 'name':
                return teacher.name.toLowerCase().includes(lowerCaseSearchTerm);
            case 'email':
                return teacher.email.toLowerCase().includes(lowerCaseSearchTerm);
            case 'faculty':
                return (faculties && getFacultyName(teacher.facultyId).props && getFacultyName(teacher.facultyId).props.children.toLowerCase().includes(lowerCaseSearchTerm));
            default:
                return (
                    teacher.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                    teacher.email.toLowerCase().includes(lowerCaseSearchTerm) ||
                    (faculties && getFacultyName(teacher.facultyId).props && getFacultyName(teacher.facultyId).props.children.toLowerCase().includes(lowerCaseSearchTerm))
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
        facultyId: getFacultyName(teacher.facultyId),
    }));

    return (
        <div className="page-container">
            <h2>📚 Trang Quản lý Giảng viên</h2>

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