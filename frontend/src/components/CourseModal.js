import { useState } from "react";

const CourseModal = ({ onSubmit, onCancel, courseToEdit, colleges }) => {
    const [formData, setFormData] = useState(
      courseToEdit || { id: "", name: "", college: "" }
    );
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };
  
    return (
      <div className="FM-overlay">
        <div className="FM-modal-content">
          <button className="FM-close-button" onClick={onCancel}>×</button>
          <h3>{courseToEdit ? "Edit Course" : "Add Course"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="FM-form-group">
              <label>ID:</label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                className="FM-input"
                required
              />
            </div>
            <div className="FM-form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="FM-input"
                required
              />
            </div>
            <div className="FM-form-group">
              <label>College:</label>
              <select
                name="college"
                value={formData.college}
                onChange={handleChange}
                className="FM-select"
                required
              >
                <option value="">Select College</option>
                {colleges.map((college) => (
                  <option key={college.id} value={college.id}>
                    {college.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="FM-button-group">
              <button type="button" className="FM-cancel-btn" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="FM-submit-btn">
                {courseToEdit ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  export default CourseModal;