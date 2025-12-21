import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesAPI } from '../services/api';

function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  const loadCourse = async () => {
    try {
      const response = await coursesAPI.getById(courseId);
      setCourse(response.data.course);
    } catch (error) {
      console.error('Error loading course:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!course) {
    return <div className="container"><div className="card"><p>Course not found</p></div></div>;
  }

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      <button onClick={() => navigate(-1)} className="secondary" style={{ marginBottom: '20px' }}>
        ← Back
      </button>
      
      <div className="card">
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        
        <h2 style={{ marginTop: '30px' }}>Course Modules</h2>
        {course.modules && course.modules.length > 0 ? (
          course.modules.map(module => (
            <div key={module.id} className="card" style={{ marginTop: '16px' }}>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              
              {module.lessons && module.lessons.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h4>Lessons</h4>
                  <ul>
                    {module.lessons.map(lesson => (
                      <li key={lesson.id} style={{ marginBottom: '12px' }}>
                        <button
                          onClick={() => navigate(`/courses/${courseId}/lessons/${lesson.id}`)}
                          className="primary"
                          style={{ marginRight: '10px' }}
                        >
                          Start Lesson
                        </button>
                        <span>{lesson.title}</span>
                        {lesson.is_required && <span className="badge warning">Required</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No modules available yet.</p>
        )}
      </div>
    </div>
  );
}

export default CourseDetails;
