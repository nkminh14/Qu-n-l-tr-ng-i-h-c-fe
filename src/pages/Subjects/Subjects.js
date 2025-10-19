import React, { useEffect, useState } from "react";
import axios from "axios";

import Table from "../../components/Table/Table";

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

  const handleSort = (key) => {
    const sorted = [...subjects].sort((a, b) => {
      const valA = a[key] || "";
      const valB = b[key] || "";
      if (sortOrder === "asc") {
        return valA.toString().localeCompare(valB.toString());
      } else {
        return valB.toString().localeCompare(valA.toString());
      }
    });
    setSubjects(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleEdit = (subject) => {
    console.log("Edit subject:", subject);
    alert(`Sửa môn học: ${subject.subjectName}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa môn học này không?")) {
      try {
        await axios.delete(`http://localhost:8080/subjects/${id}`);
        fetchSubjects();
      } catch (error) {
        console.error("Lỗi khi xóa môn học:", error);
      }
    }
  };

  const columns = [
    { title: "ID", key: "subjectId" },
    { title: "Tên môn", key: "subjectName", sortable: true },
    { title: "Số tín chỉ", key: "credits" },
    { title: "Mô tả", key: "description" },
    { title: "Khoa", key: "facultyName" },
  ];

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>📘 Trang Quản lý Môn học</h2>
      <Table
        columns={columns}
        data={subjects.map(s => ({...s, facultyName: s.facultyName ?? s.facultyId}))}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSort={handleSort}
        sortOrder={sortOrder}
      />
    </div>
  );
};

export default Subjects;
