import React, { useEffect, useState } from "react";

const SEMESTERS = [
  "HK1-2024",
  "HK2-2024",
  "HK1-2025",
  "HK2-2025",
];

const STATUS_OPTIONS = ["PAID", "UNPAID", "PARTIAL"];

const TuitionModal = ({ isOpen, onClose, onSave, tuition, students = [], serverError }) => {
  const [formData, setFormData] = useState({
    studentCode: "",
    semester: "",
    amount: "",
    paymentDate: "",
    status: "UNPAID",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (tuition) {
        setFormData({
          studentCode: tuition.studentCode ?? "",
          semester: tuition.semester ?? "",
          amount: tuition.amount ?? "",
          paymentDate: tuition.paymentDate ? new Date(tuition.paymentDate).toISOString().split('T')[0] : "",
          status: tuition.status ?? "UNPAID",
        });
      } else {
        setFormData({
          studentCode: "",
          semester: "",
          amount: "",
          paymentDate: "",
          status: "UNPAID",
        });
      }
      setErrors({});
    }
  }, [tuition, isOpen]);

  if (!isOpen) return null;

  const validate = (data) => {
    const newErrors = {};
    if (!data.studentCode) newErrors.studentCode = "Vui lòng chọn sinh viên";
    if (!data.semester) newErrors.semester = "Vui lòng chọn học kỳ";

    if (data.amount === "" || data.amount === null) {
      newErrors.amount = "Số tiền không được để trống";
    } else if (!/^\d+$/.test(String(data.amount))) {
      newErrors.amount = "Số tiền phải là một số";
    } else if (Number(data.amount) <= 0) {
      newErrors.amount = "Số tiền phải lớn hơn 0";
    }

    if (!data.paymentDate) {
      newErrors.paymentDate = "Ngày đóng không được để trống";
    } else if (isNaN(new Date(data.paymentDate).getTime())) {
      newErrors.paymentDate = "Ngày đóng không hợp lệ";
    }

    if (!data.status) newErrors.status = "Vui lòng chọn trạng thái";

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "amount" ? value.replace(/[^\d]/g, "") : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      studentCode: formData.studentCode,
      semester: formData.semester,
      amount: Number(formData.amount),
      paymentDate: formData.paymentDate,
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
                name="studentCode"
                value={formData.studentCode}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">-- Chọn sinh viên --</option>
                {students.map((s) => (
                  <option key={s.studentId} value={s.studentCode}>
                    {s.studentCode} - {s.name}
                  </option>
                ))}
              </select>
              {errors.studentCode && <p style={styles.error}>{errors.studentCode}</p>}
            </div>

            <div style={styles.formField}>
              <label style={styles.label}>Học kỳ</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">-- Chọn học kỳ --</option>
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.semester && <p style={styles.error}>{errors.semester}</p>}
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Số tiền</label>
              <input
                name="amount"
                inputMode="numeric"
                value={formData.amount}
                onChange={handleChange}
                placeholder="VD: 5000000"
                style={styles.input}
              />
              {errors.amount && <p style={styles.error}>{errors.amount}</p>}
            </div>

            <div style={styles.formField}>
              <label style={styles.label}>Trạng thái</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={styles.input}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.status && <p style={styles.error}>{errors.status}</p>}
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formFieldFull}>
              <label style={styles.label}>Ngày đóng</label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                style={styles.input}
              />
              {errors.paymentDate && <p style={styles.error}>{errors.paymentDate}</p>}
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
