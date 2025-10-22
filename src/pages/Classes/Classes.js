import React, { useEffect, useState } from "react";
import axios from "axios";

import Table from "../../components/Table/Table";
import ClassModal from "./ClassModal";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc"); // asc | desc
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  useEffect(() => { 
    fetchClasses(); 
    fetchTeachers();
  }, []);

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

  const fetchTeachers = async () => {
    try {
        const response = await axios.get("http://localhost:8080/teachers");
        setTeachers(response.data);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách giảng viên:", error);
    }
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find((t) => t.teacherId === teacherId);
    return teacher ? teacher.name : "Chưa gán";
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

  const handleAdd = () => {
    setEditingClass(null);
    setIsModalOpen(true);
  };

  const handleEdit = (classInfo) => {
    setEditingClass(classInfo);
    setIsModalOpen(true);
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

  const handleSave = async (classData) => {
    try {
        if (editingClass) {
            await axios.put(`http://localhost:8080/classes/${editingClass.classId}`, classData);
        } else {
            await axios.post("http://localhost:8080/classes", classData);
        }
        fetchClasses();
        setIsModalOpen(false);
    } catch (error) {
        console.error("Lỗi khi lưu lớp học:", error);
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

  const classDataWithTeacher = classes.map(c => ({
    ...c,
    subjectName: c.subjectName || `#${c.subjectId}`,
    teacherId: getTeacherName(c.teacherId),
  }));

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>🏫 Trang Quản lý Lớp Học</h2>
      <button onClick={handleAdd} style={styles.addButton}>
          Thêm Lớp học
      </button>

      {loading && <p style={{ marginTop: 16 }}>Đang tải...</p>}
      {error && <p style={{ marginTop: 16, color: "crimson" }}>{error}</p>}

      {!loading && !error &&
        <Table
            columns={columns}
            data={classDataWithTeacher}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSort={handleSort}
            sortOrder={sortOrder}
        />
      } 
      <ClassModal
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          classInfo={editingClass}
      />
    </div>
  );
};

const styles = {
    addButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        marginBottom: '20px',
    },
};

export default Classes;
