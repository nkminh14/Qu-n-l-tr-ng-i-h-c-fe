import React, { useEffect, useState } from "react";

const SubjectModal = ({ isOpen, onClose, onSave, subject, faculties = [], serverError }) => {
  const [formData, setFormData] = useState({
    subjectName: "",
    credits: "",
    description: "",
    facultyId: "",        // select
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (subject) {
      // Copy dữ liệu khi sửa
      setFormData({
        subjectName: subject.subjectName ?? "",
        credits: subject.credits ?? "",
        description: subject.description ?? "",
        facultyId: subject.facultyId ?? "",
      });
    } else {
      // Reset form khi thêm mới
      setFormData({
        subjectName: "",
        credits: "",
        description: "",
        facultyId: "",
      });
    }
    setErrors({});
  }, [subject, isOpen]);

  if (!isOpen) return null;

  // Validate giống pattern trong FacultyModal
  const validate = (data) => {
    const newErrors = {};
    if (!data.subjectName) newErrors.subjectName = "Tên môn không được để trống";

    if (data.credits === "" || data.credits === null) {
      newErrors.credits = "Số tín chỉ không được để trống";
    } else if (!/^\d+$/.test(String(data.credits))) {
      newErrors.credits = "Số tín chỉ phải là số nguyên dương";
    } else if (Number(data.credits) <= 0) {
      newErrors.credits = "Số tín chỉ phải lớn hơn 0";
    }

    // facultyId có thể để trống nếu bạn cho phép tạo môn chưa thuộc khoa
    // Nếu bắt buộc chọn khoa, bỏ comment dòng dưới:
    // if (!data.facultyId) newErrors.facultyId = "Vui lòng chọn khoa";

    // description không bắt buộc
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "credits" ? value.replace(/[^\d]/g, "") : value, // giữ số cho credits
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Chuẩn hóa kiểu dữ liệu trước khi gửi ra ngoài
    const payload = {
      subjectName: formData.subjectName.trim(),
      credits: formData.credits === "" ? null : Number(formData.credits),
      description: formData.description?.trim() || "",
      facultyId: formData.facultyId === "" ? null : Number(formData.facultyId),
    };

    onSave(payload); // Phần còn lại để Subjects.js xử lý (axios, toast, đóng modal, fetch lại)
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{subject ? "Sửa thông tin Môn học" : "Thêm Môn học mới"}</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Tên môn</label>
              <input
                name="subjectName"
                value={formData.subjectName}
                onChange={handleChange}
                placeholder="VD: Cơ sở dữ liệu"
                style={styles.input}
              />
              {errors.subjectName && <p style={styles.error}>{errors.subjectName}</p>}
            </div>

            <div style={styles.formField}>
              <label style={styles.label}>Số tín chỉ</label>
              <input
                name="credits"
                inputMode="numeric"
                value={formData.credits}
                onChange={handleChange}
                placeholder="VD: 3"
                style={styles.input}
              />
              {errors.credits && <p style={styles.error}>{errors.credits}</p>}
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Khoa</label>
              <select
                name="facultyId"
                value={formData.facultyId}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">-- Chọn khoa --</option>
                {faculties.map((f) => (
                  <option key={f.facultyId} value={f.facultyId}>
                    {f.facultyName}
                  </option>
                ))}
              </select>
              {errors.facultyId && <p style={styles.error}>{errors.facultyId}</p>}
            </div>

            <div style={styles.formFieldFull} />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formFieldFull}>
              <label style={styles.label}>Mô tả</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả ngắn về môn học"
                style={{ ...styles.input, height: "80px" }}
              />
              {errors.description && <p style={styles.error}>{errors.description}</p>}
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

// Dùng lại styles giống FacultyModal
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

export default SubjectModal;
