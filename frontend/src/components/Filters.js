import React from 'react';
import Select from 'react-select';
import './filterStyles.css';

function Filters({ colleges, checkedColleges, onCollegeChange }) { 
    const collegeOptions = colleges.map(college => ({ value: college, label: college }));

    // Function to transform selected options back to checkedColleges format
    const handleDropdownChange = (selectedOptions) => {
        const updatedCheckedColleges = {};
        selectedOptions.forEach(option => {
            updatedCheckedColleges[option.value] = true;
        });
        onCollegeChange(updatedCheckedColleges);
    };

    return (
        <div className='filters'>
            <Select
                isMulti // Allow multiple selections
                options={collegeOptions}
                value={Object.keys(checkedColleges).map(college => ({ value: college, label: college }))}
                onChange={handleDropdownChange}
                className="custom-dropdown" // Add this class
            />
        </div>
    );
}

export default Filters; 
