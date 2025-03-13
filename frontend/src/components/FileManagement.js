import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/fileManagementStyles.css";
import CreateAccountForm from "./CreateAccountForm";
import ViolationModal from "./ViolationModal";
import CollegeModal from "./CollegeModal";
import CourseModal from "./CourseModal";
import SuccessModal from "./SuccessModal";
import api from "./axiosInstance";

const FileManagement = () => {
  const [activeTab, setActiveTab] = useState("college");
  const [colleges, setColleges] = useState([]);
  const [courses, setCourses] = useState([]);
  const [violations, setViolations] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showViolationTypeModal, setShowViolationTypeModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [violationToEdit, setViolationToEdit] = useState(null);
  const [collegeToEdit, setCollegeToEdit] = useState(null);
  const [showCollegeModal, setShowCollegeModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState({ id: null, type: null }); // State for item to delete
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [semesters, setSemesters] = useState([]);
  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [semesterToEdit, setSemesterToEdit] = useState(null);
  const [loadingColleges, setLoadingColleges] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingViolations, setLoadingViolations] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [courseData, setCourseData] = useState({
    id: "",
    name: "",
    college: "",
  });

  const [changePassword, setChangePassword] = useState({
    username: "",
    newPassword: "",
    confirmPassword: "",
  });

  const tabs = [
    { id: "college", label: "College" },
    { id: "course", label: "Course" },
    { id: "violations", label: "Violations" },
    { id: "accounts", label: "Accounts" },
    { id: "semesters", label: "Semesters" },
  ];

  useEffect(() => {
    if (activeTab === "college") fetchColleges();
    if (activeTab === "course") fetchCourses();
    if (activeTab === "violations") fetchViolations();
    if (activeTab === "accounts") fetchAccounts();
    if (activeTab === "semesters") fetchSemesters();
  }, [activeTab]);

  const fetchColleges = async () => {
    setLoadingColleges(true); // Start loading
    setError("");
    try {
      const response = await axios.get("https://localhost:7096/api/colleges");
      const sortedColleges = response.data.sort((a, b) => a.id.localeCompare(b.id));
      setColleges(sortedColleges);
    } catch (err) {
      setError("Failed to fetch colleges.");
    }
    setLoadingColleges(false); // Stop loading
  };

  const fetchViolations = async () => {
    setLoadingViolations(true); // Start loading
    setError("");
    try {
      const response = await axios.get("https://localhost:7096/api/violations");
      const sortedViolations = response.data.sort((a, b) => a.id.localeCompare(b.id));
      setViolations(sortedViolations);
    } catch (err) {
      setError("Failed to fetch violations.");
    }
    setLoadingViolations(false); // Stop loading
  };

  const fetchCourses = async () => {
    setLoadingCourses(true); // Start loading
    setError("");
    try {
      const response = await axios.get("https://localhost:7096/api/courses");
      setCourses(response.data);
    } catch (err) {
      setError("Failed to fetch courses.");
    }
    setLoadingCourses(false); // Stop loading
  };

  const fetchAccounts = async () => {
    setLoadingAccounts(true); // Start loading
    setError("");
    try {
      const response = await axios.get("https://localhost:7096/api/auth/all");
      setAccounts(response.data);
    } catch (err) {
      setError("Failed to fetch accounts.");
    }
    setLoadingAccounts(false); // Stop loading
  };

  const fetchSemesters = async () => {
    setLoadingSemesters(true); // Start loading
    setError("");
    try {
      const response = await axios.get("https://localhost:7096/api/semesters");
      const sortedSemesters = response.data.sort((a, b) => a.semesterId.localeCompare(b.semesterId));
      setSemesters(sortedSemesters);
    } catch (err) {
      setError("Failed to fetch semesters.");
    }
    setLoadingSemesters(false); // Stop loading
  };

  const getCollegeName = (collegeId, role) => {
    if (role === "Guard" || role === "SAC") {
      return "N/A";
    }
    const college = colleges.find((col) => col.id === collegeId);
    return college ? college.name : "Unknown";
  };

  const handleCreateAccount = (newAccount) => {
    setAccounts([...accounts, newAccount]);
    setIsModalOpen(false);
    setSuccessMessage("Account created successfully!");
    setShowSuccessModal(true);
  };
  

  const handleChangePassword = (username) => {
    setChangePassword({ username, newPassword: "" });
    setShowPasswordModal(true);
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return (
      password.length >= minLength &&
      hasSpecialChar &&
      hasUppercase &&
      hasLowercase &&
      hasNumber
    );
  };

  const handleSubmitPasswordChange = async () => {
    if (changePassword.newPassword !== changePassword.confirmPassword) {
        setError("Passwords do not match.");
        return;
    }

    if (!validatePassword(changePassword.newPassword)) {
        setError(
            "Password must be at least 8 characters long, contain a special character, an uppercase letter, a lowercase letter, and a number."
        );
        return;
    }

    setLoading(true);
    setError("");

    try {
        const response = await api.put(
            `/auth/change-password/${changePassword.username}`,
            { newPassword: changePassword.newPassword }
        );

        if (response.data === "Password changed successfully.") {
            // Update the local state if necessary
            setAccounts(
                accounts.map((account) =>
                    account.username === changePassword.username
                        ? { ...account, password: changePassword.newPassword }
                        : account
                )
            );

            // Reset the form and show success message
            setChangePassword({ username: "", newPassword: "", confirmPassword: "" });
            setShowPasswordModal(false);
            setSuccessMessage("Password changed successfully!");
            setShowSuccessModal(true);
        }
    } catch (err) {
        setError("Failed to change password. Please try again.");
        console.error("Error changing password:", err.response?.data || err.message);
    }
    setLoading(false);
};

const handleCreateOrUpdateSemester = async (semesterData) => {
  setLoadingSemesters(true); // Start loading
  setError("");

  try {
    if (semesterToEdit) {
      // Update existing semester
      const response = await api.put(
        `/semesters/${semesterToEdit.id}`,
        semesterData
      );
      setSemesters(
        semesters.map((semester) =>
          semester.id === semesterToEdit.id ? response.data : semester
        )
      );
      setSuccessMessage("Semester updated successfully!");
    } else {
      // Create new semester
      const response = await api.post("/semesters", semesterData);
      setSemesters([...semesters, response.data]);
      setSuccessMessage("Semester added successfully!");
    }

    setShowSemesterModal(false);
    setSemesterToEdit(null);
    setShowSuccessModal(true);
  } catch (err) {
    console.error("Error:", err);
    setError(semesterToEdit ? "Failed to update semester." : "Failed to create semester.");
  }
  setLoadingSemesters(false); // Stop loading
};

const handleEditSemester = (semester) => {
  setSemesterToEdit(semester);
  setShowSemesterModal(true);
};

  const generateCustomId = (existingItems, prefix) => {
    if (existingItems.length === 0) {
      return `${prefix}_1`;
    }

    const maxId = existingItems.reduce((max, item) => {
      const idNumber = parseInt(item.id.split("_")[1], 10);
      return idNumber > max ? idNumber : max;
    }, 0);

    return `${prefix}_${maxId + 1}`;
  };

  const handleCreateOrUpdateViolationType = async (violationData) => {
    setLoadingViolations(true); // Start loading
    setError("");
  
    try {
      if (violationToEdit) {
        // Update existing violation
        const payload = {
          id: violationToEdit.id,
          ...violationData,
        };
  
        const response = await api.put(`/violations/${violationToEdit.id}`, payload);
  
        setViolations(
          violations.map((violation) =>
            violation.id === violationToEdit.id ? response.data : violation
          )
        );
        setSuccessMessage("Violation updated successfully!");
      } else {
        // Create new violation
        const response = await api.get("/violations");
        const existingViolations = response.data;
  
        // Generate a custom ID for the new violation
        const newId = generateCustomId(existingViolations, "VIO");
        const violationWithId = { ...violationData, id: newId };
  
        const createResponse = await api.post("/violations", violationWithId);
        setViolations([...violations, createResponse.data]);
        setSuccessMessage("Violation added successfully!");
      }
  
      setShowViolationTypeModal(false);
      setViolationToEdit(null);
      setShowSuccessModal(true);
      fetchViolations(); // Refresh the violations list
    } catch (err) {
      console.error("Error:", err);
      setError(violationToEdit ? "Failed to update violation." : "Failed to create violation.");
    }
    setLoadingViolations(false); // Stop loading
  };

  const handleEdit = (violation) => {
    setViolationToEdit(violation);
    setShowViolationTypeModal(true);
  };

  const handleDelete = async (id, type) => {
    setLoading(true);
    setError("");
  
    try {
      let endpoint = "";
  
      switch (type) {
        case "college":
          endpoint = `/colleges/${id}`;
          break;
        case "violation":
          endpoint = `/violations/${id}`;
          break;
        case "course":
          endpoint = `/courses/${id}`;
          break;
        case "account":
          endpoint = `/auth/delete/${id}`;
          break;
        case "semester":
          endpoint = `/semesters/${id}`;
          break;
        default:
          throw new Error("Invalid item type");
      }
  
      // Use the `api` instance for the DELETE request
      await api.delete(endpoint);
  
      // Update the state based on the type
      switch (type) {
        case "college":
          setColleges(colleges.filter((college) => college.id !== id));
          break;
        case "violation":
          setViolations(violations.filter((violation) => violation.id !== id));
          break;
        case "course":
          setCourses(courses.filter((course) => course.id !== id));
          break;
        case "account":
          setAccounts(accounts.filter((account) => account.username !== id));
          break;
        case "semester":
          setSemesters(semesters.filter((semester) => semester.id !== id));
          break;
        default:
          break;
      }
  
      // Reset the item to delete and show success message
      setItemToDelete({ id: null, type: null });
      setSuccessMessage(`${type} deleted successfully!`);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error deleting item:", err);
  
      // Handle specific errors
      if (err.response?.status === 404) {
        setError(`${type} with ID ${id} not found.`);
      } else {
        setError(`Failed to delete ${type}. ${err.message}`);
      }
    } finally {
      setLoading(false); // Stop loading regardless of success or failure
    }
  };

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  const handleEditCollege = (college) => {
    setCollegeToEdit(college);
    setShowCollegeModal(true);
  };

  const handleCreateOrUpdateCollege = async (collegeData) => {
    setLoadingColleges(true); // Start loading
    setError("");
  
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName");
  
      if (collegeToEdit) {
        const payload = {
          id: collegeToEdit.id,
          ...collegeData,
        };
  
        const response = await api.put(
          `/colleges/${collegeToEdit.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "User-Id": userId,
              "User-Name": userName,
            },
          }
        );
  
        setColleges(
          colleges.map((college) =>
            college.id === collegeToEdit.id ? response.data : college
          )
        );
  
        setSuccessMessage("College updated successfully!");
      } else {
        const response = await api.get("/colleges");
        const existingColleges = response.data;
  
        const newId = generateCustomId(existingColleges, "COL");
        const collegeWithId = { ...collegeData, id: newId };
  
        const createResponse = await api.post(
          "/colleges",
          collegeWithId,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "User-Id": userId,
              "User-Name": userName,
            },
          }
        );
  
        setColleges([...colleges, createResponse.data]);
        setSuccessMessage("College added successfully!");
      }
  
      setShowCollegeModal(false);
      setCollegeToEdit(null);
      setShowSuccessModal(true);
      fetchColleges();
    } catch (err) {
      console.error("Error:", err);
      setError(collegeToEdit ? "Failed to update college." : "Failed to create college.");
    }
    setLoadingColleges(false); // Stop loading
  };

  const handleCreateOrUpdateCourse = async (courseData) => {
    setLoadingCourses(true); // Start loading
    setError("");
  
    try {
      if (courseToEdit) {
        // Update existing course
        const response = await api.put(
          `/courses/${courseToEdit.id}`,
          courseData
        );
        setCourses(
          courses.map((course) =>
            course.id === courseToEdit.id ? response.data : course
          )
        );
        setSuccessMessage("Course updated successfully!");
      } else {
        // Create new course
        const response = await api.post("/courses", courseData);
        setCourses([...courses, response.data]);
        setSuccessMessage("Course added successfully!");
      }
  
      setShowCourseModal(false);
      setCourseToEdit(null);
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error:", err);
      setError(courseToEdit ? "Failed to update course." : "Failed to create course.");
    }
    setLoadingCourses(false); // Stop loading
  };

  return (
    <div className="file-management-container">
      {/* Tabs Navigation */}
      <div className="FM-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`FM-tab-button ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* College Tab */}
      {activeTab === "college" && (
        <div className="FM-table-container">
          <div className="FM-add-account-row">
            <h2>College List</h2>
            <button className="FM-add-button" onClick={() => setShowCollegeModal(true)}>
              Add College
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="FM-error">{error}</p>
          ) : (
            <div className="FM-table-wrapper">
              <table className="FM-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Code</th>
                    <th>Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {colleges.map((college) => (
                    <tr key={college.id}>
                      <td>{college.id}</td>
                      <td>{college.code}</td>
                      <td>{college.name}</td>
                      <td>
                        <button
                          className="FM-action-button"
                          onClick={() => setDropdownOpen(dropdownOpen === college.id ? null : college.id)}
                        >
                          ⋮
                        </button>
                        {dropdownOpen === college.id && (
                          <div className="FM-dropdown-menu">
                            <button onClick={() => handleEditCollege(college)}>Edit</button>
                            <button onClick={() => setItemToDelete({ id: college.id, type: "college" })}>
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* College Modal */}
          {showCollegeModal && (
            <CollegeModal
              collegeToEdit={collegeToEdit}
              onSubmit={handleCreateOrUpdateCollege}
              onCancel={() => {
                setShowCollegeModal(false);
                setCollegeToEdit(null);
              }}
            />
          )}
        </div>
      )}

      {/* Course Tab */}
{activeTab === "course" && (
  <div className="FM-table-container">
    <div className="FM-add-account-row">
      <h2>Course List</h2>
      <button
          className="FM-add-button"
          onClick={() => setShowCourseModal(true)}
          disabled={loadingCourses} // Disable button while loading
        >
          {loadingCourses ? "Loading..." : "Add Course"}
        </button>
    </div>

    <label>Filter by College:</label>
    <select
      className="FM-filter"
      value={selectedCollege}
      onChange={(e) => setSelectedCollege(e.target.value)}
    >
      <option value="all">All</option>
      {colleges.map((college) => (
        <option key={college.id} value={college.id}>
          {college.name}
        </option>
      ))}
    </select>

    {loading ? (
      <p>Loading...</p>
    ) : error ? (
      <p className="FM-error">{error}</p>
    ) : (
      <div className="FM-table-wrapper">
        <table className="FM-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>College</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses
              .filter((course) =>
                selectedCollege === "all" || course.college === selectedCollege
              )
              .map((course) => (
                <tr key={course.id}>
                  <td>{course.id}</td>
                  <td>{course.name}</td>
                  <td>{getCollegeName(course.college)}</td>
                  <td>
                    <button
                      className="FM-action-button"
                      onClick={() => setDropdownOpen(dropdownOpen === course.id ? null : course.id)}
                    >
                      ⋮
                    </button>
                    {dropdownOpen === course.id && (
                      <div className="FM-dropdown-menu">
                        <button
                          onClick={() => {
                            setCourseToEdit(course);
                            setShowCourseModal(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setItemToDelete({ id: course.id, type: "course" })}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}

      {/* Course Modal */}
      {showCourseModal && (
        <CourseModal
          onSubmit={handleCreateOrUpdateCourse}
          onCancel={() => {
            setShowCourseModal(false);
            setCourseToEdit(null);
          }}
          courseToEdit={courseToEdit}
          colleges={colleges}
        />
      )}


      {/* Violations Tab */}
      {activeTab === "violations" && (
        <div className="FM-table-container">
          <div className="FM-add-account-row">
            <h2>Violations List</h2>
            <button
              className="FM-add-button"
              onClick={() => setShowViolationTypeModal(true)}
              disabled={loadingViolations} // Disable button while loading
            >
              {loadingViolations ? "Loading..." : "+ Add Violation Type"}
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="FM-error">{error}</p>
          ) : (
            <div className="FM-table-wrapper">
              <table className="FM-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {violations.map((violation) => (
                    <tr key={violation.id}>
                      <td>{violation.id}</td>
                      <td>{violation.name}</td>
                      <td>{violation.type || "N/A"}</td>
                      <td>
                        <div className="FM-action-menu">
                          <button
                            className="FM-action-button"
                            onClick={() => toggleDropdown(violation.id)}
                          >
                            ⋮
                          </button>
                          {dropdownOpen === violation.id && (
                            <div className="FM-dropdown-menu">
                              <button onClick={() => handleEdit(violation)}>Edit</button>
                              <button onClick={() => setItemToDelete({ id: violation.id, type: "violation" })}>
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showViolationTypeModal && (
        <ViolationModal
          onSubmit={handleCreateOrUpdateViolationType}
          onCancel={() => {
            setShowViolationTypeModal(false);
            setViolationToEdit(null);
          }}
          violationToEdit={violationToEdit}
        />
      )}

      {/* Single Delete Confirmation Modal */}
      {itemToDelete.id && (
        <div className="FM-modal-overlay">
          <div className="FM-modal">
            <h3>Are you sure you want to delete this {itemToDelete.type}?</h3>
            <p>This action cannot be undone.</p>
            <button
              onClick={() => {
                handleDelete(itemToDelete.id, itemToDelete.type);
                setItemToDelete({ id: null, type: null });
              }}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Yes, Delete"}
            </button>
            <button
              onClick={() => setItemToDelete({ id: null, type: null })}
              disabled={loading}
            >
              No, Cancel
            </button>
          </div>
        </div>
      )}

      {/* Accounts Tab */}
        {activeTab === "accounts" && (
          <div className="FM-table-container">
            <div className="FM-add-account-row">
              <h2>Accounts List</h2>
              <button
                className="FM-add-button"
                onClick={() => setIsModalOpen(true)}
                disabled={loadingAccounts} // Disable button while loading
              >
                {loadingAccounts ? "Loading..." : "+ Add Account"}
              </button>
            </div>

            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
              <option value="all">All</option>
              <option value="dean">Dean</option>
              <option value="guard">Guard</option>
              <option value="sac">SAC</option>
            </select>

            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="FM-error">{error}</p>
            ) : (
              <table className="FM-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>College</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts
                    .filter((acc) => selectedRole === "all" || acc.role.toLowerCase() === selectedRole)
                    .map((acc) => (
                      <tr key={acc.username}>
                        <td>{acc.username}</td>
                        <td>{acc.name}</td>
                        <td>{acc.email}</td>
                        <td>{acc.role}</td>
                        <td>{acc.college || "N/A"}</td>
                        <td>
                          <button
                            className="FM-action-button"
                            onClick={() => setDropdownOpen(dropdownOpen === acc.username ? null : acc.username)}
                          >
                            ⋮
                          </button>
                          {dropdownOpen === acc.username && (
                            <div className="FM-dropdown-menu">
                              <button onClick={() => handleChangePassword(acc.username)}>
                                Change Password
                              </button>
                              <button onClick={() => setItemToDelete({ id: acc.username, type: "account" })}>
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      {showPasswordModal && (
        <div className="FM-modal-overlay">
          <div className="FM-modal">
            <h3>Change Password for {changePassword.username}</h3>
            <input
              type="password"
              placeholder="New Password"
              value={changePassword.newPassword || ""}
              onChange={(e) => setChangePassword({ ...changePassword, newPassword: e.target.value })}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={changePassword.confirmPassword || ""}
              onChange={(e) => setChangePassword({ ...changePassword, confirmPassword: e.target.value })}
            />
            <button
              onClick={handleSubmitPasswordChange}
              disabled={loading}
            >
              {loading ? "Changing Password..." : "Submit"}
            </button>
            <button
              onClick={() => {
                setShowPasswordModal(false);
                setError("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Modal for Creating an Account */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={() => setIsModalOpen(false)}>×</button>
            <CreateAccountForm
              colleges={colleges}
              onCreateAccount={handleCreateAccount}
              setError={setError}
              setLoading={setLoading}
              setShowOverlay={setIsModalOpen}
            />
          </div>
        </div>
      )}

        {activeTab === "semesters" && (
          <div className="FM-table-container">
            <div className="FM-add-account-row">
              <h2>Semester List</h2>
              <button className="FM-add-button" onClick={() => setShowSemesterModal(true)}>
                Add Semester
              </button>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="FM-error">{error}</p>
            ) : (
              <div className="FM-table-wrapper">
                <table className="FM-table">
                  <thead>
                    <tr>
                      <th>Semester ID</th>
                      <th>Academic Year</th>
                      <th>Semester Name</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {semesters.map((semester) => (
                      <tr key={semester.id}>
                        <td>{semester.semesterId}</td>
                        <td>{semester.academicYear}</td>
                        <td>{semester.semesterName}</td>
                        <td>{new Date(semester.startDate).toLocaleDateString()}</td>
                        <td>{new Date(semester.endDate).toLocaleDateString()}</td>
                        <td>
                          <button
                            className="FM-action-button"
                            onClick={() => setDropdownOpen(dropdownOpen === semester.id ? null : semester.id)}
                          >
                            ⋮
                          </button>
                          {dropdownOpen === semester.id && (
                            <div className="FM-dropdown-menu">
                              <button onClick={() => handleEditSemester(semester)}>Edit</button>
                              <button onClick={() => setItemToDelete({ id: semester.id, type: "semester" })}>
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {showSemesterModal && (
          <div className="FM-overlay">
            <div className="FM-modal-content">
              {/* Close Button */}
              <button className="FM-close-button" onClick={() => {
                setShowSemesterModal(false);
                setSemesterToEdit(null);
              }}>×</button>

              {/* Modal Title */}
              <h3>{semesterToEdit ? "Edit Semester" : "Add Semester"}</h3>
              <p>{semesterToEdit ? "Fill in the details to edit the semester." : "Fill in the details to add a new semester."}</p>

              {/* Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const academicYear = formData.get("academicYear");
                  const semester = formData.get("semester");

                  // Generate Semester ID
                  const [startYear, endYear] = academicYear.split("-");
                  const semesterId = `${startYear.slice(-2)}${endYear.slice(-2)}_SEM_${
                    semester === "First Semester" ? "1" :
                    semester === "Second Semester" ? "2" :
                    semester === "Summer" ? "3" : ""
                  }`;

                  const semesterData = {
                    semesterId,
                    academicYear,
                    semesterName: semester,
                    startDate: formData.get("startDate"),
                    endDate: formData.get("endDate"),
                  };
                  handleCreateOrUpdateSemester(semesterData);
                }}
              >
                {/* Academic Year Dropdown */}
                <div className="FM-form-group">
                  <label>Academic Year:</label>
                  <select
                    name="academicYear"
                    defaultValue={semesterToEdit?.academicYear || ""}
                    className="FM-input"
                    required
                  >
                    <option value="">Select Academic Year</option>
                    {Array.from({ length: 10 }, (_, i) => {
                      const startYear = new Date().getFullYear() + i;
                      const endYear = startYear + 1;
                      return `${startYear}-${endYear}`;
                    }).map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Semester Dropdown */}
                <div className="FM-form-group">
                  <label>Semester:</label>
                  <select
                    name="semester"
                    defaultValue={semesterToEdit?.semesterName || ""}
                    className="FM-input"
                    required
                  >
                    <option value="">Select Semester</option>
                    <option value="First Semester">First Semester</option>
                    <option value="Second Semester">Second Semester</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>

                {/* Start Date */}
                <div className="FM-form-group">
                  <label>Start Date:</label>
                  <input
                    type="date"
                    name="startDate"
                    defaultValue={semesterToEdit?.startDate?.split("T")[0] || ""}
                    className="FM-input"
                    required
                  />
                </div>

                {/* End Date */}
                <div className="FM-form-group">
                  <label>End Date:</label>
                  <input
                    type="date"
                    name="endDate"
                    defaultValue={semesterToEdit?.endDate?.split("T")[0] || ""}
                    className="FM-input"
                    required
                  />
                </div>

                {/* Buttons */}
                <div className="FM-button-group">
                  <button
                    type="button"
                    className="FM-cancel-btn"
                    onClick={() => {
                      setShowSemesterModal(false);
                      setSemesterToEdit(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="FM-submit-btn"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : (semesterToEdit ? "Update" : "Create")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      {showSuccessModal && (
        <SuccessModal
          message={successMessage}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
};

export default FileManagement;