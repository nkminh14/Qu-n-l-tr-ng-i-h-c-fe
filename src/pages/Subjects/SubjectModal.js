import React, { useEffect, useState } from "react";

const SubjectModal = ({ isOpen, onClose, onSave, subject, faculties = [] }) => {
  const [formData, setFormData] = useState({
    subjectName: "",
    credits: "",
    description: "",
    facultyId: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (subject) {
      // copy dữ liệu để sửa
      setFormData({
        subjectName: subject.subjectName ?? "",
        credits: subject.credits ?? "",
        description: subject.description ?? "",
        facultyId: subject.facultyId ?? "",
      });
    } else {
      // reset khi tạo mới
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

  const validate = (data) => {
    const newErrors = {};

    if (!data.subjectName) newErrors.subjectName = "Tên môn không được để trống";

    if (data.credits === "" || data.credits === null) {
      newErrors.credits = "Số tín chỉ không được để trống";
    } else if (!/^\d+$/.test(String(data.credits))) {
      newErrors.credits = "Số tín chỉ phải là số nguyên không âm";
    }

    if (!data.facultyId) newErrors.facultyId = "Khoa không được để trống";

    return newErrors;
    };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // ép credits về number nếu có nhập
    if (name === "credits") {
      const v = value;
      setFormData((prev) => ({ ...prev, [name]: v === "" ? "" : v.replace(/\D/g, "") }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Chuẩn hóa dữ liệu gửi BE
    const payload = {
      subjectName: formData.subjectName.trim(),
      credits: Number(formData.credits),
      description: formData.description?.trim() || "",
      facultyId: Number(formData.facultyId),
    };

    onSave(payload);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{subject ? "Sửa môn học" : "Thêm môn học"}</h2>

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
                value={formData.credits}
                onChange={handleChange}
                placeholder="VD: 3"
                style={styles.input}
                inputMode="numeric"
              />
              {errors.credits && <p style={styles.error}>{errors.credits}</p>}
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Khoa</label>
              {faculties?.length > 0 ? (
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
              ) : (
                <input
                  name="facultyId"
                  value={formData.facultyId}
                  onChange={handleChange}
                  placeholder="Mã khoa (VD: 1)"
                  style={styles.input}
                />
              )}
              {errors.facultyId && <p style={styles.error}>{errors.facultyId}</p>}
            </div>

            <div style={styles.formField}>
              <label style={styles.label}>Mô tả</label>
              <input
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả ngắn"
                style={styles.input}
              />
              {/* Mô tả không bắt buộc */}
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

/* Giữ nguyên style giống StudentModal để đồng bộ UI */
const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "8px",
    width: "600px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
  },
  formRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "15px",
  },
  formField: {
    display: "flex",
    flexDirection: "column",
    width: "48%",
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
  error: {
    color: "red",
    fontSize: "12px",
    marginTop: "5px",
    textAlign: "left",
  },
};

export default SubjectModal;
