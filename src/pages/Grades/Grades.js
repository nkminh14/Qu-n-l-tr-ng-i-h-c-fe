import React, { use, useEffect, useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import Table from "../../components/Table/Table";
import GradeModal from "./GradeModal";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const Grades = () => {
    const [grades, setGrades] = useState([]);
    const [sortOrder, setSortOrder] = useState("asc"); // asc | desc
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGrade, setEditingGrade] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchType, setSearchType] = useState("studentCode")

    useEffect(() => {
        fetchGrades();
    }, []);

 const fetchGrades = async () => {
        try {
            setLoading(true);
            setError("");
            // 4. Sửa URL
            const res = await axios.get(`${API_URL}/grades`); // Thay đổi URL
            setGrades(res.data || []);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách điểm:", err);
            setError("Không thể tải danh sách điểm."); // Giữ lại lỗi tải trang
            toast.error("Không thể tải danh sách điểm."); // Thêm toast
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key) => {
        const sorted = [...grades].sort((a, b) => {
            const valA = a[key] || "";
            const valB = b[key] || "";
            if (sortOrder === "asc") {
                return valA.toString().localeCompare(valB.toString());
            } else {
                return valB.toString().localeCompare(valA.toString());
            }
        });
        setGrades(sorted);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    };

const handleAdd = () => {
        setEditingGrade(null);
        setModalError(null); 
        setIsModalOpen(true);
    };

    const handleEdit = (grade) => {
        setEditingGrade(grade);
        setModalError(null); 
        setIsModalOpen(true);
    };

const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa điểm này không?")) {
            try {
                // 7. Sửa URL
                await axios.delete(`${API_URL}/grades/${id}`); // Thay đổi URL
                fetchGrades();
                toast.success("Đã xóa điểm thành công!"); // <-- 8. THÊM TOAST THÀNH CÔNG
            } catch (error) {
                console.error("Lỗi khi xóa điểm:", error);
                // 9. THÊM TOAST LỖI
                const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi khi xóa.";
                toast.error(errorMessage);
            }
        }
    };

    const handleSave = async (gradeData) => {
        try {
            if (editingGrade) {
                // 10. Sửa URL
                await axios.put(`${API_URL}/grades/${editingGrade.gradeId}`, gradeData); // Thay đổi URL
                toast.success("Cập nhật điểm thành công!"); // <-- 11. THÊM TOAST THÀNH CÔNG
            } else {
                // 12. Sửa URL
                await axios.post(`${API_URL}/grades`, gradeData); // Thay đổi URL
                toast.success("Thêm điểm mới thành công!"); // <-- 13. THÊM TOAST THÀNH CÔNG
            }
            fetchGrades();
            setIsModalOpen(false);
            setModalError(null); // Xóa lỗi cũ khi thành công
        } catch (error) {
            console.error("Lỗi khi lưu điểm:", error);
            // 14. DÙNG MODAL ERROR
            const errorMessage = error.response?.data?.message || "Đã xảy ra lỗi khi lưu.";
            setModalError(errorMessage);
            // Không đóng modal khi lỗi
        }
    };

    const columns = [
        { title: "Mã điểm", key: "gradeId" },
        { title: "Mã sinh viên", key: "studentCode", sortable: true },
        { title: "Mã lớp", key: "classId" },
        { title: "Điểm chuyên cần", key: "attendanceScore" },
        { title: "Điểm giữa kỳ", key: "midtermScore" },
        { title: "Điểm cuối kỳ", key: "finalScore" },
    ];

const handleCloseModal = () => {
      setIsModalOpen(false);
      setModalError(null); 
    };

    return (
        <div style={{ padding: "40px", textAlign: "center" }}>
            <h2>Trang Quản lý Điểm Sinh viên</h2>

            <div className="search-pagination-controls">    
                <div className="search-input-wrapper">
                    <input
                        type="text"
                        placeholder={`Tìm kiếm theo ${searchType === 'studentCode' ? 'MSSV' : 'Mã lớp'}...`}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                </div>
                <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="search-type-select"
                >
                    <option value="studentCode">Tìm theo MSSV</option>
                    <option value="classId">Tìm theo Mã Lớp</option>
                </select>
                <button onClick={handleAdd} className="add-button">
                    Thêm Điểm
                </button>
            </div>

            {loading && <p style={{ marginTop: 16 }}>Đang tải...</p>}
            {error && <p style={{ marginTop: 16, color: "crimson" }}>{error}</p>}

            {!loading && !error &&
                <Table
                    columns={columns}
                    data={grades
                        .filter(grade => {
                            const lowerCaseSearchTerm = searchTerm.toLowerCase();
                            let match = true;
                            if (searchType === "studentCode") {
                                const studentCode = String(grade.student?.studentCode || grade.studentCode || ""); // Lấy studentCode đúng cách
                                match = studentCode.toLowerCase().includes(lowerCaseSearchTerm);
                            } else if (searchType === "classId") {
                                const classId = String(grade.aClass?.classId || grade.classId || ""); // Lấy classId đúng cách
                                match = classId.includes(lowerCaseSearchTerm); // ID không cần toLowerCase
                            }
                            return match;
                        })
                        // Map lại data để hiển thị đúng và xử lý null
                        .map(g => ({
                            ...g,
                            studentCode: g.student?.studentCode || g.studentCode || "N/A", // Lấy mã SV
                            classId: g.aClass?.classId || g.classId || "N/A", // Lấy mã lớp
                            attendanceScore: g.attendanceScore ?? "-",
                            midtermScore: g.midtermScore ?? "-",
                            finalScore: g.finalScore ?? "-"
                        }))
                    }
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSort={handleSort}
                    sortOrder={sortOrder}
                />
            }

            <GradeModal
                isOpen={isModalOpen}
                onClose={handleCloseModal} 
                onSave={handleSave}
                grade={editingGrade}
                serverError={modalError}
            />
        </div>
    );
};

export default Grades;