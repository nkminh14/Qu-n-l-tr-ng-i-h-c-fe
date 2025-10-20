import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "../../components/Table/Table";

const Tuition = () => {
    const [tuitions, setTuitions] = useState([]);
    const [sortOrder, setSortOrder] = useState("asc"); // asc | desc
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchTuitions();
    }, []);

    const fetchTuitions = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await axios.get("http://localhost:8080/tuitions");
            setTuitions(res.data || []);
        } catch (err) {
            console.error("Lỗi khi lấy danh sách học phí:", err);
            setError("Không thể tải danh sách học phí.");
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key) => {
        const sorted = [...tuitions].sort((a, b) => {
            const valA = a[key] || "";
            const valB = b[key] || "";
            if (sortOrder === "asc") {
                return valA.toString().localeCompare(valB.toString());
            } else {
                return valB.toString().localeCompare(valA.toString());
            }
        });
        setTuitions(sorted);
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    };

    const handleEdit = (tuition) => {
        console.log("Edit tuition:", tuition);
        alert(`Sửa học phí cho sinh viên: ${tuition.studentCode}`);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn xóa học phí này không?")) {
            try {
                await axios.delete(`http://localhost:8080/tuitions/${id}`);
                fetchTuitions();
            } catch (error) {
                console.error("Lỗi khi xóa học phí:", error);
            }
        }
    };

    const statusBadge = (status) => {
        const color =
            status === "PAID"
                ? "#4caf50"
                : status === "PARTIAL"
                    ? "#ff9800"
                    : "#f44336";
        return (
            <span style={{ backgroundColor: color, color: "#fff", padding: "4px 8px", borderRadius: 8 }}>
        {status}
      </span>
        );
    };

    const columns = [
        { title: "ID", key: "tuitionId" },
        { title: "MSSV", key: "studentCode", sortable: true },
        { title: "Học kỳ", key: "semester" },
        { title: "Số tiền", key: "amount" },
        { title: "Ngày đóng", key: "paymentDate" },
        { title: "Trạng thái", key: "status" },
        { title: "Sinh viên", key: "studentName" },
    ];

    const data = tuitions.map(t => ({
        ...t,
        amount: t.amount?.toLocaleString("vi-VN") + " ₫",
        status: statusBadge(t.status),
        studentName: t.studentName ?? "—",
    }));

    return (
        <div style={{ padding: "40px", textAlign: "center" }}>
            <h2>💰 Quản lý Học phí</h2>

            {loading && <p style={{ marginTop: 16 }}>Đang tải...</p>}
            {error && <p style={{ marginTop: 16, color: "crimson" }}>{error}</p>}

            {!loading && !error &&
                <Table
                    columns={columns}
                    data={data}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onSort={handleSort}
                    sortOrder={sortOrder}
                />
            }
        </div>
    );
};

export default Tuition;