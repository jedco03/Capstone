import React from 'react';

function Filters({ colleges, checkedColleges, onCollegeChange }) { 
    return (
        <div className='filters'>
            {colleges.map(college => (
                <label key={college}>
                    <input 
                        type="checkbox"
                        value={college}
                        checked={checkedColleges[college] || false}
                        onChange={onCollegeChange} 
                    />
                    {college}
                </label>
            ))}
        </div>
    );
}

export default Filters; 