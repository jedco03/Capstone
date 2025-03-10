import React from 'react';
import Select from 'react-select';
import './filterStyles.css';

function Filters({
  colleges,
  checkedColleges,
  onCollegeChange,
  years,
  checkedYears,
  onYearChange,
  count,
  onCountChange
}) {
  const collegeOptions = colleges.map(college => ({ value: college, label: college }));
  const yearOptions = years.map(year => ({ value: year, label: year }));

  // Function to transform selected options back to checkedColleges or checkedYears format
  const handleDropdownChange = (selectedOptions, filterType) => {
    const updatedChecked = {};
    selectedOptions.forEach(option => {
      updatedChecked[option.value] = true;
    });

    if (filterType === 'college') {
      onCollegeChange(updatedChecked);
    } else if (filterType === 'year') {
      onYearChange(updatedChecked);
    }
  };

  return (
    <div className='filters'>
      <div className="filter-section">
        <label>Filter by College:</label>
        <Select
          isMulti
          options={collegeOptions}
          value={Object.keys(checkedColleges).map(college => ({ value: college, label: college }))}
          onChange={(selectedOptions) => handleDropdownChange(selectedOptions, 'college')}
          className="custom-dropdown"
        />
      </div>

      <div className="filter-section">
        <label>Filter by Year:</label>
        <Select
          isMulti
          options={yearOptions}
          value={Object.keys(checkedYears).map(year => ({ value: year, label: year }))}
          onChange={(selectedOptions) => handleDropdownChange(selectedOptions, 'year')}
          className="custom-dropdown"
        />
      </div>

      {/* Count Filter - Numeric Input */}
      <div className="filter-section">
        <label>Filter by Count (Violations):</label>
        <input
          type="number"
          value={count}
          onChange={(e) => onCountChange(Number(e.target.value))}
          min="0"
          step="1"
          className="count-input"
        />
      </div>
    </div>
  );
}

export default Filters;