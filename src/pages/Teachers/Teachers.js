import React, { useState, useMemo } from 'react';
import './Teachers.css';

const mockTeachers = [
    { id: 1, name: 'Nguyễn Văn A', academicRank: 'Giao sư', phone: '0123456789', email: 'ex@example.com', department: 'Toán học', experience: 10 },
    { id: 2, name: 'Trần Thị B', academicRank: 'Phó giáo sư', phone: '0987654321', email: 'ex@example.com', department: 'Vật lý', experience: 8 },
    { id: 3, name: 'Lê Văn C', academicRank: 'Tiến sĩ', phone: '0112233445', email: 'ex@example.com', department: 'Hóa học', experience: 5 },
    { id: 4, name: 'Phạm Thị D', academicRank: 'Thạc sĩ', phone: '0223344556', email: 'ex@example.com', department: 'Sinh học', experience: 3 },
    { id: 5, name: 'Hoàng Văn E', academicRank: 'Giao sư', phone: '0334455667', email: 'ex@example.com', department: 'Tin học', experience: 12 },
    { id: 6, name: 'Vũ Thị F', academicRank: 'Phó giáo sư', phone: '0445566778', email: 'ex@example.com', department: 'Khoa học xã hội', experience: 7 },
    { id: 7, name: 'Đỗ Văn G', academicRank: 'Tiến sĩ', phone: '0556677889', email: 'ex@example.com', department: 'Ngữ văn', experience: 9 },
    { id: 8, name: 'Bùi Thị H', academicRank: 'Thạc sĩ', phone: '0667788990', email: 'ex@example.com', department: 'Lịch sử', experience: 4 },
    { id: 9, name: 'Trịnh Văn I', academicRank: 'Giao sư', phone: '0778899001', email: 'ex@example.com', department: 'Địa lý', experience: 11 },
    { id: 10, name: 'Lý Thị K', academicRank: 'Phó giáo sư', phone: '0889900112', email: 'ex@example.com', department: 'Ngoại ngữ', experience: 6 },
    { id: 11, name: 'Phan Văn L', academicRank: 'Tiến sĩ', phone: '0990011223', email: ' ex@example.com', department: 'Giáo dục thể chất', experience: 15 },
    { id: 12, name: 'Cao Thị M', academicRank: 'Thạc sĩ', phone: '1001122334', email: 'ex@example.com', department: 'Nghệ thuật', experience: 2 },
    { id: 13, name: 'Đặng Văn N', academicRank: 'Giao sư', phone: '1112233445', email: 'ex@example.com', department: 'Công nghệ', experience: 13 },
    { id: 14, name: 'Ngô Thị O', academicRank: 'Phó giáo sư', phone: '1223344556', email: 'ex@example.com', department: 'Kinh tế', experience: 14 },
    { id: 15, name: 'Lâm Văn P', academicRank: 'Tiến sĩ', phone: '1334455667', email: 'ex@example.com', department: 'Quản trị kinh doanh', experience: 1 },
    { id: 16, name: 'Tạ Thị Q', academicRank: 'Thạc sĩ', phone: '1445566778', email: 'ex@example.com', department: 'Luật', experience: 5 },
];
const Teachers = () => {
    const [teachers, setTeachers] = useState(mockTeachers);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [searchQuery, setSearchQuery] = useState('');

    const sortedAndFilteredTeachers = useMemo(() => {
        let filteredTeachers = teachers.filter(teacher =>
            teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            teacher.department.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (sortConfig.key) {
            filteredTeachers.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filteredTeachers;
    }, [teachers, searchQuery, sortConfig]);

    const paginatedTeachers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return sortedAndFilteredTeachers.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedAndFilteredTeachers, currentPage]);

    const totalPages = Math.ceil(sortedAndFilteredTeachers.length / itemsPerPage);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    return (
        <div className="teachers-container">
            <h1>Quản lý Giảng viên</h1>
            <div className='toolbar'>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo Tên, Email, Khoa..."
                    value={searchQuery}
                    onChange={handleSearch}
                    className='search-input'
                />
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th onClick={() => requestSort('name')}>Tên {sortConfig.key === "name" && (sortConfig.direction === "ascending" ? "↑" : "↓")} </th>
                        <th>Học hàm</th>
                        <th>Số điện thoại</th>
                        <th>Email</th>
                        <th>Khoa</th>
                        <th onClick={() => requestSort("experience")}>Kinh nghiệm (năm) {sortConfig.key === "experience" && (sortConfig.direction === "ascending" ? "↑" : "↓")}</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedTeachers.map((teacher) => (
                        <tr key={teacher.id}>
                            <td>{teacher.id}</td>
                            <td>{teacher.name}</td>
                            <td>{teacher.academicRank}</td>
                            <td>{teacher.phone}</td>
                            <td>{teacher.email}</td>
                            <td>{teacher.department}</td>
                            <td>{teacher.experience}</td>
                                <button className='edit-btn'>Sửa</button>
                                <button className='delete-btn'>Xóa</button>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => ( i + 1 )).map((page) => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? 'active' : ''}
                    >{page}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Teachers;