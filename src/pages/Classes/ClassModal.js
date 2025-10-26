import React, { useEffect, useState } from "react";

const ClassModal = ({
  isOpen,
  onClose,
  onSave,
  classInfo,
  serverError,        // ⬅ nhận lỗi từ cha để hiển thị trong modal
  teachers = [],
  subjects = [],
}) => {
  const [formData, setFormData] = useState({
    subjectId: "",
    teacherId: "",
    semester: "",
    academicYear: "",
    room: "",
    dayOfWeek: "",
    startTime: "",
    endTime: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (classInfo) {
      setFormData({
        subjectId: classInfo.subjectId ?? "",
        teacherId: classInfo.teacherId ?? "",
        semester: classInfo.semester ?? "",
        academicYear: classInfo.academicYear ?? "",
        room: classInfo.room ?? "",
        dayOfWeek: classInfo.dayOfWeek ?? "",
        startTime: classInfo.startTime ? String(classInfo.startTime).slice(0, 5) : "",
        endTime: classInfo.endTime ? String(classInfo.endTime).slice(0, 5) : "",
      });
    } else {
      setFormData({
        subjectId: "",
        teacherId: "",
        semester: "",
        academicYear: "",
        room: "",
        dayOfWeek: "",
        startTime: "",
        endTime: "",
      });
    }
    setErrors({});
  }, [classInfo, isOpen]);

  if (!isOpen) return null;

  // ===== VALIDATE (giống style FacultyModal) =====
  const validate = (data) => {
    const newErrors = {};

    if (!data.subjectId) newErrors.subjectId = "Môn học không được để trống";
    if (!data.teacherId) newErrors.teacherId = "Giảng viên không được để trống";

    if (!data.semester) {
      newErrors.semester = "Học kỳ không được để trống";
    } else if (!/^Học kỳ\s\d+$/i.test(data.semester.trim())) {
       newErrors.semester =
    "Học kỳ phải theo định dạng: Học kỳ + khoảng trắng + số (VD: Học kỳ 2)";
}

    if (!data.academicYear) {
      newErrors.academicYear = "Năm học không được để trống";
    } else if (!/^\d{4}\s*-\s*\d{4}$/.test(data.academicYear.trim())) {
      newErrors.academicYear = "Năm học phải theo dạng 2024-2025";
    }

     // === ROOM VALIDATION ===
  const room = (data.room ?? '').trim();

  if (!room) {
    newErrors.room = 'Phòng học không được để trống';
  } else if (!/^\d+$/.test(room)) {
    newErrors.room = 'Phòng học chỉ được chứa số (không có chữ cái)';
  } else if (Number(room) < 100 || Number(room) > 1000) {
    newErrors.room = 'Phòng học phải từ 100 đến 1000';
  }

    if (!data.dayOfWeek) newErrors.dayOfWeek = "Thứ không được để trống";
    if (!data.startTime) newErrors.startTime = "Giờ bắt đầu không được để trống";
    if (!data.endTime) newErrors.endTime = "Giờ kết thúc không được để trống";

    if (data.startTime && data.endTime && data.startTime >= data.endTime) {
      newErrors.startTime = "Giờ bắt đầu phải trước giờ kết thúc";
    }

    return newErrors;
  };

  // ===== HANDLERS =====
  const handleChange = (e) => {
    const { name, value } = e.target;
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
      academicYear: formData.academicYear.trim(),
      room: formData.room.trim(),
      dayOfWeek: Number(formData.dayOfWeek),
      startTime:
        formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime,
      endTime:
        formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime,
    };

    onSave(payload);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>{classInfo ? "Sửa lớp học" : "Thêm lớp học"}</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Hàng 1: Môn học - Giảng viên */}
          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Môn học</label>
              <select
                name="subjectId"
                value={formData.subjectId}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">-- Chọn môn học --</option>
                {subjects.map((s) => (
                  <option key={s.subjectId} value={s.subjectId}>
                    {s.subjectName}
                  </option>
                ))}
              </select>
              {errors.subjectId && <p style={styles.error}>{errors.subjectId}</p>}
            </div>

            <div style={styles.formField}>
              <label style={styles.label}>Giảng viên</label>
              <select
                name="teacherId"
                value={formData.teacherId}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">-- Chọn giảng viên --</option>
                {teachers.map((t) => (
                  <option key={t.teacherId} value={t.teacherId}>
                    {t.name}
                  </option>
                ))}
              </select>
              {errors.teacherId && <p style={styles.error}>{errors.teacherId}</p>}
            </div>
          </div>

          {/* Hàng 2: Học kỳ - Năm học */}
          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Học kỳ</label>
              <input
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                placeholder="VD: Học kỳ 2"
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
                placeholder="VD: 2024-2025"
                style={styles.input}
              />
              {errors.academicYear && <p style={styles.error}>{errors.academicYear}</p>}
            </div>
          </div>

          {/* Hàng 3: Phòng - Thứ */}
          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Phòng học</label>
              <input
                name="room"
                value={formData.room}
                onChange={handleChange}
                placeholder="VD: 101"
                style={styles.input}
              />
              {errors.room && <p style={styles.error}>{errors.room}</p>}
            </div>

            <div style={styles.formField}>
              <label style={styles.label}>Thứ</label>
              <select
                name="dayOfWeek"
                value={formData.dayOfWeek}
                onChange={handleChange}
                style={styles.input}
              >
                <option value="">-- Chọn thứ --</option>
                <option value={2}>Thứ 2</option>
                <option value={3}>Thứ 3</option>
                <option value={4}>Thứ 4</option>
                <option value={5}>Thứ 5</option>
                <option value={6}>Thứ 6</option>
                <option value={7}>Thứ 7</option>
                <option value={1}>Chủ nhật</option>
              </select>
              {errors.dayOfWeek && <p style={styles.error}>{errors.dayOfWeek}</p>}
            </div>
          </div>

          {/* Hàng 4: Giờ bắt đầu - Giờ kết thúc */}
          <div style={styles.formRow}>
            <div style={styles.formField}>
              <label style={styles.label}>Giờ bắt đầu</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                style={styles.input}
              />
              {errors.startTime && <p style={styles.error}>{errors.startTime}</p>}
            </div>

            <div style={styles.formField}>
              <label style={styles.label}>Giờ kết thúc</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                style={styles.input}
              />
              {errors.endTime && <p style={styles.error}>{errors.endTime}</p>}
            </div>
          </div>

          {/* Lỗi BE hiển thị trong modal (giống FacultyModal) */}
          {serverError && <p style={styles.serverError}>{serverError}</p>}

          <div style={styles.buttons}>
            <button type="submit" style={styles.saveButton}>Lưu</button>
            <button type="button" onClick={onClose} style={styles.cancelButton}>Hủy</button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ===== STYLES (mẫu giống FacultyModal) ===== */
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
  form: { display: "flex", flexDirection: "column" },
  formRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "15px",
    gap: "16px",
  },
  formField: { display: "flex", flexDirection: "column", width: "48%" },
  label: { marginBottom: "5px", textAlign: "left", fontWeight: "bold" },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  buttons: { display: "flex", justifyContent: "flex-end", marginTop: "20px" },
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
  error: { color: "red", fontSize: "12px", marginTop: "5px", textAlign: "left", margin: 0 },
};

export default ClassModal;
