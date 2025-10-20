import React, { useState, useEffect } from 'react';

const FacultyModal = ({ isOpen, onClose, onSave, faculty }) => {
    // 1. Thay đổi state để phù hợp với các trường của Khoa
    const [formData, setFormData] = useState({
        facultyName: '',
        dean: '',
        phone: '',
        email: '',
        address: '',
        description: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (faculty) {
            setFormData({ ...faculty }); // Copy dữ liệu khi sửa
        } else {
            // Reset form về trạng thái rỗng khi thêm mới
            setFormData({
                facultyName: '',
                dean: '',
                phone: '',
                email: '',
                address: '',
                description: '',
            });
        }
        setErrors({}); // Xóa các lỗi cũ mỗi khi modal mở/đóng
    }, [faculty, isOpen]);

    if (!isOpen) return null;

    // 2. Cập nhật lại logic validation cho Khoa
    const validate = (data) => {
        const newErrors = {};

        if (!data.facultyName) newErrors.facultyName = "Tên khoa không được để trống";
        if (!data.dean) newErrors.dean = "Tên trưởng khoa không được để trống";
        
        if (!data.phone) {
            newErrors.phone = "Số điện thoại không được để trống";
        } else if (!/^0\d{9}$/.test(data.phone)) { // Bắt đầu bằng 0, tổng 10 số
            newErrors.phone = "SĐT phải bắt đầu bằng 0 và có 10 chữ số";
        }
        
        if (!data.email) {
            newErrors.email = "Email không được để trống";
        } else if (!/\S+@\S+\.\S+/.test(data.email)) {
            newErrors.email = "Email không hợp lệ";
        }
        // Các trường address và description có thể không bắt buộc

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
                {/* 3. Cập nhật tiêu đề */}
                <h2>{faculty ? 'Sửa thông tin Khoa' : 'Thêm Khoa mới'}</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    {/* 4. Thay đổi các trường nhập liệu cho Khoa */}
                    <div style={styles.formRow}>
                        <div style={styles.formField}>
                            <label style={styles.label}>Tên Khoa</label>
                            <input name="facultyName" value={formData.facultyName} onChange={handleChange} placeholder="VD: Công nghệ thông tin" style={styles.input} />
                            {errors.facultyName && <p style={styles.error}>{errors.facultyName}</p>}
                        </div>
                        <div style={styles.formField}>
                            <label style={styles.label}>Trưởng Khoa</label>
                            <input name="dean" value={formData.dean} onChange={handleChange} placeholder="Tên trưởng khoa" style={styles.input} />
                            {errors.dean && <p style={styles.error}>{errors.dean}</p>}
                        </div>
                    </div>
                    <div style={styles.formRow}>
                        <div style={styles.formField}>
                            <label style={styles.label}>Số điện thoại</label>
                            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="0xxxxxxxxx" style={styles.input} />
                            {errors.phone && <p style={styles.error}>{errors.phone}</p>}
                        </div>
                        <div style={styles.formField}>
                            <label style={styles.label}>Email</label>
                            <input name="email" value={formData.email} onChange={handleChange} placeholder="Email của khoa" style={styles.input} />
                            {errors.email && <p style={styles.error}>{errors.email}</p>}
                        </div>
                    </div>
                    <div style={styles.formRow}>
                         <div style={styles.formFieldFull}>
                            <label style={styles.label}>Địa chỉ</label>
                            <input name="address" value={formData.address} onChange={handleChange} placeholder="Địa chỉ văn phòng khoa" style={styles.input} />
                            {errors.address && <p style={styles.error}>{errors.address}</p>}
                        </div>
                    </div>
                     <div style={styles.formRow}>
                         <div style={styles.formFieldFull}>
                            <label style={styles.label}>Mô tả</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Thông tin thêm về khoa" style={{...styles.input, height: '80px'}} />
                            {errors.description && <p style={styles.error}>{errors.description}</p>}
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

// 5. Giữ nguyên phần styles vì nó dùng chung được
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
        zIndex: 1000,
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

export default FacultyModal;