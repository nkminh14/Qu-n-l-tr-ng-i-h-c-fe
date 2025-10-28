import React, { useEffect, useState } from "react";
import axios from "axios";
import TuitionModal from "./TuitionModal";
import Table from "../../components/Table/Table";
import { Link } from "react-router-dom";
import "./Tuition.css";
import { toast } from "react-toastify";

const Tuition = () => {
  const [tuitions, setTuitions] = useState([]);
  const [students, setStudents] = useState([]);

  // Sort / Search / Pagination
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("studentCode");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTuition, setEditingTuition] = useState(null);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    fetchTuitions();
    fetchStudents();
  }, []);

  const fetchTuitions = async () => {
    try {
      const res = await axios.get("http://localhost:8080/tuitions");
      setTuitions(res.data || []);
    } catch (err) {
      toast.error("Không thể tải danh sách học phí!");
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:8080/students");
      setStudents(res.data || []);
    } catch (err) {
      toast.error("Không thể tải danh sách sinh viên!");
    }
  };

  const getStudentLabel = (studentId, fallbackCode) => {
    if (!students) return "Loading...";
    const st = students.find((s) => s.studentId === studentId);
    if (!st) return fallbackCode || "N/A";
    return <Link to={`/students`}>{`${st.name} (${st.studentCode})`}</Link>;
  };

  const handleSort = (columnKey) => {
    const isAsc = sortColumn === columnKey && sortOrder === "asc";
    const newSortOrder = isAsc ? "desc" : "asc";
    setSortColumn(columnKey);
    setSortOrder(newSortOrder);

    const sorted = [...tuitions].sort((a, b) => {
      const aVal = a[columnKey];
      const bVal = b[columnKey];

      if (columnKey === "startDate" || columnKey === "endDate") {
        const at = new Date(a[columnKey]).getTime();
        const bt = new Date(b[columnKey]).getTime();
        return newSortOrder === "asc" ? at - bt : bt - at;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return newSortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return newSortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    setTuitions(sorted);
  };

  const handleAdd = () => {
    setEditingTuition(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (row) => {
    setEditingTuition(row.__raw || row);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (rowOrId) => {
    const id = typeof rowOrId === "object" ? rowOrId.tuitionId : Number(rowOrId);
    if (!id) return;

    if (window.confirm("Bạn có chắc chắn muốn xóa học phí này không?")) {
      try {
        await axios.delete(`http://localhost:8080/tuitions/${id}`);
        fetchTuitions();
        toast.success("Xóa thành công!");
      } catch (err) {
        toast.error(err.response?.data?.message || "Lỗi khi xóa!");
      }
    }
  };

  const handleSave = async (tuitionData) => {
    try {
      if (editingTuition) {
        await axios.put(
          `http://localhost:8080/tuitions/${editingTuition.tuitionId}`,
          tuitionData
        );
        toast.success("Cập nhật thành công!");
      } else {
        await axios.post("http://localhost:8080/tuitions", tuitionData);
        toast.success("Thêm thành công!");
      }
      fetchTuitions();
      setIsModalOpen(false);
      setModalError(null);
    } catch (err) {
      setModalError(err.response?.data?.message || "Lỗi hệ thống!");
    }
  };

  // === Cột hiển thị ===
  const columns = [
    { title: "ID", key: "tuitionId", sortable: true },
    { title: "Sinh viên", key: "student", sortable: false },
    { title: "Mã SV", key: "studentCode", sortable: true },
    { title: "Học kỳ", key: "semester", sortable: true },
    { title: "Số tiền", key: "amount", sortable: true },
    { title: "Ngày bắt đầu", key: "startDate", sortable: true },
    { title: "Ngày kết thúc", key: "endDate", sortable: true },
    { title: "Trạng thái", key: "status", sortable: true },
  ];

  const filteredTuitions = tuitions.filter((t) => {
    const q = (searchTerm || "").toLowerCase();
    switch (searchType) {
      case "tuitionId":
        return String(t.tuitionId ?? "").includes(q);
      case "semester":
        return (t.semester || "").toLowerCase().includes(q);
      case "status":
        return (t.status || "").toLowerCase().includes(q);
      case "studentCode":
      default:
        return (t.studentCode || "").toLowerCase().includes(q);
    }
  });

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentList = filteredTuitions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredTuitions.length / itemsPerPage);

  const dataWithStudent = currentList.map((t) => {
    return {
      ...t,
      __raw: t,
      student: getStudentLabel(t.studentId, t.studentCode),
      startDate: t.startDate,
      endDate: t.endDate,
    };
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalError(null);
  };

  return (
    <div className="page-container">
      <h2>💳 Trang Quản lý Học phí</h2>

      {/* Search Bar */}
      <div className="search-pagination-controls">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Tìm kiếm..."
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
          <option value="studentCode">Mã SV</option>
          <option value="tuitionId">ID</option>
          <option value="semester">Học kỳ</option>
          <option value="status">Trạng thái</option>
        </select>

        <button onClick={handleAdd} className="add-button">
          Thêm Học phí
        </button>
      </div>

      {/* Table */}
      <div className="table-scroll-container">
        <Table
          columns={columns}
          data={dataWithStudent}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortOrder={sortOrder}
        />
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          Trước
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            className={currentPage === i + 1 ? "active" : ""}
            onClick={() => setCurrentPage(i + 1)}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Tiếp
        </button>
      </div>

      <TuitionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        tuition={editingTuition}
        students={students}
        serverError={modalError}
      />
    </div>
  );
};

export default Tuition;
