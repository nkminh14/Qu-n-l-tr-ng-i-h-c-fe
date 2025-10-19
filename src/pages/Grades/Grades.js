import React, { useEffect, useState } from "react";
import axios from "axios";

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

    // Hàm sắp xếp theo mã sinh viên
    const handleSortByStudent = () => {
        const sorted = [...grades].sort((a, b) => {
            const an = (a?.studentCode || "").toString();
            const bn = (b?.studentCode || "").toString();
            return sortOrder === "asc" ? an.localeCompare(bn) : bn.localeCompare(an);
        });
        setGrades(sorted);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    };



    return (
        <div style={{ padding: "40px", textAlign: "center" }}>
            <h2>📊 Trang Quản lý Điểm Sinh viên</h2>

            {loading && <p style={{ marginTop: 16 }}>Đang tải...</p>}
            {error && <p style={{ marginTop: 16, color: "crimson" }}>{error}</p>}

            <div style={{ overflowX: "auto", marginTop: 20 }}>
                <table style={styles.table}>
                    <thead>
                    <tr>
                        <th>Mã điểm</th>
                        <th>
                            Mã sinh viên{" "}
                            <button onClick={handleSortByStudent} style={styles.sortButton}>
                                {sortOrder === "asc" ? "↑" : "↓"}
                            </button>
                        </th>
                        <th>Mã lớp</th>
                        <th>Điểm chuyên cần</th>
                        <th>Điểm giữa kỳ</th>
                        <th>Điểm cuối kỳ</th>
                        <th>Điểm trung bình</th>
                    </tr>
                    </thead>
                    <tbody>
                    {!loading && grades?.length > 0 ? (
                        grades.map((g, index) => (
                            <tr key={g.gradeId ?? index}>
                                <td>{g.gradeId}</td>
                                <td>{g.studentCode ?? "N/A"}</td>
                                <td>{g.classId ?? "N/A"}</td>
                                <td>{g.attendanceScore ?? "-"}</td>
                                <td>{g.midtermScore ?? "-"}</td>
                                <td>{g.finalScore ?? "-"}</td>

                            </tr>
                        ))
                    ) : !loading ? (
                        <tr>
                            <td colSpan="7" style={{ padding: 20 }}>
                                Không có dữ liệu điểm.
                            </td>
                        </tr>
                    ) : null}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    table: {
        width: "100%",
        borderCollapse: "collapse",
        backgroundColor: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    },
    sortButton: {
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: 16,
        marginLeft: 5,
    },
};

export default Grades;
