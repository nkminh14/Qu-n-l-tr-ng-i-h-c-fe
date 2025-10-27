import React, { useEffect, useState } from "react";
import axios from "axios";
import FacultyModal from "./FacultyModal"; // Đổi tên từ StudentModal
import Table from "../../components/Table/Table";
import "./Faculties.css"; // 1. Import CSS của Students
import { toast } from 'react-toastify';

const Faculties = () => {
    const [faculties, setFaculties] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [modalError, setModalError] = useState(null);

    // 2. Thêm state cho Sắp xếp, Tìm kiếm và Phân trang
    const [sortColumn, setSortColumn] = useState(null);
    const [sortOrder, setSortOrder] = useState("asc"); // asc | desc
    const [searchTerm, setSearchTerm] = useState("");
    const [searchType, setSearchType] = useState("facultyName"); // facultyName | facultyId | dean
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Gọi API lấy danh sách khoa
    useEffect(() => {
        fetchFaculties();
    }, []);

const fetchFaculties = async () => {
        try {
            const response = await axios.get("http://localhost:8080/faculties");
            setFaculties(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách khoa:", error);
            // 3. THAY ĐỔI: Dùng toast cho lỗi tải trang
            toast.error("Không thể tải danh sách khoa. Vui lòng thử lại.");
        }
    };

    // 3. Cập nhật hàm Sắp xếp (giống Students.js)
    const handleSort = (columnKey) => {
        const isAsc = sortColumn === columnKey && sortOrder === "asc";
        const newSortOrder = isAsc ? "desc" : "asc";
        setSortColumn(columnKey);
        setSortOrder(newSortOrder);

        const sorted = [...faculties].sort((a, b) => {
            const aValue = a[columnKey];
            const bValue = b[columnKey];

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return newSortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                return newSortOrder === "asc" ? aValue - bValue : bValue - aValue;
            } else {
                return 0;
            }
        });
        setFaculties(sorted); // Cập nhật lại state đã sắp xếp
    };

    const handleAdd = () => {
        setEditingFaculty(null);
        setModalError(null); // <-- 4. THÊM MỚI: Reset lỗi cũ
        setIsModalOpen(true);
    };

    const handleEdit = (faculty) => {
        setEditingFaculty(faculty);
        setModalError(null); // <-- 5. THÊM MỚI: Reset lỗi cũ
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa khoa này không?")) {
            try {
                await axios.delete(`http://localhost:8080/faculties/${id}`);
                fetchFaculties();
                // 6. THAY ĐỔI: Dùng toast cho thành công
                toast.success("Đã xóa khoa thành công!");
            } catch (error) {
                console.error("Lỗi khi xóa khoa:", error);
                // 7. THAY ĐỔI: Dùng toast cho lỗi khi xóa
                const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi khi xóa.";
                toast.error(errorMessage);
            }
        }
    };

const handleSave = async (facultyData) => {
        // Đây là thay đổi quan trọng nhất (Chiến lược Lỗi trong Modal)
        try {
            if (editingFaculty) {
                await axios.put(`http://localhost:8080/faculties/${editingFaculty.facultyId}`, facultyData);
                toast.success("Cập nhật khoa thành công!"); // 8. THÊM MỚI
            } else {
                await axios.post("http://localhost:8080/faculties", facultyData);
                toast.success("Thêm khoa mới thành công!"); // 9. THÊM MỚI
            }
            fetchFaculties();
            setIsModalOpen(false); // Đóng modal khi thành công
            setModalError(null); // Xóa lỗi cũ khi thành công
        } catch (error) {
            console.error("Lỗi khi lưu thông tin khoa:", error);
            
            // 10. THAY ĐỔI: Dùng setModalError thay vì toast
            // Lỗi sẽ được hiển thị BÊN TRONG modal
            const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi khi lưu.";
            setModalError(errorMessage);
            
            // Quan trọng: KHÔNG đóng modal, để người dùng sửa lại
        }
    };

    const columns = [
        { title: 'ID', key: 'facultyId', sortable: true }, // Thêm sortable
        { title: 'Tên Khoa', key: 'facultyName', sortable: true },
        { title: 'Trưởng Khoa', key: 'dean', sortable: true }, // Thêm sortable
        { title: 'SĐT', key: 'phone' },
        { title: 'Email', key: 'email' },
        { title: 'Địa chỉ', key: 'address' },
        { title: 'Mô tả', key: 'description' },
    ];

    // 4. Thêm logic Lọc (Filter)
    const filteredFaculties = faculties.filter(faculty => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        switch (searchType) {
            case 'facultyId':
                return faculty.facultyId.toString().includes(lowerCaseSearchTerm);
            case 'facultyName':
                return faculty.facultyName.toLowerCase().includes(lowerCaseSearchTerm);
            case 'dean':
                return faculty.dean.toLowerCase().includes(lowerCaseSearchTerm);
            default:
                return faculty.facultyName.toLowerCase().includes(lowerCaseSearchTerm);
        }
    });

    // 5. Thêm logic Phân trang (Pagination)
    const indexOfLastFaculty = currentPage * itemsPerPage;
    const indexOfFirstFaculty = indexOfLastFaculty - itemsPerPage;
    const currentFaculties = filteredFaculties.slice(indexOfFirstFaculty, indexOfLastFaculty);
    const totalPages = Math.ceil(filteredFaculties.length / itemsPerPage);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalError(null); // <-- 11. THÊM MỚI: Đảm bảo lỗi được xóa khi đóng modal
    };
    // 6. Cập nhật JSX
    return (
        <div className="page-container">
            <h2>📚 Trang Quản lý Khoa</h2>

            <div className="search-pagination-controls">
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        placeholder={`Tìm kiếm theo ${searchType === 'facultyName' ? 'Tên Khoa' : searchType === 'facultyId' ? 'ID' : 'Trưởng Khoa'}...`}
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
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
                    <option value="facultyName">Tìm theo Tên Khoa</option>
                    <option value="facultyId">Tìm theo ID</option>
                    <option value="dean">Tìm theo Trưởng Khoa</option>
                </select>
                <button onClick={handleAdd} className="add-button">
                    Thêm Khoa
                </button>
            </div>

            <div className="table-scroll-container">
                <Table
                    columns={columns}
                    data={currentFaculties} // Dùng data đã phân trang
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSort={handleSort} // Dùng hàm sort mới
                    sortColumn={sortColumn} // Truyền cột sort
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

            <FacultyModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                faculty={editingFaculty}
                serverError={modalError}
            />
        </div>
    );
};



export default Faculties;