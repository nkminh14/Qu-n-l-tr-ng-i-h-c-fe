import React, { useEffect, useState } from "react";
import axios from "axios";

import Table from "../../components/Table/Table";

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

  const handleSort = (key) => {
    const sorted = [...classes].sort((a, b) => {
        const valA = a[key] || "";
        const valB = b[key] || "";
        if (sortOrder === "asc") {
            return valA.toString().localeCompare(valB.toString());
        } else {
            return valB.toString().localeCompare(valA.toString());
        }
    });
    setClasses(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleEdit = (classInfo) => {
    console.log("Edit class:", classInfo);
    alert(`Sửa lớp: ${classInfo.subjectName}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa lớp này không?")) {
        try {
            await axios.delete(`http://localhost:8080/classes/${id}`);
            fetchClasses();
        } catch (error) {
            console.error("Lỗi khi xóa lớp:", error);
        }
    }
  };

  const columns = [
    { title: "ID", key: "classId" },
    { title: "Môn học", key: "subjectName", sortable: true },
    { title: "Giảng viên", key: "teacherId" },
    { title: "Học kỳ", key: "semester" },
    { title: "Năm học", key: "academicYear" },
    { title: "Phòng học", key: "room" },
    { title: "Lịch học", key: "schedule" },
  ];

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>🏫 Trang Quản lý Lớp Học</h2>

      {loading && <p style={{ marginTop: 16 }}>Đang tải...</p>}
      {error && <p style={{ marginTop: 16, color: "crimson" }}>{error}</p>}

      {!loading && !error &&
        <Table
            columns={columns}
            data={classes.map(c => ({...c, subjectName: c.subjectName || `#${c.subjectId}`, teacherId: c.teacherId ?? "Chưa gán"}))}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSort={handleSort}
            sortOrder={sortOrder}
        />
      }
    </div>
  );
};

export default Classes;
