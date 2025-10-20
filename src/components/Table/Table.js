import React from 'react';
import './Table.css';

const Table = ({ columns, data, onEdit, onDelete, onSort, sortOrder }) => {
    return (
        <div className="table-container">
            <table className="custom-table">
                <thead>
                <tr>
                    {columns.map((col) => (
                        <th key={col.key}>
                            {col.title}
                            {col.sortable && (
                                <button onClick={() => onSort(col.key)} className="sort-button">
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </button>
                            )}
                        </th>
                    ))}
                    <th>Hành động</th>
                </tr>
                </thead>
                <tbody>
                {data.length > 0 ? (
                    data.map((row, rowIndex) => (
                        <tr key={row.id || rowIndex}>
                            {columns.map((col) => (
                                <td key={col.key}>{row[col.key]}</td>
                            ))}
                            <td className="actions-cell">
                                <button onClick={() => onEdit(row)} className="action-button edit-button">Sửa</button>
                                <button onClick={() => onDelete(row[columns[0].key])} className="action-button delete-button">Xóa</button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={columns.length + 1} className="no-data-message">
                            Không có dữ liệu.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
