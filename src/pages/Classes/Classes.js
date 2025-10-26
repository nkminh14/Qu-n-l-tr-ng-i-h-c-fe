import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "../../components/Table/Table";
import ClassModal from "./ClassModal";
import { Link } from "react-router-dom";
import "./Classes.css";
import { toast } from "react-toastify";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Sort / Search / Pagination
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc"); // asc | desc
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("subject"); // subject | classId | semester
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [modalError, setModalError] = useState(null);

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
      toast.error("Không thể tải danh sách lớp. Vui lòng thử lại.");
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await axios.get("http://localhost:8081/teachers");
      setTeachers(res.data || []);
    } catch (e) {
      console.error("Lỗi khi lấy danh sách giảng viên:", e);
      toast.error("Không thể tải danh sách giảng viên. Vui lòng thử lại.");
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get("http://localhost:8081/subjects");
      setSubjects(res.data || []);
    } catch (e) {
      console.error("Lỗi khi lấy danh sách môn học:", e);
      toast.error("Không thể tải danh sách môn học. Vui lòng thử lại.");
    }
  };

  const getTeacherName = (teacherId) => {
    const t = teachers.find((x) => x.teacherId === teacherId);
    return t ? <Link to="/teachers">{t.name}</Link> : "Chưa gán";
  };

  const getSubjectName = (subjectId, fallback) => {
    if (fallback) return fallback;
    const s = subjects.find((x) => x.subjectId === subjectId);
    return s ? <Link to="/subjects">{s.subjectName}</Link> : (subjectId ? `#${subjectId}` : "Chưa gán");
  };

  const dayLabel = (d) =>
    ({ 1: "CN", 2: "T2", 3: "T3", 4: "T4", 5: "T5", 6: "T6", 7: "T7" }[d] || "");

  const trimTime = (t) => (t ? t.slice(0, 5) : "");

  // Sort giống Faculties.js
  const handleSort = (columnKey) => {
    const isAsc = sortColumn === columnKey && sortOrder === "asc";
    const newSortOrder = isAsc ? "desc" : "asc";
    setSortColumn(columnKey);
    setSortOrder(newSortOrder);

    const sorted = [...classes].sort((a, b) => {
      const aVal = a[columnKey];
      const bVal = b[columnKey];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return newSortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        return newSortOrder === "asc" ? aVal - bVal : bVal - aVal;
      } else {
        const toStr = (v) => (v == null ? "" : String(v));
        return newSortOrder === "asc"
          ? toStr(aVal).localeCompare(toStr(bVal))
          : toStr(bVal).localeCompare(toStr(aVal));
      }
    });

    setClasses(sorted);
  };

  const handleAdd = () => {
    setEditingClass(null);
    setModalError(null); // reset lỗi cũ
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setEditingClass(row);
    setModalError(null); // reset lỗi cũ
    setIsModalOpen(true);
  };

  const handleDelete = async (rowOrId) => {
    const id = typeof rowOrId === "object" ? rowOrId.classId : Number(rowOrId);
    if (!id) return;

    if (window.confirm("Bạn có chắc muốn xoá lớp này?")) {
      try {
        await axios.delete(`http://localhost:8081/classes/${id}`);
        fetchClasses();
        toast.success("Đã xoá lớp thành công!");
      } catch (e) {
        console.error("Lỗi khi xoá lớp:", e);
        const msg = e?.response?.data?.message || "Đã xảy ra lỗi khi xoá.";
        toast.error(msg);
      }
    }
  };

  // Save giống Faculties.js: thành công → toast + đóng modal; lỗi → hiển thị trong modal
  const handleSave = async (classData) => {
    try {
      if (editingClass) {
        await axios.put(
          `http://localhost:8081/classes/${editingClass.classId}`,
          classData
        );
        toast.success("Cập nhật lớp học thành công!");
      } else {
        await axios.post("http://localhost:8081/classes", classData);
        toast.success("Thêm lớp học mới thành công!");
      }
      fetchClasses();
      setIsModalOpen(false);
      setModalError(null);
    } catch (e) {
      console.error("Lỗi khi lưu lớp học:", e);
      const status = e?.response?.status;
      const msg = e?.response?.data?.message || "Đã xảy ra lỗi khi lưu.";
      // 409 (trùng giờ/phòng) cũng sẽ hiển thị trong modal
      setModalError(msg);
      // Không đóng modal để người dùng chỉnh lại
      if (status !== 409) {
        // tuỳ chọn: có thể thêm toast để biết có lỗi khác
        // toast.error(msg);
      }
    }
  };

  const columns = [
    { title: "ID", key: "classId", sortable: true },
    { title: "Môn học", key: "subjectName", sortable: true },
    { title: "Giảng viên", key: "teacherId" },
    { title: "Thứ", key: "dayOfWeek" },
    { title: "Giờ học", key: "timeRange" },
    { title: "Học kỳ", key: "semester", sortable: true },
    { title: "Năm học", key: "academicYear", sortable: true },
    { title: "Phòng", key: "room" },
  ];

  // Filter giống Faculties.js
  const filtered = classes.filter((c) => {
    const q = (searchTerm || "").toLowerCase();
    if (!q) return true;

    switch (searchType) {
      case "classId":
        return String(c.classId || "").includes(q);
      case "semester":
        return (c.semester || "").toLowerCase().includes(q);
      case "subject":
      default: {
        const subjectText =
          (c.subjectName || "") ||
          (subjects.find((s) => s.subjectId === c.subjectId)?.subjectName || "");
        return subjectText.toLowerCase().includes(q);
      }
    }
  });

  // Pagination giống Faculties.js
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentList = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginate = (p) => setCurrentPage(p);

  // Chuẩn bị data hiển thị
  const dataForTable = currentList.map((c) => ({
    ...c,
    subjectName: getSubjectName(c.subjectId, c.subjectName),
    teacherId: getTeacherName(c.teacherId),
    dayOfWeek: dayLabel(c.dayOfWeek),
    timeRange: `${trimTime(c.startTime)} - ${trimTime(c.endTime)}`,
  }));

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalError(null); // clear lỗi khi đóng modal
  };

  return (
    <>
      <div className="page-container">
        <h2> Trang Quản lý Lớp học</h2>

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
          <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
            Tiếp
          </button>
        </div>
      </div>

      <ClassModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        classInfo={editingClass}
        serverError={modalError}   // ⬅️ lỗi hiển thị bên trong modal
        teachers={teachers}        // nếu cần select GV trong modal
        subjects={subjects}        // nếu cần select Môn trong modal
      />
    </>
  );
};

export default Classes;
