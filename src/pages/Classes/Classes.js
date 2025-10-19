import React, { useEffect, useState } from "react";
import axios from "axios";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc"); // asc | desc
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchClasses(); }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("http://localhost:8080/classes");
      setClasses(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách lớp học:", err);
      setError("Không thể tải danh sách lớp học.");
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị môn học: ưu tiên tên, thiếu thì fallback sang #ID
  const subjectCell = (c) => {
    if (c?.subjectName) return c.subjectName;     // <-- chỉ tên
    if (c?.subjectId)   return `#${c.subjectId}`; // fallback
    return "(Chưa có môn)";
  };

  const handleSortBySubject = () => {
    const sorted = [...classes].sort((a, b) => {
      const an = (a?.subjectName || "").toString();
      const bn = (b?.subjectName || "").toString();
      return sortOrder === "asc" ? an.localeCompare(bn) : bn.localeCompare(an);
    });
    setClasses(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>🏫 Trang Quản lý Lớp Học</h2>

      {loading && <p style={{ marginTop: 16 }}>Đang tải...</p>}
      {error && <p style={{ marginTop: 16, color: "crimson" }}>{error}</p>}

      <div style={{ overflowX: "auto", marginTop: 20 }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>
                Môn học{" "}
                <button onClick={handleSortBySubject} style={styles.sortButton}>
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </th>
              <th>Giảng viên</th>
              <th>Học kỳ</th>
              <th>Năm học</th>
              <th>Phòng học</th>
              <th>Lịch học</th>
            </tr>
          </thead>
          <tbody>
            {!loading && classes?.length > 0 ? (
              classes.map((c, index) => (
                <tr key={c.classId ?? index}>
                  <td>{c.classId}</td>
                  <td>{subjectCell(c)}</td>
                  <td>{c.teacherId ?? "Chưa gán"}</td>
                  <td>{c.semester ?? ""}</td>
                  <td>{c.academicYear ?? ""}</td>
                  <td>{c.room ?? ""}</td>
                  <td>{c.schedule ?? ""}</td>
                </tr>
              ))
            ) : !loading ? (
              <tr>
                <td colSpan="7" style={{ padding: 20 }}>
                  Không có dữ liệu lớp học.
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

export default Classes;
