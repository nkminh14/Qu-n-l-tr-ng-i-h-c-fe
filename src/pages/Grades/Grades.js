import React, { use, useEffect, useState } from "react";
import axios from "axios";

import Table from "../../components/Table/Table";
import GradeModal from "./GradeModal";

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
            const res = await axios.get("http://localhost:8080/grades");
            setGrades(res.data || []);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách điểm:", err);
            setError("Không thể tải danh sách điểm.");
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
        setIsModalOpen(true);
    };

    const handleEdit = (grade) => {
        setEditingGrade(grade);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa điểm này không?")) {
            try {
                await axios.delete(`http://localhost:8080/grades/${id}`);
                fetchGrades();
            } catch (error) {
                console.error("Lỗi khi xóa điểm:", error);
            }
        }
    };

    const handleSave = async (gradeData) => {
        try {
            if (editingGrade) {
                await axios.put(`http://localhost:8080/grades/${editingGrade.gradeId}`, gradeData);
            } else {
                await axios.post("http://localhost:8080/grades", gradeData);
            }
            fetchGrades();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Lỗi khi lưu điểm:", error);
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

    return (
        <div style={{ padding: "40px", textAlign: "center" }}>
            <h2>📊 Trang Quản lý Điểm Sinh viên</h2>

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
                                const studentCode = String(grade.studentCode || "");
                                match = studentCode.toLowerCase().includes(lowerCaseSearchTerm);
                            } else if (searchType === "classId") {
                                const classId = String(grade.classId || "");
                                match = classId.toLowerCase().includes(lowerCaseSearchTerm);
                            }

                            return match;
                        }) 
                        .map(g => ({...g, studentCode: g.studentCode ?? "N/A", classId: g.classId ?? "N/A", attendanceScore: g.attendanceScore ?? "-", midtermScore: g.midtermScore ?? "-", finalScore: g.finalScore ?? "-"}))
                    }
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSort={handleSort}
                    sortOrder={sortOrder}
                />
            }

            <GradeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                grade={editingGrade}
            />
        </div>
    );
};

export default Grades;