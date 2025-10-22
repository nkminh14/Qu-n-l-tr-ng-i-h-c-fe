import React, { useEffect, useState } from "react";
import axios from "axios";
import SubjectModal from "./SubjectModal";
import Table from "../../components/Table/Table";
import { Link } from "react-router-dom";
import "./Subjects.css";

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]); 
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc"); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("name"); 

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchSubjects();
    fetchFaculties();
  }, []);

  const fetchSubjects = async () => {
    try {
      const res = await axios.get("http://localhost:8080/subjects");
      setSubjects(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách môn học:", err);
    }
  };

  const fetchFaculties = async () => {
    try {
      const res = await axios.get("http://localhost:8080/faculties");
      setFaculties(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách khoa:", err);
    }
  };

  const getFacultyName = (facultyId) => {
    if (!faculties) return "Loading...";
    const fac = faculties.find((f) => f.facultyId === facultyId);
    return fac ? <Link to={`/faculties`}>{fac.facultyName}</Link> : "N/A";
  };

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
    setIsModalOpen(true);
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleDelete = async (rowOrId) => {
    const id =
      typeof rowOrId === "object" ? rowOrId.subjectId : Number(rowOrId);
    if (!id) return;

    if (window.confirm("Bạn có chắc chắn muốn xóa môn học này không?")) {
      try {
        await axios.delete(`http://localhost:8080/subjects/${id}`);
        fetchSubjects();
      } catch (err) {
        console.error("Lỗi khi xóa môn học:", err);
      }
    }
  };

  const handleSave = async (subjectData) => {
    try {
      if (editingSubject) {
        await axios.put(
          `http://localhost:8080/subjects/${editingSubject.subjectId}`,
          subjectData
        );
      } else {
        await axios.post("http://localhost:8080/subjects", subjectData);
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
    { title: "Số tín chỉ", key: "credits", sortable: true },
    { title: "Mô tả", key: "description" },
    { title: "Khoa", key: "facultyId" },
  ];

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

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentList = filteredSubjects.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
  const paginate = (p) => setCurrentPage(p);

  const dataWithFaculty = currentList.map((s) => ({
    ...s,
    facultyId: getFacultyName(s.facultyId),
  }));

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
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Tiếp
        </button>
      </div>

      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        subject={editingSubject}
        faculties={faculties || []} 
      />
    </div>
  );
};

export default Subjects;
