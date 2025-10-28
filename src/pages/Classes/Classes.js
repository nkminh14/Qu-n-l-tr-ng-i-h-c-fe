import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "../../components/Table/Table";
import ClassModal from "./ClassModal";
import { Link } from "react-router-dom";
import "./Classes.css";
import { toast } from "react-toastify";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);   // dùng để hiển thị tên GV trong bảng
  const [subjects, setSubjects] = useState([]);

  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("subject");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      // 2. Sửa URL
      const res = await axios.get(`${API_URL}/classes`); // Thay đổi URL
      setClasses(res.data || []);
    } catch (e) {
      console.error("Lỗi khi lấy danh sách lớp:", e);
      toast.error("Không thể tải danh sách lớp. Vui lòng thử lại.");
    }
  };

const fetchTeachers = async () => {
    try {
      // 3. Sửa URL
      const res = await axios.get(`${API_URL}/teachers`); // Thay đổi URL
      setTeachers(res.data || []);
    } catch (e) {
      console.error("Lỗi khi lấy danh sách giảng viên:", e);
      toast.error("Không thể tải danh sách giảng viên. Vui lòng thử lại.");
    }
  };

  const fetchSubjects = async () => {
    try {
      // 4. Sửa URL
      const res = await axios.get(`${API_URL}/subjects`); // Thay đổi URL
      setSubjects(res.data || []);
    } catch (e) {
      console.error("Lỗi khi lấy danh sách môn học:", e);
      toast.error("Không thể tải danh sách môn học. Vui lòng thử lại.");
    }
  };

  // ⬇️ HÀM MỚI: lấy danh sách GV đúng môn (truyền xuống Modal)
const getTeachersBySubject = async (subjectId) => {
    if (!subjectId) return [];
    try { // Thêm try-catch
      // 5. Sửa URL
      const res = await axios.get(`${API_URL}/teachers/subject/${subjectId}`); // Thay đổi URL (Giả sử API là /teachers/subject/{id})
      return res.data || [];
    } catch (e) {
      console.error(`Lỗi khi lấy GV cho môn học ${subjectId}:`, e);
      toast.error(`Không thể tải danh sách GV cho môn học này.`);
      return []; // Trả về mảng rỗng khi lỗi
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

  const isoToVN = (s) => {
    if (!s) return "";
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? `${m[3]}/${m[2]}/${m[1]}` : s;
  };
  const displayVN = (s) => (!s ? "" : (/^\d{2}\/\d{2}\/\d{4}$/.test(s) ? s : isoToVN(s)));
  const trimTime = (t) => (t ? t.slice(0, 5) : "");

  const handleSort = (columnKey) => {
    const isAsc = sortColumn === columnKey && sortOrder === "asc";
    const newSortOrder = isAsc ? "desc" : "asc";
    setSortColumn(columnKey);
    setSortOrder(newSortOrder);

    const sorted = [...classes].sort((a, b) => {
      const aVal = a[columnKey];
      const bVal = b[columnKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return newSortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        return newSortOrder === "asc" ? aVal - bVal : bVal - aVal;
      } else {
        const toStr = (v) => (v == null ? "" : String(v));
        return newSortOrder === "asc" ? toStr(aVal).localeCompare(toStr(bVal)) : toStr(bVal).localeCompare(toStr(aVal));
      }
    });

    setClasses(sorted);
  };

  const handleAdd = () => {
    setEditingClass(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setEditingClass(row);
    setModalError(null);
    setIsModalOpen(true);
  };

const handleDelete = async (rowOrId) => {
    const id = typeof rowOrId === "object" ? rowOrId.classId : Number(rowOrId);
    if (!id) return;
    if (window.confirm("Bạn có chắc muốn xoá lớp này?")) {
      try {
        // 6. Sửa URL
        await axios.delete(`${API_URL}/classes/${id}`); // Thay đổi URL
        fetchClasses();
        toast.success("Đã xoá lớp thành công!");
      } catch (e) {
        console.error("Lỗi khi xoá lớp:", e);
        const msg = e?.response?.data?.message || "Đã xảy ra lỗi khi xoá.";
        toast.error(msg);
      }
    }
  };

const handleSave = async (classData) => {
    try {
      if (editingClass) {
        // 7. Sửa URL
        await axios.put(`${API_URL}/classes/${editingClass.classId}`, classData); // Thay đổi URL
        toast.success("Cập nhật lớp học thành công!");
      } else {
        // 8. Sửa URL
        await axios.post(`${API_URL}/classes`, classData); // Thay đổi URL
        toast.success("Thêm lớp học mới thành công!");
      }
      fetchClasses();
      setIsModalOpen(false);
      setModalError(null);
    } catch (e) {
      console.error("Lỗi khi lưu lớp học:", e);
      const msg = e?.response?.data?.message || "Đã xảy ra lỗi khi lưu.";
      setModalError(msg);
    }
  };

  const columns = [
    { title: "ID", key: "classId", sortable: true },
    { title: "Môn học", key: "subjectName", sortable: true },
    { title: "Giảng viên", key: "teacherId" },
    { title: "Ngày học", key: "studyDate", sortable: true },
    { title: "Giờ học", key: "timeRange" },
    { title: "Học kỳ", key: "semester", sortable: true },
    { title: "Năm học", key: "academicYear", sortable: true },
    { title: "Phòng", key: "room" },
  ];

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

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentList = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginate = (p) => setCurrentPage(p);

  const dataForTable = currentList.map((c) => ({
    ...c,
    subjectName: getSubjectName(c.subjectId, c.subjectName),
    teacherId: getTeacherName(c.teacherId),
    studyDate: displayVN(c.studyDate),
    timeRange: `${trimTime(c.startTime)} - ${trimTime(c.endTime)}`,
  }));

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalError(null);
  };

  return (
    <>
      <div className="page-container">
        <h2>Trang Quản lý Lớp học</h2>

        <div className="search-pagination-controls">
          <div className="search-input-wrapper">
            <input
              type="text"
              placeholder={`Tìm theo ${searchType === "subject" ? "Môn học" : searchType === "classId" ? "ID" : "Học kỳ"}...`}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
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

          <button onClick={handleAdd} className="add-button">Thêm Lớp học</button>
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
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Trước</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i + 1} onClick={() => paginate(i + 1)} className={currentPage === i + 1 ? "active" : ""}>
              {i + 1}
            </button>
          ))}
          <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Tiếp</button>
        </div>
      </div>

      <ClassModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        classInfo={editingClass}
        serverError={modalError}
        subjects={subjects}
        // ✅ Chỉ sửa phần giảng viên: truyền hàm lấy GV theo môn
        getTeachersBySubject={getTeachersBySubject}
      />
    </>
  );
};

export default Classes;
