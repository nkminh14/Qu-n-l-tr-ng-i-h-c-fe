import React, { useEffect, useState } from "react";
import axios from "axios";
import SubjectModal from "./SubjectModal";
import Table from "../../components/Table/Table";
import { Link } from "react-router-dom";
import "./Subjects.css";
import { toast } from "react-toastify";

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);

  // Sort / Search / Pagination
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc"); // asc | desc
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("name"); // name | subjectId | credits
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    fetchSubjects();
    fetchFaculties();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get("http://localhost:8081/subjects");
      setSubjects(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách môn học:", err);
      toast.error("Không thể tải danh sách môn học. Vui lòng thử lại.");
    }
  };

  const fetchFaculties = async () => {
    try {
      const res = await axios.get("http://localhost:8081/faculties");
      setFaculties(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách khoa:", err);
      toast.error("Không thể tải danh sách khoa. Vui lòng thử lại.");
    }
  };

  const getFacultyName = (facultyId) => {
    if (!faculties) return "Loading...";
    const fac = faculties.find((f) => f.facultyId === facultyId);
    return fac ? <Link to={`/faculties`}>{fac.facultyName}</Link> : "N/A";
  };

  // Sort giống Faculties.js
  const handleSort = (columnKey) => {
    const isAsc = sortColumn === columnKey && sortOrder === "asc";
    const newSortOrder = isAsc ? "desc" : "asc";
    setSortColumn(columnKey);
    setSortOrder(newSortOrder);

    const sorted = [...subjects].sort((a, b) => {
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

    setSubjects(sorted);
  };

  const handleAdd = () => {
    setEditingSubject(null);
    setModalError(null); // reset lỗi cũ
    setIsModalOpen(true);
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setModalError(null); // reset lỗi cũ
    setIsModalOpen(true);
  };

  const handleDelete = async (rowOrId) => {
    const id =
      typeof rowOrId === "object" ? rowOrId.subjectId : Number(rowOrId);
    if (!id) return;

    if (window.confirm("Bạn có chắc chắn muốn xóa môn học này không?")) {
      try {
        await axios.delete(`http://localhost:8081/subjects/${id}`);
        fetchSubjects();
        toast.success("Đã xóa môn học thành công!");
      } catch (err) {
        console.error("Lỗi khi xóa môn học:", err);
        const errorMessage =
          err.response?.data?.message || "Đã xảy ra lỗi khi xóa.";
        toast.error(errorMessage);
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
        toast.success("Cập nhật môn học thành công!");
      } else {
        await axios.post("http://localhost:8081/subjects", subjectData);
        toast.success("Thêm môn học mới thành công!");
      }
      fetchSubjects();
      setIsModalOpen(false);
      setModalError(null);
    } catch (err) {
      console.error("Lỗi khi lưu môn học:", err);
      const errorMessage =
        err.response?.data?.message || "Đã xảy ra lỗi khi lưu.";
      // Hiển thị lỗi bên trong modal
      setModalError(errorMessage);
      // Không đóng modal để người dùng sửa lại
    }
  };

  const columns = [
    { title: "ID", key: "subjectId", sortable: true },
    { title: "Tên môn", key: "subjectName", sortable: true },
    { title: "Số tín chỉ", key: "credits", sortable: true },
    { title: "Mô tả", key: "description" },
    { title: "Khoa", key: "facultyId" },
  ];

  // Filter giống Faculties.js
  const filteredSubjects = subjects.filter((s) => {
    const q = (searchTerm || "").toLowerCase();
    switch (searchType) {
      case "subjectId":
        return String(s.subjectId ?? "").includes(q);
      case "credits":
        return String(s.credits ?? "").includes(q);
      case "name":
      default:
        return (s.subjectName || "").toLowerCase().includes(q);
    }
  });

  // Pagination giống Faculties.js
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentList = filteredSubjects.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
  const paginate = (p) => setCurrentPage(p);

  // Render cột Khoa bằng tên + Link
  const dataWithFaculty = currentList.map((s) => ({
    ...s,
    facultyId: getFacultyName(s.facultyId),
  }));

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalError(null); // clear lỗi khi đóng modal
  };

  return (
    <div className="page-container">
      <h2>📘 Trang Quản lý Môn học</h2>

      <div className="search-pagination-controls">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder={`Tìm theo ${
              searchType === "name"
                ? "Tên môn"
                : searchType === "subjectId"
                ? "ID"
                : "Số tín chỉ"
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
          <option value="name">Tìm theo Tên môn</option>
          <option value="subjectId">Tìm theo ID</option>
          <option value="credits">Tìm theo Số tín chỉ</option>
        </select>

        <button onClick={handleAdd} className="add-button">
          Thêm Môn học
        </button>
      </div>

      <div className="table-scroll-container">
        <Table
          columns={columns}
          data={dataWithFaculty}
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

      <SubjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        subject={editingSubject}
        faculties={faculties || []}
        serverError={modalError}
      />
    </div>
  );
};

export default Subjects;
