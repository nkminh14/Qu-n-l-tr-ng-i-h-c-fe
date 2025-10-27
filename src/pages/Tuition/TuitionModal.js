import React, { useEffect, useState } from "react";

const STATUS_OPTIONS = ["PAID", "UNPAID", "PARTIAL"];

const TuitionModal = ({ isOpen, onClose, onSave, tuition, students = [], serverError }) => {
  const [formData, setFormData] = useState({
    studentId: "",   // select (bắt buộc)
    semester: "",    // text (bắt buộc)
    amount: "",      // decimal (bắt buộc > 0)
    startDate: "",   // yyyy-MM-dd (bắt buộc)
    endDate: "",     // yyyy-MM-dd (bắt buộc)
    status: "UNPAID" // select (bắt buộc)
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (tuition) {
      // Copy dữ liệu khi sửa
      setFormData({
        studentId: tuition.studentId ?? "",
        semester: tuition.semester ?? "",
        amount: tuition.amount ?? "",
        startDate: tuition.startDate
          ? new Date(tuition.startDate).toISOString().split("T")[0]
          : "",
        endDate: tuition.endDate
          ? new Date(tuition.endDate).toISOString().split("T")[0]
          : "",
        status: tuition.status ?? "UNPAID",
      });
    } else {
      // Reset khi thêm mới
      setFormData({
        studentId: "",
        semester: "",
        amount: "",
        startDate: "",
        endDate: "",
        status: "UNPAID",
      });
    }
    setErrors({});
  }, [tuition, isOpen]);

  if (!isOpen) return null;

  // Validate giữ nguyên phong cách cũ, chỉ đổi sang start/end
  const validate = (data) => {
    const newErrors = {};

    if (!data.studentId || String(data.studentId).trim() === "") {
      newErrors.studentId = "Vui lòng chọn sinh viên";
    }
    if (!data.semester || data.semester.trim() === "") {
      newErrors.semester = "Học kỳ không được để trống";
    }

    if (data.amount === "" || data.amount === null) {
      newErrors.amount = "Số tiền không được để trống";
    } else if (!/^\d+(\.\d{1,2})?$/.test(String(data.amount))) {
      newErrors.amount = "Số tiền không hợp lệ (tối đa 2 số thập phân)";
    } else if (Number(data.amount) <= 0) {
      newErrors.amount = "Số tiền phải lớn hơn 0";
    }

    if (!data.startDate || data.startDate.trim() === "") {
      newErrors.startDate = "Ngày bắt đầu không được để trống";
    }
    if (!data.endDate || data.endDate.trim() === "") {
      newErrors.endDate = "Ngày kết thúc không được để trống";
    }
    if (data.startDate && data.endDate) {
      const s = new Date(data.startDate);
      const e = new Date(data.endDate);
      if (e < s) newErrors.endDate = "Ngày kết thúc phải ≥ ngày bắt đầu";
    }

    if (!data.status || !STATUS_OPTIONS.includes(String(data.status))) {
      newErrors.status = "Vui lòng chọn trạng thái hợp lệ";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Giữ đúng định dạng cho amount (số thập phân, tối đa 1 dấu '.')
    if (name === "amount") {
      let val = value.replace(/[^0-9.]/g, "");
      const parts = val.split(".");
      if (parts.length > 2) {
        val = parts[0] + "." + parts.slice(1).join("");
      }
      setFormData((prev) => ({ ...prev, amount: val }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "studentId" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Payload gửi ra ngoài: startDate & endDate thay cho paymentDate
    const payload = {
      studentId: Number(formData.studentId),
      semester: formData.semester.trim(),
      amount: formData.amount === "" ? null : Number(formData.amount),
      startDate: formData.startDate, // yyyy-MM-dd
      endDate: formData.endDate,     // yyyy-MM-dd
      status: formData.status,
    };

    onSave(payload);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{tuition ? "Sửa thông tin Học phí" : "Thêm Học phí mới"}</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Sinh viên</label>
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">-- Chọn sinh viên --</option>
                {students.map((s) => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.name ?? "N/A"}{s.studentCode ? ` (${s.studentCode})` : ""}
                  </option>
                ))}
              </select>
              {errors.studentId && <p style={styles.error}>{errors.studentId}</p>}
            </div>

            <div style={styles.formField}>
              <label style={styles.label}>Học kỳ</label>
              <input
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                placeholder="VD: HK1-2025"
                style={styles.input}
              />
              {errors.semester && <p style={styles.error}>{errors.semester}</p>}
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Số tiền</label>
              <input
                name="amount"
                inputMode="decimal"
                value={formData.amount}
                onChange={handleChange}
                placeholder="VD: 1500000 hoặc 1500000.50"
                style={styles.input}
              />
              {errors.amount && <p style={styles.error}>{errors.amount}</p>}
            </div>

            {/* GIỮ NGUYÊN VỊ TRÍ CŨ CỦA paymentDate -> ĐỔI THÀNH startDate */}
            <div style={styles.formField}>
              <label style={styles.label}>Ngày bắt đầu</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                style={styles.input}
              />
              {errors.startDate && <p style={styles.error}>{errors.startDate}</p>}
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Trạng thái</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={styles.input}
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
              {errors.status && <p style={styles.error}>{errors.status}</p>}
            </div>

            {/* Ô trống cũ (formFieldFull) -> dùng để nhập endDate */}
            <div style={styles.formField}>
              <label style={styles.label}>Ngày kết thúc</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                min={formData.startDate || undefined}
                onChange={handleChange}
                style={styles.input}
              />
              {errors.endDate && <p style={styles.error}>{errors.endDate}</p>}
            </div>
          </div>

          {serverError && <p style={styles.serverError}>{serverError}</p>}

          <div style={styles.buttons}>
            <button type="submit" style={styles.saveButton}>
              Lưu
            </button>
            <button type="button" onClick={onClose} style={styles.cancelButton}>
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Giữ nguyên style layout
const styles = {
  overlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    width: "600px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  form: { display: "flex", flexDirection: "column" },
  formRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "15px",
    gap: "20px",
  },
  formField: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  formFieldFull: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  label: {
    marginBottom: "5px",
    textAlign: "left",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  buttons: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "20px",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
  },
  cancelButton: {
    backgroundColor: "#f44336",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginLeft: "10px",
    fontSize: "16px",
  },
  serverError: {
    color: "red",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "15px",
    marginTop: "0px",
    padding: "10px",
    backgroundColor: "#fff0f0",
    borderRadius: "4px",
    border: "1px solid red",
  },
  error: {
    color: "red",
    fontSize: "12px",
    marginTop: "5px",
    textAlign: "left",
    margin: 0,
  },
};

export default TuitionModal;
