import React from 'react';

/**
 * DataTable Component
 *
 * Beginner-friendly reusable table component with column headers,
 * clickable rows, and pagination controls.
 */
function DataTable({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No records found.',
  currentPage = 1,
  totalPages = 1,
  onPageChange
}) {
  return (
    <div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  style={col.align ? { textAlign: col.align } : {}}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? (
              data.map((row, rowIdx) => (
                <tr
                  key={row.id || rowIdx}
                  className={onRowClick ? 'clickable-row' : ''}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      style={col.align ? { textAlign: col.align } : {}}
                    >
                      {col.render ? col.render(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="pagination-bar">
          <div>
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </div>
          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage <= 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                className={`pagination-btn ${p === currentPage ? 'active' : ''}`}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage >= totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;

