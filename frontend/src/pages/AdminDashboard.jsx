import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { coursesAPI, usersAPI, enrollmentsAPI, reportsAPI } from '../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'courses') {
        const response = await coursesAPI.getAll();
        setCourses(response.data.courses);
      } else if (activeTab === 'users') {
        const response = await usersAPI.getAll();
        setUsers(response.data.users);
      } else if (activeTab === 'enrollments') {
        const response = await enrollmentsAPI.getAll();
        setEnrollments(response.data.enrollments);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const openModal = (type, data = {}) => {
    setModalType(type);
    setFormData(data);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalType === 'course') {
        if (formData.id) {
          await coursesAPI.update(formData.id, formData);
        } else {
          await coursesAPI.create(formData);
        }
      } else if (modalType === 'user') {
        if (formData.id) {
          await usersAPI.update(formData.id, formData);
        } else {
          await usersAPI.create(formData);
        }
      }
      closeModal();
      loadData();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || 'Failed to save'));
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      if (type === 'course') {
        await coursesAPI.delete(id);
      } else if (type === 'user') {
        await usersAPI.delete(id);
      }
      loadData();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || 'Failed to delete'));
    }
  };

  const handlePublishCourse = async (id) => {
    try {
      await coursesAPI.publish(id);
      loadData();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || 'Failed to publish'));
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>LMS Admin Dashboard</h1>
        <div className="header-actions">
          <span>Welcome, {user?.fullName}</span>
          <button onClick={logout} className="secondary">Logout</button>
        </div>
      </header>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'courses' ? 'active' : ''} 
          onClick={() => setActiveTab('courses')}
        >
          Courses
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''} 
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={activeTab === 'enrollments' ? 'active' : ''} 
          onClick={() => setActiveTab('enrollments')}
        >
          Enrollments
        </button>
        <button 
          className={activeTab === 'reports' ? 'active' : ''} 
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </div>

      <div className="dashboard-content container">
        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : (
          <>
            {activeTab === 'courses' && (
              <div className="courses-section">
                <div className="section-header">
                  <h2>Courses</h2>
                  <button onClick={() => openModal('course')} className="primary">
                    + Create Course
                  </button>
                </div>
                <div className="courses-grid">
                  {courses.map(course => (
                    <div key={course.id} className="course-card">
                      <h3>{course.title}</h3>
                      <p>{course.description}</p>
                      <div className="course-meta">
                        <span className={`badge ${course.status.toLowerCase()}`}>
                          {course.status}
                        </span>
                        <span>{course.modules?.length || 0} modules</span>
                      </div>
                      <div className="card-actions">
                        <button onClick={() => navigate(`/courses/${course.id}`)} className="primary">
                          View
                        </button>
                        <button onClick={() => openModal('course', course)} className="secondary">
                          Edit
                        </button>
                        {course.status === 'DRAFT' && (
                          <button onClick={() => handlePublishCourse(course.id)} className="success">
                            Publish
                          </button>
                        )}
                        <button onClick={() => handleDelete('course', course.id)} className="danger">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="users-section">
                <div className="section-header">
                  <h2>Users</h2>
                  <button onClick={() => openModal('user')} className="primary">
                    + Create User
                  </button>
                </div>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.full_name}</td>
                        <td>{user.email}</td>
                        <td>{user.roles?.map(r => r.name).join(', ')}</td>
                        <td>
                          <span className={`badge ${user.status.toLowerCase()}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>
                          <button onClick={() => openModal('user', user)} className="secondary">
                            Edit
                          </button>
                          <button onClick={() => handleDelete('user', user.id)} className="danger">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'enrollments' && (
              <div className="enrollments-section">
                <h2>Enrollments</h2>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Status</th>
                      <th>Progress</th>
                      <th>Enrolled Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map(enrollment => (
                      <tr key={enrollment.id}>
                        <td>{enrollment.user?.full_name}</td>
                        <td>{enrollment.course?.title}</td>
                        <td>
                          <span className={`badge ${enrollment.status.toLowerCase()}`}>
                            {enrollment.status}
                          </span>
                        </td>
                        <td>
                          <div className="progress-bar">
                            <div 
                              className="progress-bar-fill" 
                              style={{width: `${enrollment.progress_percent}%`}}
                            >
                              {enrollment.progress_percent}%
                            </div>
                          </div>
                        </td>
                        <td>{new Date(enrollment.enrolled_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="reports-section">
                <h2>Reports</h2>
                <div className="card">
                  <p>Report generation coming soon...</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {formData.id ? 'Edit' : 'Create'} {modalType}
              </h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              {modalType === 'course' && (
                <>
                  <input
                    type="text"
                    placeholder="Title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                  <textarea
                    placeholder="Description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="4"
                  />
                  <input
                    type="date"
                    placeholder="Start Date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                  <input
                    type="date"
                    placeholder="End Date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </>
              )}
              {modalType === 'user' && (
                <>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                  {!formData.id && (
                    <input
                      type="password"
                      placeholder="Password"
                      value={formData.password || ''}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  )}
                  <select
                    value={formData.roleName || 'STUDENT'}
                    onChange={(e) => setFormData({...formData, roleName: e.target.value})}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </>
              )}
              <div className="modal-actions">
                <button type="submit" className="primary">Save</button>
                <button type="button" onClick={closeModal} className="secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
