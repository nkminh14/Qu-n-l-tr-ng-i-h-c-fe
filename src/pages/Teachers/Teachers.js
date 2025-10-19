import React, { useState, useMemo, useEffect } from "react";
import "./Teachers.css";

const TeacherModal = ({ teacher, onSave, onCancel }) => {
    const [formData, setFormData] = useState(teacher || { name: "", academicRank: "", phoneNumber: "", email: "", experience: "", facultyId: "" });

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Ensure experience and facultyId are numbers
        setFormData({ ...formData, [name]: (name === "experience" || name === "facultyId") ? Number(value) : value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        for (const key in formData) {
            if (formData[key] === "" || formData[key] === null || formData[key] === undefined) {
                alert("Vui lòng điền đầy đủ thông tin.");
                return;
            }
        }
        if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            alert("Email không hợp lệ.");
            return;
        }
        if (!/^\d{10}$/.test(formData.phoneNumber)) {
            alert("Số điện thoại không hợp lệ (yêu cầu 10 chữ số).");
            return;
        }
        if (isNaN(formData.experience) || formData.experience < 0) {
            alert("Kinh nghiệm phải là một số dương.");
            return;
        }
        if (isNaN(formData.facultyId) || formData.facultyId <= 0) {
            alert("ID Khoa phải là một số dương.");
            return;
        }
        onSave(formData);
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>{teacher ? "Chỉnh sửa Giảng viên" : "Thêm Giảng viên"}</h2>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Tên" />
                    <input type="text" name="academicRank" value={formData.academicRank} onChange={handleChange} placeholder="Học hàm" />
                    <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="SĐT" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" />
                    <input type="number" name="facultyId" value={formData.facultyId} onChange={handleChange} placeholder="ID Khoa" />
                    <input type="number" name="experience" value={formData.experience} onChange={handleChange} placeholder="Kinh nghiệm (năm)" />
                    <div className="modal-actions">
                        <button type="submit">Lưu</button>
                        <button type="button" onClick={onCancel}>Hủy</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);

    const itemsPerPage = 10;
    const API_BASE_URL = "http://localhost:8081/api/teachers";

    const fetchTeachers = async (query = "") => {
        try {
            const url = query ? `${API_BASE_URL}/search?${query}` : API_BASE_URL;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setTeachers(data);
        } catch (error) {
            console.error("Error fetching teachers:", error);
            alert("Failed to fetch teachers. Please check the server connection.");
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const sortedAndFilteredTeachers = useMemo(() => {
        let filteredTeachers = [...teachers];

        if (sortConfig.key) {
            filteredTeachers.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === "ascending" ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === "ascending" ? 1 : -1;
                }
                return 0;
            });
        }
        return filteredTeachers;
    }, [teachers, sortConfig]);

    const paginatedTeachers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedAndFilteredTeachers.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedAndFilteredTeachers, currentPage]);

    const totalPages = Math.ceil(sortedAndFilteredTeachers.length / itemsPerPage);

    const requestSort = (key) => {
        let direction = "ascending";
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
    };

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        setCurrentPage(1);

        // Construct query parameters for search
        const params = new URLSearchParams();
        if (value) {
            // Assuming backend search can handle a single query parameter for name, email, or facultyId
            // You might need to adjust this based on your backend's exact search implementation
            params.append('name', value);
            params.append('email', value);
            params.append('facultyId', value);
        }
        await fetchTeachers(params.toString());
    };

    const handleAdd = () => {
        setEditingTeacher(null);
        setIsModalOpen(true);
    };

    const handleEdit = (teacher) => {
        setEditingTeacher(teacher);
        setIsModalOpen(true);
    };

    const handleDelete = async (teacherId) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa giảng viên này?")) {
            try {
                const response = await fetch(`${API_BASE_URL}/${teacherId}`, {
                    method: "DELETE",
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                fetchTeachers(); // Re-fetch teachers after deletion
            } catch (error) {
                console.error("Error deleting teacher:", error);
                alert("Failed to delete teacher.");
            }
        }
    };

    const handleSave = async (teacherData) => {
        try {
            let response;
            if (editingTeacher) {
                // Update existing teacher
                response = await fetch(`${API_BASE_URL}/${editingTeacher.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(teacherData),
                });
            } else {
                // Add new teacher
                response = await fetch(API_BASE_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(teacherData),
                });
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            setIsModalOpen(false);
            setEditingTeacher(null);
            fetchTeachers(); // Re-fetch teachers after save
        } catch (error) {
            console.error("Error saving teacher:", error);
            alert("Failed to save teacher.");
        }
    };

    return (
        <div className="teachers-container">
            <h1>Quản lý Giảng viên</h1>
            <div className="toolbar">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo Tên, Email, ID Khoa..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className="search-input"
                />
                <button onClick={handleAdd} className="add-btn">Thêm Giảng viên</button>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th onClick={() => requestSort("name")}>
                            Tên {sortConfig.key === "name" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                        </th>
                        <th>Học hàm</th>
                        <th>SĐT</th>
                        <th>Email</th>
                        <th onClick={() => requestSort("facultyId")}>
                            ID Khoa {sortConfig.key === "facultyId" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                        </th>
                        <th onClick={() => requestSort("experience")}>
                            Kinh nghiệm {sortConfig.key === "experience" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                        </th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedTeachers.map((teacher) => (
                        <tr key={teacher.id}>
                            <td>{teacher.id}</td>
                            <td>{teacher.name}</td>
                            <td>{teacher.academicRank}</td>
                            <td>{teacher.phoneNumber}</td>
                            <td>{teacher.email}</td>
                            <td>{teacher.facultyId}</td>
                            <td>{teacher.experience} năm</td>
                            <td>
                                <button onClick={() => handleEdit(teacher)} className="edit-btn">Sửa</button>
                                <button onClick={() => handleDelete(teacher.id)} className="delete-btn">Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? "active" : ""}
                    >
                        {page}
                    </button>
                ))}
            </div>

            {isModalOpen && (
                <TeacherModal
                    teacher={editingTeacher}
                    onSave={handleSave}
                    onCancel={() => {
                        setIsModalOpen(false);
                        setEditingTeacher(null);
                    }}
                />
            )}
        </div>
    );
};

export default Teachers;