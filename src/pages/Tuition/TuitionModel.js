import React, { useState, useEffect } from "react";
import axios from "axios";

const SEMESTERS = [
  "HK1-2024",
  "HK2-2024",
  "HK1-2025",
  "HK2-2025"
];

const STATUS_OPTIONS = ["PAID", "UNPAID", "PARTIAL"];

const TuitionModel = ({ isOpen, onClose, onSave, tuition }) => {
  const [formData, setFormData] = useState({
    studentCode: "",
    studentName: "", // read-only / informative if present
    semester: "",
    amount: "",
    paymentDate: "",
    status: "UNPAID",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (tuition) {
        // copy tuition data to form
        setFormData({
          studentCode: tuition.studentCode || "",
          studentName: tuition.studentName || "",
          semester: tuition.semester || "",
          amount: tuition.amount ? tuition.amount : "",
          paymentDate: tuition.paymentDate || "",
          status: tuition.status || "UNPAID",
        });
      } else {
        setFormData({
          studentCode: "",
          studentName: "",
          semester: "",
          amount: "",
          paymentDate: "",
          status: "UNPAID",
        });
      }
      setErrors({});
    }
  }, [isOpen, tuition]);

  if (!isOpen) return null;

  const validate = (data) => {
    const newErrors = {};
    if (!data.studentCode) newErrors.studentCode = "Mã số sinh viên không được để trống";
    if (!data.semester) newErrors.semester = "Học kỳ không được để trống";
    if (!data.amount && data.amount !== 0) newErrors.amount = "Số tiền không được để trống";
    else if (isNaN(Number(data.amount)) || Number(data.amount) <= 0) newErrors.amount = "Số tiền phải là số > 0";
    if (!data.paymentDate) newErrors.paymentDate = "Ngày đóng không được để trống";
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.paymentDate)) newErrors.paymentDate = "Định dạng ngày là YYYY-MM-DD";
    if (!data.status) newErrors.status = "Trạng thái không được để trống";
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // call parent save
    onSave({
      studentCode: formData.studentCode,
      semester: formData.semester,
      amount: Number(formData.amount),
      paymentDate: formData.paymentDate,
      status: formData.status
      // studentId omitted — backend maps by studentCode if needed
    });
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{tuition ? "Sửa Học phí" : "Thêm Học phí"}</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>MSSV</label>
              <input
                name="studentCode"
                value={formData.studentCode}
                onChange={handleChange}
                placeholder="Mã số sinh viên"
                style={styles.input}
                // MSSV nhập thủ công per your choice
              />
              {/* <label>MSSV</label>
              <select
                  value={formData.studentCode}
                  onChange={(e) => setFormData({ ...formData, studentCode: e.target.value })}
                  required
              >
                  <option value="">-- Chọn MSSV --</option>
                  {studentsDropdown.map((s) => (
                      <option key={s.studentId} value={s.studentCode}>
                          {s.studentCode} - {s.name}
                      </option>
                  ))}
              </select> */}
              {errors.studentCode && <p style={styles.error}>{errors.studentCode}</p>}
            </div>
            {/* <div style={styles.formField}>
              <label style={styles.label}>Tên sinh viên</label>
              <input
                name="studentName"
                value={formData.studentName}
                readOnly
                placeholder="(tự động nếu có)"
                style={{ ...styles.input, backgroundColor: "#f5f5f5" }}
              />
            </div> */}  
            <div style={styles.formField}>
              <label style={styles.label}>Trạng thái</label>
              <select name="status" value={formData.status} onChange={handleChange} style={styles.input}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.status && <p style={styles.error}>{errors.status}</p>}
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Học kỳ</label>
              <select name="semester" value={formData.semester} onChange={handleChange} style={styles.input}>
                <option value="">Chọn học kỳ</option>
                {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.semester && <p style={styles.error}>{errors.semester}</p>}
            </div>

            <div style={styles.formField}>
              <label style={styles.label}>Số tiền</label>
              <input
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="Số tiền (vd: 3500000)"
                style={styles.input}
              />
              {errors.amount && <p style={styles.error}>{errors.amount}</p>}
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Ngày đóng</label>
              <input
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                placeholder="YYYY-MM-DD"
                style={styles.input}
              />
              {errors.paymentDate && <p style={styles.error}>{errors.paymentDate}</p>}
            </div>

            
          </div>

          <div style={styles.buttons}>
            <button type="submit" style={styles.saveButton}>Lưu</button>
            <button type="button" onClick={onClose} style={styles.cancelButton}>Hủy</button>
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
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
  },
  modal: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    width: "600px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
  },
  form: { display: "flex", flexDirection: "column" },
  formRow: { display: "flex", justifyContent: "space-between", marginBottom: "15px" },
  formField: { display: "flex", flexDirection: "column", width: "48%" },
  label: { marginBottom: "5px", textAlign: "left", fontWeight: "bold" },
  input: { width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ccc", boxSizing: "border-box" },
  buttons: { display: "flex", justifyContent: "flex-end", marginTop: "20px" },
  saveButton: { backgroundColor: "#4CAF50", color: "white", padding: "10px 20px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "16px" },
  cancelButton: { backgroundColor: "#f44336", color: "white", padding: "10px 20px", border: "none", borderRadius: "4px", cursor: "pointer", marginLeft: "10px", fontSize: "16px" },
  error: { color: "red", fontSize: "12px", marginTop: "5px", textAlign: "left" }
};

export default TuitionModel;
