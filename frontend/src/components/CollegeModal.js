import React, { useState } from 'react';

const CollegeModal = ({ onSubmit, onCancel, collegeToEdit }) => {
  const [code, setCode] = useState(collegeToEdit ? collegeToEdit.code : "");
  const [name, setName] = useState(collegeToEdit ? collegeToEdit.name : "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ code, name });
  };

  return (
    <div className="FM-overlay">
      <div className="FM-modal-content">
        <button className="FM-close-button" onClick={onCancel}>×</button>
        <h3>{collegeToEdit ? "Edit College" : "Add College"}</h3>
        <p>{collegeToEdit ? "Fill in the details to edit the college." : "Fill in the details to add a new college."}</p>
        <form onSubmit={handleSubmit}>
          <div className="FM-form-group">
            <label>Code:</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="FM-input"
              required
            />
          </div>
          <div className="FM-form-group">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="FM-input"
              required
            />
          </div>
          <div className="FM-button-group">
            <button type="button" className="FM-cancel-btn" onClick={onCancel}>Cancel</button>
            <button type="submit" className="FM-submit-btn">{collegeToEdit ? "Update" : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollegeModal;