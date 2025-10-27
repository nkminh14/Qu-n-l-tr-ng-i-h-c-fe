import React, { useEffect, useState } from "react";
import axios from "axios";
import TuitionModal from "./TuitionModel";
import Table from "../../components/Table/Table";
import { Link } from "react-router-dom";
import "./Tuition.css";
import { toast } from "react-toastify";

const Tuition = () => {
  const [tuitions, setTuitions] = useState([]);
  const [students, setStudents] = useState([]);

  // Sort / Search / Pagination
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc"); // asc | desc
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("studentCode"); // studentCode | semester
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
      console.error("Lỗi khi lấy danh sách học phí:", err);
      toast.error("Không thể tải danh sách học phí. Vui lòng thử lại.");
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:8080/students");
      setStudents(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách sinh viên:", err);
      toast.error("Không thể tải danh sách sinh viên. Vui lòng thử lại.");
    }
  };

  const getStudentLink = (studentCode) => {
    if (!students) return "Loading...";
    const student = students.find((s) => s.studentCode === studentCode);
    return student ? <Link to={`/students`}>{student.name}</Link> : "N/A";
  };

  const handleSort = (columnKey) => {
    const isAsc = sortColumn === columnKey && sortOrder === "asc";
    const newSortOrder = isAsc ? "desc" : "asc";
    setSortColumn(columnKey);
    setSortOrder(newSortOrder);

    const sorted = [...tuitions].sort((a, b) => {
      const aVal = a[columnKey];
      const bVal = b[columnKey];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return newSortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else if (typeof aVal === "number" && typeof bVal === "number") {
        return newSortOrder === "asc" ? aVal - bVal : bVal - aVal;
      } else {
        return 0;
      }
    });

    setTuitions(sorted);
  };

  const handleAdd = () => {
    setEditingTuition(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (tuition) => {
    setEditingTuition(tuition);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (rowOrId) => {
    const id =
      typeof rowOrId === "object" ? rowOrId.tuitionId : Number(rowOrId);
    if (!id) return;

    if (window.confirm("Bạn có chắc chắn muốn xóa học phí này không?")) {
      try {
        await axios.delete(`http://localhost:8080/tuitions/${id}`);
        fetchTuitions();
        toast.success("Đã xóa học phí thành công!");
      } catch (err) {
        console.error("Lỗi khi xóa học phí:", err);
        const errorMessage =
          err.response?.data?.message || "Đã xảy ra lỗi khi xóa.";
        toast.error(errorMessage);
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
        toast.success("Cập nhật học phí thành công!");
      } else {
        await axios.post("http://localhost:8080/tuitions", tuitionData);
        toast.success("Thêm học phí mới thành công!");
      }
      fetchTuitions();
      setIsModalOpen(false);
      setModalError(null);
    } catch (err) {
      console.error("Lỗi khi lưu học phí:", err);
      const errorMessage =
        err.response?.data?.message || "Đã xảy ra lỗi khi lưu.";
      setModalError(errorMessage);
    }
  };

  const columns = [
    { title: "ID", key: "tuitionId", sortable: true },
    { title: "MSSV", key: "studentCode", sortable: true },
    { title: "Học kỳ", key: "semester", sortable: true },
    { title: "Số tiền", key: "amount", sortable: true },
    { title: "Ngày đóng", key: "paymentDate" },
    { title: "Trạng thái", key: "status" },
  ];

  const filteredTuitions = tuitions.filter((t) => {
    const q = (searchTerm || "").toLowerCase();
    switch (searchType) {
      case "semester":
        return String(t.semester ?? "").toLowerCase().includes(q);
      case "studentCode":
      default:
        return (t.studentCode || "").toLowerCase().includes(q);
    }
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentList = filteredTuitions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredTuitions.length / itemsPerPage);
  const paginate = (p) => setCurrentPage(p);

  const dataWithStudent = currentList.map((t) => ({
    ...t,
    studentCode: getStudentLink(t.studentCode),
  }));

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalError(null);
  };

  return (
    <div className="page-container">
      <h2>💸 Trang Quản lý Học phí</h2>

      <div className="search-pagination-controls">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder={`Tìm theo ${
              searchType === "studentCode" ? "MSSV" : "Học kỳ"
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
          <option value="studentCode">Tìm theo MSSV</option>
          <option value="semester">Tìm theo Học kỳ</option>
        </select>

        <button onClick={handleAdd} className="add-button">
          Thêm Học phí
        </button>
      </div>

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

      <TuitionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        tuition={editingTuition}
        students={students || []}
        serverError={modalError}
      />
    </div>
  );
};

export default Tuition;
