import React from 'react';

/**
 * Reusable SelectBox Component
 *
 * Provides standardized select dropdown rendering with safe option formatting.
 *
 * @param {string} label - Optional label rendered above or beside select
 * @param {string|number} value - Active selected value
 * @param {Function} onChange - Change handler receiving (value, event)
 * @param {Array<Object|string>} options - List of options: [{ value, label }] or ['Option1']
 * @param {string|Object} defaultOption - Top placeholder option (e.g., 'All Districts' or { value: 'All', label: 'All' })
 * @param {boolean} disabled - Disable the select element
 * @param {string} className - Optional class name (defaults to 'filter-select')
 * @param {Object} style - Optional inline styling
 * @param {boolean} inFilterGroup - Wrap with <div className="filter-group"> (default: false)
 */
function SelectBox({
  label,
  value,
  onChange,
  options = [],
  defaultOption,
  disabled = false,
  className = 'filter-select',
  style,
  inFilterGroup = false
}) {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

  const selectElement = (
    <select
      className={className}
      value={value}
      onChange={handleChange}
      disabled={disabled}
      style={style}
    >
      {defaultOption && (
        typeof defaultOption === 'object' ? (
          <option value={defaultOption.value}>{defaultOption.label}</option>
        ) : (
          <option value="All">{defaultOption}</option>
        )
      )}
      {options.map((opt) => {
        const optValue = typeof opt === 'object' && opt !== null ? opt.value : opt;
        const optLabel = typeof opt === 'object' && opt !== null ? (opt.label || opt.value) : opt;
        return (
          <option key={String(optValue)} value={optValue}>
            {optLabel}
          </option>
        );
      })}
    </select>
  );

  if (inFilterGroup || label) {
    return (
      <div className="filter-group">
        {label && <label className="filter-label">{label}</label>}
        {selectElement}
      </div>
    );
  }

  return selectElement;
}

export default SelectBox;

