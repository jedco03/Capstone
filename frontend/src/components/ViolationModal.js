import React, { useState } from 'react';

const ViolationModal = ({ onSubmit, onCancel, violationToEdit }) => {
    const [name, setName] = useState(violationToEdit ? violationToEdit.name : "");
    const [type, setType] = useState(violationToEdit ? violationToEdit.type : "");
  
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit({ name, type }); 
    };
  
    return (
      <div className="FM-overlay">
        <div className="FM-modal-content">
          <button className="FM-close-button" onClick={onCancel}>×</button>
          <h3>{violationToEdit ? "Edit Violation" : "Add Violation"}</h3>
          <p>{violationToEdit ? "Fill in the details edit the violation." : "Fill in the details to add a new violation."}</p>
          <form onSubmit={handleSubmit}>
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
            <div className="FM-form-group">
              <label>Type:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="FM-select"
                required
              >
                <option value="">Select Type</option>
                <option value="Minor">Minor</option>
                <option value="Major">Major</option>
              </select>
            </div>
            <div className="FM-button-group">
              <button type="button" className="FM-cancel-btn" onClick={onCancel}>Cancel</button>
              <button type="submit" className="FM-submit-btn">{violationToEdit ? "Update" : "Create"}</button>
            </div>
          </form>
        </div>
      </div>
    );
};

export default ViolationModal;
