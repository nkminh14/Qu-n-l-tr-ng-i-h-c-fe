import React, { useEffect, useState } from "react";
import axios from "axios";
import SubjectModal from "./SubjectModal";
import Table from "../../components/Table/Table";
import { Link } from "react-router-dom";

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc"); // asc | desc
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  // Gọi API lấy danh sách môn học và khoa
  useEffect(() => {
    fetchSubjects();
    fetchFaculties();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get("http://localhost:8081/subjects");
      setSubjects(response.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách môn học:", error);
    }
  };

  const fetchFaculties = async () => {
    try {
      const response = await axios.get("http://localhost:8081/faculties");
      setFaculties(response.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách khoa:", error);
    }
  };

  // Lấy tên khoa từ facultyId
  const getFacultyName = (facultyId) => {
    const faculty = faculties.find((f) => f.facultyId === facultyId);
    return faculty ? <Link to={`/faculties`}>{faculty.facultyName}</Link> : "N/A";
  };

  // Sắp xếp danh sách theo tên môn
  const handleSortByName = () => {
    const sorted = [...subjects].sort((a, b) => {
      const an = (a.subjectName || "").toString();
      const bn = (b.subjectName || "").toString();
      return sortOrder === "asc" ? an.localeCompare(bn) : bn.localeCompare(an);
    });
    setSubjects(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleAdd = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa môn học này không?")) {
      try {
        await axios.delete(`http://localhost:8081/subjects/${id}`);
        fetchSubjects();
      } catch (error) {
        console.error("Lỗi khi xóa môn học:", error);
      }
    }
  };

  const handleSave = async (subjectData) => {
    try {
      if (editingSubject) {
        await axios.put(
          `http://localhost:8081/subjects/${editingSubject.subjectId}`,
          subjectData
        );
      } else {
        await axios.post("http://localhost:8081/subjects", subjectData);
      }
      fetchSubjects();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi lưu môn học:", error);
    }
  };

  const columns = [
    { title: "ID", key: "subjectId" },
    { title: "Tên môn", key: "subjectName", sortable: true },
    { title: "Số tín chỉ", key: "credits" },
    { title: "Mô tả", key: "description" },
    { title: "Khoa", key: "facultyId" },
  ];

  // Thêm tên khoa vào dữ liệu hiển thị
  const subjectDataWithFaculty = subjects.map((s) => ({
    ...s,
    facultyId: getFacultyName(s.facultyId),
  }));

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>📘 Trang Quản lý Môn học</h2>
      <button onClick={handleAdd} style={styles.addButton}>
        Thêm Môn học
      </button>
      <Table
        columns={columns}
        data={subjectDataWithFaculty}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSort={handleSortByName}
        sortOrder={sortOrder}
      />
      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        subject={editingSubject}
        faculties={faculties} // để modal có dropdown chọn khoa
      />
    </div>
  );
};

// CSS (giống Students.js)
const styles = {
  addButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    marginBottom: "20px",
  },
};

export default Subjects;
