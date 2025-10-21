import React, { useEffect, useState } from "react";
import axios from "axios";

import Table from "../../components/Table/Table";

const Grades = () => {
    const [grades, setGrades] = useState([]);
    const [sortOrder, setSortOrder] = useState("asc"); // asc | desc
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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

    const handleEdit = (grade) => {
        console.log("Edit grade:", grade);
        alert(`Sửa điểm cho sinh viên: ${grade.studentCode}`);
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

            {loading && <p style={{ marginTop: 16 }}>Đang tải...</p>}
            {error && <p style={{ marginTop: 16, color: "crimson" }}>{error}</p>}

            {!loading && !error &&
                <Table
                    columns={columns}
                    data={grades.map(g => ({...g, studentCode: g.studentCode ?? "N/A", classId: g.classId ?? "N/A", attendanceScore: g.attendanceScore ?? "-", midtermScore: g.midtermScore ?? "-", finalScore: g.finalScore ?? "-"}))}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSort={handleSort}
                    sortOrder={sortOrder}
                />
            }
        </div>
    );
};

export default Grades;
