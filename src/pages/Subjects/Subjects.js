import React, { useEffect, useState } from "react";
import axios from "axios";
import SubjectModal from "./SubjectModal";
import Table from "../../components/Table/Table";
import { Link } from "react-router-dom";

const SUBJECT_API = "http://localhost:8081/subjects";
const FACULTY_API = "http://localhost:8081/faculties";

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc"); // asc | desc
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  useEffect(() => {
    fetchSubjects();
    fetchFaculties();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(SUBJECT_API);
      setSubjects(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách môn học:", err);
    }
  };

  const fetchFaculties = async () => {
    try {
      const res = await axios.get(FACULTY_API);
      setFaculties(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách khoa:", err);
    }
  };

  // Lấy tên khoa từ facultyId
  const getFacultyName = (facultyId) => {
    const fac = faculties.find((f) => f.facultyId === facultyId);
    return fac ? <Link to={`/faculties`}>{fac.facultyName}</Link> : "N/A";
  };

  // Sắp xếp theo Tên môn
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
        await axios.delete(`${SUBJECT_API}/${id}`);
        fetchSubjects();
      } catch (err) {
        console.error("Lỗi khi xóa môn học:", err);
      }
    }
  };

  const handleSave = async (subjectData) => {
    // subjectData nên gồm: { subjectName, credits, description, facultyId }
    try {
      if (editingSubject) {
        await axios.put(`${SUBJECT_API}/${editingSubject.subjectId}`, subjectData);
      } else {
        await axios.post(SUBJECT_API, subjectData);
      }
      fetchSubjects();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Lỗi khi lưu môn học:", err);
    }
  };

  const columns = [
    { title: "ID", key: "subjectId" },
    { title: "Tên môn", key: "subjectName", sortable: true },
    { title: "Số tín chỉ", key: "credits" },
    { title: "Mô tả", key: "description" },
    { title: "Khoa", key: "facultyId" },
  ];

  // Thêm tên khoa vào bảng hiển thị
  const dataWithFaculty = subjects.map((s) => ({
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
        data={dataWithFaculty}
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
        faculties={faculties} // giúp modal render dropdown chọn khoa
      />
    </div>
  );
};

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
