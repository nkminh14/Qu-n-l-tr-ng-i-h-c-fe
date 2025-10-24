import React, { useEffect, useState } from "react";
import axios from "axios";
import StudentModal from "./StudentModal";
import Table from "../../components/Table/Table";
import { Link } from "react-router-dom";
import "./Students.css"; // Import Students.css

const Students = () => {
    const [students, setStudents] = useState([]);
    const [faculties, setFaculties] = useState(null); // Initialize as null to check if fetched
    const [classes, setClasses] = useState(null); // Initialize as null to check if fetched
    const [sortColumn, setSortColumn] = useState(null); // State for current sorted column
    const [sortOrder, setSortOrder] = useState("asc"); // asc | desc
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); // State for search term
    const [searchType, setSearchType] = useState("name"); // New state for search type: 'name', 'studentId', 'gradeId'
    const [currentPage, setCurrentPage] = useState(1); // State for current page
    const itemsPerPage = 10; // Items per page

    // Gọi API lấy danh sách sinh viên và khoa
    useEffect(() => {
        fetchStudents();
        fetchFaculties();
        fetchClasses();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await axios.get("http://localhost:8080/students");
            setStudents(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sinh viên:", error);
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

    const fetchClasses = async () => {
        try {
            const response = await axios.get("http://localhost:8080/classes");
            setClasses(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách lớp:", error);
        }
    };

    // Lấy tên khoa từ facultyId
    const getFacultyName = (facultyId) => {
        if (!faculties) return "Loading..."; // Handle loading state for faculties
        const faculty = faculties.find((f) => f.facultyId === facultyId);
        return faculty ? <Link to={`/faculties`}>{faculty.facultyName}</Link> : "N/A";
    };

    // Lấy tên lớp từ classId
    const getClassName = (classId) => {
        if (!classes) return "Loading..."; // Handle loading state for classes
        const a_class = classes.find((c) => c.classId === classId);
        return a_class ? <Link to={`/classes`}>{a_class.subjectName}</Link> : "N/A";
    };

    // Sắp xếp danh sách
    const handleSort = (columnKey) => {
        const isAsc = sortColumn === columnKey && sortOrder === "asc";
        const newSortOrder = isAsc ? "desc" : "asc";
        setSortColumn(columnKey);
        setSortOrder(newSortOrder);

        const sorted = [...students].sort((a, b) => {
            const aValue = a[columnKey];
            const bValue = b[columnKey];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return newSortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                return newSortOrder === "asc" ? aValue - bValue : bValue - aValue;
            } else {
                // Fallback for other types or mixed types
                return 0;
            }
        });
        setStudents(sorted);
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
        { title: 'MSSV', key: 'studentCode', sortable: true },
        { title: 'Tên', key: 'name', sortable: true },
        { title: 'Ngày sinh', key: 'dateOfBirth' },
        { title: 'Lớp', key: 'classId' },
        { title: 'Khoa', key: 'facultyId' },
        { title: 'SĐT', key: 'phone' },
        { title: 'Email', key: 'email' },
    ];

    // Filter students based on search term and type
    const filteredStudents = students.filter(student => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchType) {
            case 'studentId':
                return student.studentId.toString().includes(lowerCaseSearchTerm);
            case 'name':
                return student.name.toLowerCase().includes(lowerCaseSearchTerm);
            case 'gradeId':
                return student.classId.toString().toLowerCase().includes(lowerCaseSearchTerm);
            default:
                return (
                    student.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                    student.studentCode.toLowerCase().includes(lowerCaseSearchTerm) ||
                    (faculties && getFacultyName(student.facultyId).props && getFacultyName(student.facultyId).props.children.toLowerCase().includes(lowerCaseSearchTerm)) ||
                    (classes && getClassName(student.classId).props && getClassName(student.classId).props.children.toLowerCase().includes(lowerCaseSearchTerm))
                );
        }
    });

    // Get current students for pagination
    const indexOfLastStudent = currentPage * itemsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - itemsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

    // Calculate total pages
    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Thêm tên khoa và lớp vào dữ liệu sinh viên
    const studentDataWithDetails = currentStudents.map((student) => ({
        ...student,
        facultyId: getFacultyName(student.facultyId),
        classId: getClassName(student.classId),
    }));

    return (
        <div className="page-container">
            <h2>📚 Trang Quản lý Sinh viên</h2>

            <div className="search-pagination-controls">
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        placeholder={`Tìm kiếm theo ${searchType === 'name' ? 'Tên' : searchType === 'studentId' ? 'ID' : 'Lớp'}...`}
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
                    <option value="studentId">Tìm theo ID</option>
                    <option value="gradeId">Tìm theo Lớp</option>
                </select>
                <button onClick={handleAdd} className="add-button">
                    Thêm Sinh viên
                </button>
            </div>

            <div className="table-scroll-container">
                <Table
                    columns={columns}
                    data={studentDataWithDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSort={handleSort}
                    sortColumn={sortColumn}
                    sortOrder={sortOrder}
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

            <StudentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                student={editingStudent}
                faculties={faculties}
                classes={classes}
            />
        </div>
    );
};

export default Students;