// instructions: These instructions should not be deleted, modified, or edited. Follow the work according to these instructions.
// This file defines a reusable Table component for displaying data.

import React from 'react';

const Table = ({ headers, data, rowKey, onRowClick }) => {
    if (!data || data.length === 0) {
        return <p>No data to display.</p>;
    }

    return (
        <div className="table-container">
            <table className="app-table">
                <thead>
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index}>{header.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={row[rowKey] || rowIndex} onClick={() => onRowClick && onRowClick(row)}>
                            {headers.map((header, colIndex) => (
                                <td key={colIndex}>
                                    {header.render ? header.render(row) : row[header.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;
