import React, { useEffect, useState } from "react";
import axios from "axios";
import TuitionModel from "./TuitionModel";
import Table from "../../components/Table/Table";
import { Link } from "react-router-dom";
import "./Tuition.css";

const Tuition = () => {
  const [tuitions, setTuitions] = useState([]);
  const [students, setStudents] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTuition, setEditingTuition] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("studentCode"); // 'studentCode' | 'semester'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTuitions();
    fetchStudents();
  }, []);

  const fetchTuitions = async () => {
    try {
      const res = await axios.get("http://localhost:8080/tuitions");
      setTuitions(res.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách học phí:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get("http://localhost:8080/students");
      setStudents(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sinh viên:", error);
    }
  };

  const getStudentLink = (studentCode) => {
    const student = students.find((s) => s.studentCode === studentCode);
    return student ? <Link to={`/students`}>{student.name}</Link> : studentCode;
  };

  const handleSort = (columnKey) => {
    const isAsc = sortColumn === columnKey && sortOrder === "asc";
    const newSortOrder = isAsc ? "desc" : "asc";
    setSortColumn(columnKey);
    setSortOrder(newSortOrder);

    const sorted = [...tuitions].sort((a, b) => {
      const aValue = a[columnKey];
      const bValue = b[columnKey];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return newSortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return newSortOrder === "asc" ? aValue - bValue : bValue - aValue;
      } else {
        return 0;
      }
    });
    setTuitions(sorted);
  };

  const handleAdd = () => {
    setEditingTuition(null);
    setIsModalOpen(true);
  };

  const handleEdit = (t) => {
    setEditingTuition(t);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bản ghi học phí này không?")) {
      try {
        await axios.delete(`http://localhost:8080/tuitions/${id}`);
        fetchTuitions();
      } catch (error) {
        console.error("Lỗi khi xóa học phí:", error);
      }
    }
  };

  const handleSave = async (tuitionData) => {
    try {
      if (editingTuition) {
        await axios.put(`http://localhost:8080/tuitions/${editingTuition.tuitionId}`, tuitionData);
      } else {
        await axios.post("http://localhost:8080/tuitions", tuitionData);
      }
      fetchTuitions();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Lỗi khi lưu học phí:", error);
    }
  };

  const columns = [
    { title: "ID", key: "tuitionId" },
    { title: "MSSV", key: "studentCode", sortable: true },
    { title: "Học kỳ", key: "semester", sortable: true },
    { title: "Số tiền", key: "amount"},
    { title: "Ngày đóng", key: "paymentDate" },
    { title: "Trạng thái", key: "status"}
  ];

  // filter
  const filtered = tuitions.filter(t => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    if (searchType === "studentCode") {
      return (t.studentCode || "").toLowerCase().includes(term);
    } else if (searchType === "semester") {
      return (t.semester || "").toLowerCase().includes(term);
    }
    return true;
  });

  // pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const paginate = (n) => {
    if (n < 1) n = 1;
    if (n > totalPages) n = totalPages;
    setCurrentPage(n);
  };

  const tuitionDataWithDetails = currentItems.map((tuition) => ({
    ...tuition,
    studentCode: getStudentLink(tuition.studentCode),
  }));

  return (
    <div className="page-container">
      <h2>💸 Trang Quản lý Học phí</h2>

      <div className="search-pagination-controls">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder={`Tìm kiếm theo ${searchType === "studentCode" ? "MSSV" : "Học kỳ"}...`}
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
          <option value="studentCode">Tìm theo MSSV</option>
          <option value="semester">Tìm theo Học kỳ</option>
        </select>

        <button onClick={handleAdd} className="add-button">Thêm Học phí</button>
      </div>

      <div className="table-scroll-container">
        <Table
          columns={columns}
          data={tuitionDataWithDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortOrder={sortOrder}
        />
      </div>

      <div className="pagination">
        <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>Trước</button>
        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx + 1}
            onClick={() => paginate(idx + 1)}
            className={currentPage === idx + 1 ? "active" : ""}
          >
            {idx + 1}
          </button>
        ))}
        <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>Tiếp</button>
      </div>

      <TuitionModel
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        tuition={editingTuition}
        // studentsDropdown={studentsDropdown}
      />

    </div>
  );
};

export default Tuition;
