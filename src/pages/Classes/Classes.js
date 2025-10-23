import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "../../components/Table/Table";
import ClassModal from "./ClassModal";
import { Link } from "react-router-dom";
import "./Classes.css";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState(null);
  const [subjects, setSubjects] = useState(null);

  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("subject"); 

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    fetchSubjects();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get("http://localhost:8081/classes");
      setClasses(res.data || []);
    } catch (e) {
      console.error("Lỗi khi lấy danh sách lớp:", e);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await axios.get("http://localhost:8081/teachers");
      setTeachers(res.data || []);
    } catch (e) {
      console.error("Lỗi khi lấy danh sách giảng viên:", e);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get("http://localhost:8081/subjects");
      setSubjects(res.data || []);
    } catch (e) {
      console.error("Lỗi khi lấy danh sách môn học:", e);
    }
  };

  const getTeacherName = (teacherId) => {
    if (!teachers) return "Loading...";
    const t = teachers.find((x) => x.teacherId === teacherId);
    return t ? <Link to="/teachers">{t.name}</Link> : "Chưa gán";
  };

  const getSubjectName = (subjectId, fallback) => {
    if (fallback) return fallback; 
    if (!subjects) return "Loading...";
    const s = subjects.find((x) => x.subjectId === subjectId);
    return s ? <Link to="/subjects">{s.subjectName}</Link> : `#${subjectId}`;
  };

  const handleSort = (columnKey) => {
    const isAsc = sortColumn === columnKey && sortOrder === "asc";
    const newSortOrder = isAsc ? "desc" : "asc";
    setSortColumn(columnKey);
    setSortOrder(newSortOrder);

    const sorted = [...classes].sort((a, b) => {
      const aVal = a[columnKey];
      const bVal = b[columnKey];

      const toStr = (v) => (v === null || v === undefined ? "" : v.toString());

      if (typeof aVal === "number" && typeof bVal === "number") {
        return newSortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      return newSortOrder === "asc"
        ? toStr(aVal).localeCompare(toStr(bVal))
        : toStr(bVal).localeCompare(toStr(aVal));
    });

    setClasses(sorted);
  };

  const handleAdd = () => {
    setEditingClass(null);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setEditingClass(row);
    setIsModalOpen(true);
  };

  const handleDelete = async (rowOrId) => {
    const id = typeof rowOrId === "object" ? rowOrId.classId : Number(rowOrId);
    if (!id) return;
    if (window.confirm("Bạn có chắc muốn xoá lớp này?")) {
      try {
        await axios.delete(`http://localhost:8081/classes/${id}`);
        fetchClasses();
      } catch (e) {
        console.error("Lỗi khi xoá lớp:", e);
      }
    }
  };

  const handleSave = async (classData) => {
    try {
      if (editingClass) {
        await axios.put(
          `http://localhost:8081/classes/${editingClass.classId}`,
          classData
        );
      } else {
        await axios.post("http://localhost:8081/classes", classData);
      }
      fetchClasses();
      setIsModalOpen(false);
    } catch (e) {
      console.error("Lỗi khi lưu lớp:", e);
    }
  };

  const columns = [
    { title: "ID", key: "classId" },
    { title: "Môn học", key: "subjectName", sortable: true },
    { title: "Giảng viên", key: "teacherId" },
    { title: "Học kỳ", key: "semester", sortable: true },
    { title: "Năm học", key: "academicYear", sortable: true },
    { title: "Phòng học", key: "room" },
    { title: "Lịch học", key: "schedule" },
  ];

  const filtered = classes.filter((c) => {
    const q = (searchTerm || "").toLowerCase();
    if (!q) return true;

    switch (searchType) {
      case "classId":
        return String(c.classId ?? "").includes(q);
      case "semester":
        return (c.semester || "").toLowerCase().includes(q);
      case "subject":
      default:
        // Ưu tiên subjectName; nếu không có, thử tìm theo subjects list
        const subjectText =
          (c.subjectName || "").toLowerCase() ||
          (subjects &&
            (subjects.find((s) => s.subjectId === c.subjectId)?.subjectName || "")
              .toLowerCase());
        return subjectText.includes(q);
    }
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentList = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginate = (p) => setCurrentPage(p);

  // map dữ liệu hiển thị: thay tên GV + môn
  const dataForTable = currentList.map((c) => ({
    ...c,
    // Môn học: ưu tiên subjectName từ BE, nếu không có thì tra từ subjects
    subjectName: getSubjectName(c.subjectId, c.subjectName),
    // Giảng viên: cột vẫn là teacherId nhưng hiển thị tên/link
    teacherId: getTeacherName(c.teacherId),
  }));

  return (
    <div className="page-container">
      <h2>🏫 Trang Quản lý Lớp học</h2>

      <div className="search-pagination-controls">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder={`Tìm theo ${
              searchType === "subject" ? "Môn học" : searchType === "classId" ? "ID" : "Học kỳ"
            }...`}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value)}
          className="search-type-select"
        >
          <option value="subject">Tìm theo Môn học</option>
          <option value="classId">Tìm theo ID</option>
          <option value="semester">Tìm theo Học kỳ</option>
        </select>

        <button onClick={handleAdd} className="add-button">
          Thêm Lớp học
        </button>
      </div>

      <div className="table-scroll-container">
        <Table
          columns={columns}
          data={dataForTable}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortOrder={sortOrder}
        />
      </div>

      <div className="pagination">
        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
          Trước
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i + 1}
            onClick={() => paginate(i + 1)}
            className={currentPage === i + 1 ? "active" : ""}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Tiếp
        </button>
      </div>

      <ClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        classInfo={editingClass}
      />
    </div>
  );
};

export default Classes;
