
import React, { useState, useEffect } from 'react';

const TeacherModal = ({ isOpen, onClose, onSave, teacher }) => {
    const [formData, setFormData] = useState({
        name: '',
        academicRank: '',
        experience: '',
        facultyId: '',
        phone: '',
        email: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (teacher) {
            setFormData({ ...teacher });
        } else {
            setFormData({
                name: '',
                academicRank: '',
                experience: '',
                facultyId: '',
                phone: '',
                email: '',
            });
        }
        setErrors({});
    }, [teacher, isOpen]);

    if (!isOpen) return null;

    const validate = (data) => {
        const newErrors = {};

        if (!data.name) newErrors.name = "Tên không được để trống";
        if (!data.academicRank) newErrors.academicRank = "Học hàm không được để trống";
        if (!data.experience) {
            newErrors.experience = "Kinh nghiệm không được để trống";
        } else if (isNaN(data.experience) || data.experience < 0) {
            newErrors.experience = "Kinh nghiệm phải là một số không âm";
        }
        if (!data.facultyId) newErrors.facultyId = "Khoa không được để trống";
        if (!data.phone) {
            newErrors.phone = "Số điện thoại không được để trống";
        } else if (!/^0\d{9}$/.test(data.phone)) {
            newErrors.phone = "SĐT phải bắt đầu bằng 0 và có 10 chữ số";
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
                <h2>{teacher ? 'Sửa giảng viên' : 'Thêm giảng viên'}</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formRow}>
                        <div style={styles.formField}>
                            <label style={styles.label}>Tên</label>
                            <input name="name" value={formData.name} onChange={handleChange} placeholder="Họ và tên" style={styles.input} />
                            {errors.name && <p style={styles.error}>{errors.name}</p>}
                        </div>
                        <div style={styles.formField}>
                            <label style={styles.label}>Học hàm</label>
                            <input name="academicRank" value={formData.academicRank} onChange={handleChange} placeholder="Học hàm" style={styles.input} />
                            {errors.academicRank && <p style={styles.error}>{errors.academicRank}</p>}
                        </div>
                    </div>
                    <div style={styles.formRow}>
                        <div style={styles.formField}>
                            <label style={styles.label}>Kinh nghiệm</label>
                            <input name="experience" value={formData.experience} onChange={handleChange} placeholder="Kinh nghiệm (năm)" style={styles.input} />
                            {errors.experience && <p style={styles.error}>{errors.experience}</p>}
                        </div>
                        <div style={styles.formField}>
                            <label style={styles.label}>Khoa</label>
                            <input name="facultyId" value={formData.facultyId} onChange={handleChange} placeholder="Mã khoa" style={styles.input} />
                            {errors.facultyId && <p style={styles.error}>{errors.facultyId}</p>}
                        </div>
                    </div>
                    <div style={styles.formRow}>
                        <div style={styles.formField}>
                            <label style={styles.label}>SĐT</label>
                            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Số điện thoại" style={styles.input} />
                            {errors.phone && <p style={styles.error}>{errors.phone}</p>}
                        </div>
                        <div style={styles.formField}>
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
        gap: '20px',
    },
    formField: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
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
        margin: 0,
    },
};

export default TeacherModal;
