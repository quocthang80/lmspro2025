import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { coursesAPI, enrollmentsAPI } from '../services/api';
import './StudentDashboard.css';

function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-courses');

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      // Get user's enrollments
      const enrollmentsRes = await enrollmentsAPI.getAll({ userId: user.id });
      setEnrollments(enrollmentsRes.data.enrollments);

      // Get all published courses
      const coursesRes = await coursesAPI.getAll({ status: 'PUBLISHED' });
      const enrolledCourseIds = enrollmentsRes.data.enrollments.map(e => e.course_id);
      const available = coursesRes.data.courses.filter(
        course => !enrolledCourseIds.includes(course.id)
      );
      setAvailableCourses(available);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const handleEnroll = async (courseId) => {
    try {
      await enrollmentsAPI.create({ courseId, userId: user.id });
      loadData();
    } catch (error) {
      alert('Error: ' + (error.response?.data?.error || 'Failed to enroll'));
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <h1>My Learning Dashboard</h1>
        <div className="header-actions">
          <span>Welcome, {user?.fullName}</span>
          <button onClick={logout} className="secondary">Logout</button>
        </div>
      </header>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'my-courses' ? 'active' : ''} 
          onClick={() => setActiveTab('my-courses')}
        >
          My Courses
        </button>
        <button 
          className={activeTab === 'available' ? 'active' : ''} 
          onClick={() => setActiveTab('available')}
        >
          Available Courses
        </button>
      </div>

      <div className="dashboard-content container">
        {activeTab === 'my-courses' && (
          <div className="my-courses-section">
            <h2>My Enrolled Courses</h2>
            {enrollments.length === 0 ? (
              <div className="card">
                <p>You haven't enrolled in any courses yet. Check out the available courses!</p>
              </div>
            ) : (
              <div className="courses-grid">
                {enrollments.map(enrollment => (
                  <div key={enrollment.id} className="course-card">
                    <h3>{enrollment.course?.title}</h3>
                    <p>{enrollment.course?.description}</p>
                    <div className="course-meta">
                      <span className={`badge ${enrollment.status.toLowerCase()}`}>
                        {enrollment.status}
                      </span>
                    </div>
                    <div className="progress-section">
                      <div className="progress-label">
                        <span>Progress</span>
                        <span>{enrollment.progress_percent}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-bar-fill" 
                          style={{width: `${enrollment.progress_percent}%`}}
                        ></div>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button 
                        onClick={() => navigate(`/courses/${enrollment.course_id}`)} 
                        className="primary"
                      >
                        Continue Learning
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'available' && (
          <div className="available-courses-section">
            <h2>Available Courses</h2>
            {availableCourses.length === 0 ? (
              <div className="card">
                <p>No new courses available at the moment.</p>
              </div>
            ) : (
              <div className="courses-grid">
                {availableCourses.map(course => (
                  <div key={course.id} className="course-card">
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <div className="course-meta">
                      <span>{course.modules?.length || 0} modules</span>
                    </div>
                    <div className="card-actions">
                      <button 
                        onClick={() => handleEnroll(course.id)} 
                        className="success"
                      >
                        Enroll Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
