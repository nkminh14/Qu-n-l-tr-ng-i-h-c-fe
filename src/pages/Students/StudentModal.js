import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentModal = ({ isOpen, onClose, onSave, student, faculties, classes }) => {
    const [formData, setFormData] = useState({
        studentCode: '',
        name: '',
        dateOfBirth: '',
        classId: '',
        facultyId: '',
        phone: '',
        email: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (student) {
                setFormData({ ...student }); // Create a copy
            } else {
                setFormData({
                    studentCode: '',
                    name: '',
                    dateOfBirth: '',
                    classId: '',
                    facultyId: '',
                    phone: '',
                    email: '',
                });
            }
            setErrors({});
        }
    }, [student, isOpen]);

    if (!isOpen) return null;

    const validate = (data) => {
        const newErrors = {};

        if (!data.studentCode) newErrors.studentCode = "Mã số sinh viên không được để trống";
        if (!data.name) newErrors.name = "Tên không được để trống";
        if (!data.dateOfBirth) {
            newErrors.dateOfBirth = "Ngày sinh không được để trống";
        } else if (!/^\d{4}-\d{2}-\d{2}$/.test(data.dateOfBirth)) {
            newErrors.dateOfBirth = "Định dạng ngày sinh là YYYY-MM-DD";
        }
        if (!data.classId) newErrors.classId = "Lớp không được để trống";
        if (!data.facultyId) newErrors.facultyId = "Khoa không được để trống";
        if (!data.phone) {
            newErrors.phone = "Số điện thoại không được để trống";
        } else if (!/^\d{10}$/.test(data.phone)) {
            newErrors.phone = "Số điện thoại phải có 10 chữ số";
        }
        if (!data.email) {
            newErrors.email = "Email không được để trống";
        } else if (!/\S+@\S+\.\S+/.test(data.email)) {
            newErrors.email = "Email không hợp lệ";
        }

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
                <h2>{student ? 'Sửa sinh viên' : 'Thêm sinh viên'}</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formRow}>
                        <div style={styles.formField}>
                            <label style={styles.label}>MSSV</label>
                            <input name="studentCode" value={formData.studentCode} onChange={handleChange} placeholder="Mã số sinh viên" style={styles.input} readOnly={!!student} />
                            {errors.studentCode && <p style={styles.error}>{errors.studentCode}</p>}
                        </div>
                        <div style={styles.formField}>
                            <label style={styles.label}>Tên</label>
                            <input name="name" value={formData.name} onChange={handleChange} placeholder="Họ và tên" style={styles.input} />
                            {errors.name && <p style={styles.error}>{errors.name}</p>}
                        </div>
                    </div>
                    <div style={styles.formRow}>
                        <div style={styles.formField}>
                            <label style={styles.label}>Ngày sinh</label>
                            <input name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} placeholder="YYYY-MM-DD" style={styles.input} />
                            {errors.dateOfBirth && <p style={styles.error}>{errors.dateOfBirth}</p>}
                        </div>
                        <div style={styles.formField}>
                            <label style={styles.label}>Lớp</label>
                            <select name="classId" value={formData.classId} onChange={handleChange} style={styles.input}>
                                <option value="">Chọn lớp</option>
                                {classes && classes.map(a_class => (
                                    <option key={a_class.classId} value={a_class.classId}>
                                        {a_class.subjectName}
                                    </option>
                                ))}
                            </select>
                            {errors.classId && <p style={styles.error}>{errors.classId}</p>}
                        </div>
                    </div>
                    <div style={styles.formRow}>
                        <div style={styles.formField}>
                            <label style={styles.label}>Khoa</label>
                            <select name="facultyId" value={formData.facultyId} onChange={handleChange} placeholder="Mã khoa" style={styles.input}>
                                <option value="">Chọn khoa</option>
                                {faculties.map(faculty => (
                                    <option key={faculty.facultyId} value={faculty.facultyId}>
                                        {faculty.facultyName}
                                    </option>
                                ))}
                            </select>
                            {errors.facultyId && <p style={styles.error}>{errors.facultyId}</p>}
                        </div>
                        <div style={styles.formField}>
                            <label style={styles.label}>SĐT</label>
                            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Số điện thoại" style={styles.input} />
                            {errors.phone && <p style={styles.error}>{errors.phone}</p>}
                        </div>
                    </div>
                    <div style={styles.formRow}>
                        <div style={styles.formFieldFull}>
                            <label style={styles.label}>Email</label>
                            <input name="email" value={formData.email} onChange={handleChange} placeholder="Email" style={styles.input} />
                            {errors.email && <p style={styles.error}>{errors.email}</p>}
                        </div>
                    </div>
                    <div style={styles.buttons}>
                        <button type="submit" style={styles.saveButton}>Lưu</button>
                        <button onClick={onClose} style={styles.cancelButton}>Hủy</button>
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

export default StudentModal;
