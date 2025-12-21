import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonsAPI, progressAPI, enrollmentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function LessonView() {
  const { courseId, lessonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLesson();
    getEnrollmentId();
  }, [lessonId]);

  const getEnrollmentId = async () => {
    try {
      const response = await enrollmentsAPI.getAll({ userId: user.id, courseId });
      if (response.data.enrollments.length > 0) {
        setEnrollmentId(response.data.enrollments[0].id);
      }
    } catch (error) {
      console.error('Error getting enrollment:', error);
    }
  };

  const loadLesson = async () => {
    try {
      const response = await lessonsAPI.getById(lessonId);
      setLesson(response.data.lesson);
    } catch (error) {
      console.error('Error loading lesson:', error);
    }
    setLoading(false);
  };

  const trackProgress = async (contentId, eventType) => {
    if (!enrollmentId) return;
    
    try {
      await progressAPI.trackEvent({
        enrollmentId,
        lessonContentId: contentId,
        eventType,
        metadata: {}
      });
    } catch (error) {
      console.error('Error tracking progress:', error);
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!lesson) {
    return <div className="container"><div className="card"><p>Lesson not found</p></div></div>;
  }

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      <button onClick={() => navigate(`/courses/${courseId}`)} className="secondary" style={{ marginBottom: '20px' }}>
        ← Back to Course
      </button>
      
      <div className="card">
        <h1>{lesson.title}</h1>
        <p>{lesson.description}</p>
        {lesson.estimated_duration && <p><em>Estimated duration: {lesson.estimated_duration} minutes</em></p>}
        
        <h2 style={{ marginTop: '30px' }}>Lesson Content</h2>
        {lesson.contents && lesson.contents.length > 0 ? (
          lesson.contents.map(content => (
            <div key={content.id} className="card" style={{ marginTop: '16px' }}>
              <h3>{content.title}</h3>
              <p>Type: {content.content_type}</p>
              {content.is_required && <span className="badge warning">Required</span>}
              
              {content.content_type === 'TEXT' && content.text_content && (
                <div style={{ marginTop: '16px' }}>
                  <p>{content.text_content}</p>
                  <button 
                    onClick={() => trackProgress(content.id, 'VIEW')} 
                    className="primary"
                  >
                    Mark as Read
                  </button>
                </div>
              )}
              
              {content.content_type === 'VIDEO' && content.embeddedMedia && (
                <div style={{ marginTop: '16px' }}>
                  <p>Video URL: {content.embeddedMedia.embed_url}</p>
                  <button 
                    onClick={() => trackProgress(content.id, 'VIEW')} 
                    className="primary"
                  >
                    Mark as Watched
                  </button>
                </div>
              )}
              
              {content.content_type === 'FILE' && content.fileAsset && (
                <div style={{ marginTop: '16px' }}>
                  <p>File: {content.fileAsset.file_name}</p>
                  <button 
                    onClick={() => trackProgress(content.id, 'DOWNLOAD')} 
                    className="primary"
                  >
                    Download & Mark Complete
                  </button>
                </div>
              )}
              
              {content.content_type === 'QUIZ' && content.quiz && (
                <div style={{ marginTop: '16px' }}>
                  <p>Quiz: {content.quiz.title}</p>
                  <button 
                    onClick={() => navigate(`/quizzes/${content.quiz.id}/take`)} 
                    className="success"
                  >
                    Take Quiz
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No content available for this lesson.</p>
        )}
      </div>
    </div>
  );
}

export default LessonView;
