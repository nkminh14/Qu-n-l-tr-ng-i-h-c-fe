import React, { useEffect, useState } from "react";
import axios from "axios";

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc"); // asc | desc

  useEffect(() => { fetchSubjects(); }, []);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get("http://localhost:8080/subjects");
      setSubjects(res.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách môn học:", error);
    }
  };

  // sort theo TÊN MÔN (subjectName)
  const handleSortByName = () => {
    const sorted = [...subjects].sort((a, b) => {
      const an = (a.subjectName || "").toString();
      const bn = (b.subjectName || "").toString();
      return sortOrder === "asc" ? an.localeCompare(bn) : bn.localeCompare(an);
    });
    setSubjects(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>📘 Trang Quản lý Môn học</h2>

      <div style={{ overflowX: "auto", marginTop: "30px" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>
                Tên môn{" "}
                <button onClick={handleSortByName} style={styles.sortButton}>
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </th>
              <th>Số tín chỉ</th>
              <th>Mô tả</th>
              <th>Khoa</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length > 0 ? (
              subjects.map((s, index) => (
                <tr key={s.subjectId ?? index}>
                  <td>{s.subjectId}</td>
                  <td>{s.subjectName}</td>
                  <td>{s.credits}</td>
                  <td>{s.description}</td>
                  <td>{s.facultyName ?? s.facultyId}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: 20 }}>Không có dữ liệu môn học.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// CSS nội tuyến giống Students.js
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

export default Subjects;
