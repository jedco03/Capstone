import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './modalStyles.css';

function AddRecordModal() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  const handleAddRecord = () => {
    // Simulate adding a record
    // After the record is added, show the modal
    setIsModalVisible(true);
  };

  const handleRedirect = () => {
    navigate('/records'); 
  };

  return (
    <div>
      {/* Trigger the record addition */}
      <button onClick={handleAddRecord}>Add Record</button>

      {/* Modal */}
      {isModalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <img
              src="https://via.placeholder.com/150"
              alt="Success"
              className="modal-image"
            />
            <h2>You successfully added the record!</h2>
            <button className="modal-button" onClick={handleRedirect}>
              Go to Records
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddRecordModal;
