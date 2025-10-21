import React, { useEffect, useState } from "react";

const ClassModal = ({ isOpen, onClose, onSave, classInfo }) => {
  const [formData, setFormData] = useState({
    subjectId: "",
    teacherId: "",
    semester: "",
    academicYear: "",
    room: "",
    schedule: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;

    if (classInfo) {
      setFormData({
        subjectId: classInfo.subjectId ?? "",
        teacherId: classInfo.teacherId ?? "",
        semester: classInfo.semester ?? "",
        academicYear: classInfo.academicYear ?? "",
        room: classInfo.room ?? "",
        schedule: classInfo.schedule ?? "",
      });
    } else {
      setFormData({
        subjectId: "",
        teacherId: "",
        semester: "",
        academicYear: "",
        room: "",
        schedule: "",
      });
    }
    setErrors({});
  }, [classInfo, isOpen]);

  if (!isOpen) return null;

  const validate = (data) => {
    const newErrors = {};

    if (!data.subjectId) {
      newErrors.subjectId = "Mã môn không được để trống";
    } else if (!/^\d+$/.test(String(data.subjectId))) {
      newErrors.subjectId = "Mã môn phải là số";
    }

    if (!data.teacherId) {
      newErrors.teacherId = "Mã giảng viên không được để trống";
    } else if (!/^\d+$/.test(String(data.teacherId))) {
      newErrors.teacherId = "Mã giảng viên phải là số";
    }

    if (!data.semester) newErrors.semester = "Học kỳ không được để trống";

    if (!data.academicYear) {
      newErrors.academicYear = "Năm học không được để trống";
    } else if (!/^\d{4}$/.test(String(data.academicYear))) {
      newErrors.academicYear = "Năm học phải gồm 4 chữ số (VD: 2025)";
    }

    // room & schedule có thể để trống tuỳ nghiệp vụ
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // giữ chỉ số cho các trường numeric
    if (["subjectId", "teacherId", "academicYear"].includes(name)) {
      const onlyDigits = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: onlyDigits }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      subjectId: Number(formData.subjectId),
      teacherId: Number(formData.teacherId),
      semester: formData.semester.trim(),
      academicYear: Number(formData.academicYear),
      room: formData.room.trim(),
      schedule: formData.schedule.trim(),
    };

    onSave(payload);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{classInfo ? "Sửa lớp học" : "Thêm lớp học"}</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Mã môn</label>
              <input
                name="subjectId"
                value={formData.subjectId}
                onChange={handleChange}
                placeholder="Mã môn"
                style={styles.input}
                inputMode="numeric"
              />
              {errors.subjectId && <p style={styles.error}>{errors.subjectId}</p>}
            </div>

            <div style={styles.formField}>
              <label style={styles.label}>Mã GV</label>
              <input
                name="teacherId"
                value={formData.teacherId}
                onChange={handleChange}
                placeholder="Mã giảng viên"
                style={styles.input}
                inputMode="numeric"
              />
              {errors.teacherId && <p style={styles.error}>{errors.teacherId}</p>}
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Học kỳ</label>
              <input
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                placeholder="Học kỳ"
                style={styles.input}
              />
              {errors.semester && <p style={styles.error}>{errors.semester}</p>}
            </div>

            <div style={styles.formField}>
              <label style={styles.label}>Năm học</label>
              <input
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                placeholder="Năm học"
                style={styles.input}
                inputMode="numeric"
              />
              {errors.academicYear && <p style={styles.error}>{errors.academicYear}</p>}
            </div>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Phòng học</label>
              <input
                name="room"
                value={formData.room}
                onChange={handleChange}
                placeholder="Phòng học"
                style={styles.input}
              />
            </div>

            <div style={styles.formField}>
              <label style={styles.label}>Lịch học</label>
              <input
                name="schedule"
                value={formData.schedule}
                onChange={handleChange}
                placeholder="Thời gian"
                style={styles.input}
              />
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
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
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

export default ClassModal;
