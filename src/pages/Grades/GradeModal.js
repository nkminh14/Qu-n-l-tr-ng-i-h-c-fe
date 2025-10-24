import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GradeModal = ({ isOpen, onClose, onSave, grade }) => {
    const [formData, setFormData] = useState({
        attendanceScore: '',
        midtermScore: '',
        finalScore: '',
        studentCode: '',
        classId: '',
    });
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [errors, setErrors] = useState({});

    const fetchStudents = async () => {
        try {
            const res = await axios.get("http://localhost:8080/students");
            setStudents(res.data || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sinh viên:", error);
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await axios.get("http://localhost:8080/classes");
            setClasses(res.data || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách lớp:", error);
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await axios.get("http://localhost:8080/subjects");
            setSubjects(res.data || []);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách môn học:", error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchStudents();
            fetchClasses();
            fetchSubjects();
            if (grade) {
                setFormData({ ...grade });
            } else {
                setFormData({
                    attendanceScore: '',
                    midtermScore: '',
                    finalScore: '',
                    studentCode: '',
                    classId: '',
                });
            }
            setErrors({});
        }
    }, [grade, isOpen]);

    useEffect(() => {
        if (formData.classId) {
            const filtered = students.filter(student => student.gradeId === formData.classId);
            setFilteredStudents(filtered);
        } else {
            setFilteredStudents([]);
        }
    }, [formData.classId, students]);

    if (!isOpen) return null;

    const getSubjectName = (subjectId) => {
        const subject = subjects.find((s) => s.subjectId === subjectId);
        return subject ? subject.subjectName : `ID: ${subjectId}`;
    };

    const validate = (data) => {
        const newErrors = {};
        if (!data.studentCode) newErrors.studentCode = "Mã sinh viên không được để trống";
        if (!data.classId) newErrors.classId = "Mã lớp không được để trống";
        if (data.attendanceScore < 0 || data.attendanceScore > 10) newErrors.attendanceScore = "Điểm chuyên cần phải từ 0 đến 10";
        if (data.midtermScore < 0 || data.midtermScore > 10) newErrors.midtermScore = "Điểm giữa kỳ phải từ 0 đến 10";
        if (data.finalScore < 0 || data.finalScore > 10) newErrors.finalScore = "Điểm cuối kỳ phải từ 0 đến 10";
        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };

        if (name === 'classId') {
            newFormData.studentCode = ''; // Reset student when class changes
        }

        setFormData(newFormData);
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
                <h2>{grade ? 'Sửa điểm' : 'Thêm điểm'}</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formRow}>
                        <div style={styles.formField}>
                            <label style={styles.label}>Lớp</label>
                            <select name="classId" value={formData.classId} onChange={handleChange} style={styles.input}>
                                <option value="">Chọn lớp</option>
                                {classes.map(cls => (
                                    <option key={cls.classId} value={cls.classId}>
                                        {getSubjectName(cls.subjectId)} - {cls.semester} ({cls.academicYear})
                                    </option>
                                ))}
                            </select>
                            {errors.classId && <p style={styles.error}>{errors.classId}</p>}
                        </div>
                        <div style={styles.formField}>
                            <label style={styles.label}>Sinh viên</label>
                            <select name="studentCode" value={formData.studentCode} onChange={handleChange} style={styles.input} disabled={!formData.classId || !!grade}>
                                <option value="">Chọn sinh viên</option>
                                {filteredStudents.map(student => (
                                    <option key={student.studentCode} value={student.studentCode}>
                                        {student.name} ({student.studentCode})
                                    </option>
                                ))}
                            </select>
                            {errors.studentCode && <p style={styles.error}>{errors.studentCode}</p>}
                        </div>
                    </div>
                    <div style={styles.formRow}>
                        <div style={styles.formField}>
                            <label style={styles.label}>Điểm chuyên cần</label>
                            <input type="number" name="attendanceScore" value={formData.attendanceScore} onChange={handleChange} placeholder="Điểm chuyên cần" style={styles.input} />
                            {errors.attendanceScore && <p style={styles.error}>{errors.attendanceScore}</p>}
                        </div>
                        <div style={styles.formField}>
                            <label style={styles.label}>Điểm giữa kỳ</label>
                            <input type="number" name="midtermScore" value={formData.midtermScore} onChange={handleChange} placeholder="Điểm giữa kỳ" style={styles.input} />
                            {errors.midtermScore && <p style={styles.error}>{errors.midtermScore}</p>}
                        </div>
                    </div>
                    <div style={styles.formRow}>
                        <div style={styles.formFieldFull}>
                            <label style={styles.label}>Điểm cuối kỳ</label>
                            <input type="number" name="finalScore" value={formData.finalScore} onChange={handleChange} placeholder="Điểm cuối kỳ" style={styles.input} />
                            {errors.finalScore && <p style={styles.error}>{errors.finalScore}</p>}
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
        zIndex: 1000
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
    formFieldFull: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
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

export default GradeModal;