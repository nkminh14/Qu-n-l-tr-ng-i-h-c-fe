import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ClassModal = ({ isOpen, onClose, onSave, classInfo }) => {
    const [formData, setFormData] = useState({
        subjectId: '',
        teacherId: '',
        semester: '',
        academicYear: '',
        room: '',
        schedule: '',
    });
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            fetchSubjects();
            fetchTeachers();
            if (classInfo) {
                setFormData({ ...classInfo });
            } else {
                setFormData({
                    subjectId: '',
                    teacherId: '',
                    semester: '',
                    academicYear: '',
                    room: '',
                    schedule: '',
                });
            }
            setErrors({});
        }
    }, [classInfo, isOpen]);

    const fetchSubjects = async () => {
        try {
            const res = await axios.get("http://localhost:8080/subjects");
            setSubjects(res.data || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách môn học:", error);
        }
    };

    const fetchTeachers = async () => {
        try {
            const response = await axios.get("http://localhost:8080/teachers");
            setTeachers(response.data || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách giảng viên:", error);
        }
    };

    if (!isOpen) return null;

    const validate = (data) => {
        const newErrors = {};
        if (!data.subjectId) newErrors.subjectId = "Môn học không được để trống";
        if (!data.teacherId) newErrors.teacherId = "Giảng viên không được để trống";
        if (!data.semester) newErrors.semester = "Học kỳ không được để trống";
        if (!data.academicYear) newErrors.academicYear = "Năm học không được để trống";
        return newErrors;
    };

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
        onSave(formData);
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h2>{classInfo ? 'Sửa lớp học' : 'Thêm lớp học'}</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formRow}>
                        <div style={styles.formField}>
                            <label style={styles.label}>Môn học</label>
                            <select name="subjectId" value={formData.subjectId} onChange={handleChange} style={styles.input}>
                                <option value="">Chọn môn học</option>
                                {subjects.map(subject => (
                                    <option key={subject.subjectId} value={subject.subjectId}>
                                        {subject.subjectName}
                                    </option>
                                ))}
                            </select>
                            {errors.subjectId && <p style={styles.error}>{errors.subjectId}</p>}
                        </div>
                        
                        <div style={styles.formField}>
                            <label style={styles.label}>Giảng viên</label>
                            <select name="teacherId" value={formData.teacherId} onChange={handleChange} style={styles.input}>
                                <option value="">Chọn giảng viên</option>
                                {teachers.map(teacher => (
                                    <option key={teacher.teacherId} value={teacher.teacherId}>
                                        {teacher.name}
                                    </option>
                                ))}
                            </select>
                            {errors.teacherId && <p style={styles.error}>{errors.teacherId}</p>}
                        </div>
                    </div>
                    <div style={styles.formRow}>
                        <div style={styles.formField}>
                            <label style={styles.label}>Học kỳ</label>
                            <input name="semester" value={formData.semester} onChange={handleChange} placeholder="Học kỳ" style={styles.input} />
                            {errors.semester && <p style={styles.error}>{errors.semester}</p>}
                        </div>
                        <div style={styles.formField}>
                            <label style={styles.label}>Năm học</label>
                            <input name="academicYear" value={formData.academicYear} onChange={handleChange} placeholder="Năm học" style={styles.input} />
                            {errors.academicYear && <p style={styles.error}>{errors.academicYear}</p>}
                        </div>
                    </div>
                    <div style={styles.formRow}>
                        <div style={styles.formField}>
                            <label style={styles.label}>Phòng học</label>
                            <input name="room" value={formData.room} onChange={handleChange} placeholder="Phòng học" style={styles.input} />
                        </div>
                        <div style={styles.formField}>
                            <label style={styles.label}>Lịch học</label>
                            <input name="schedule" value={formData.schedule} onChange={handleChange} placeholder="Lịch học" style={styles.input} />
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
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        width: '600px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    formRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '15px',
    },
    formField: {
        display: 'flex',
        flexDirection: 'column',
        width: '48%',
    },
    label: {
        marginBottom: '5px',
        textAlign: 'left',
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        boxSizing: 'border-box',
    },
    buttons: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '20px',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    cancelButton: {
        backgroundColor: '#f44336',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        marginLeft: '10px',
        fontSize: '16px',
    },
    error: {
        color: 'red',
        fontSize: '12px',
        marginTop: '5px',
        textAlign: 'left',
    },
};

export default ClassModal;
