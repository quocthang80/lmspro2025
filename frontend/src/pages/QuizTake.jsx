import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizzesAPI, enrollmentsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

function QuizTake() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [responses, setResponses] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startQuiz();
  }, [quizId]);

  const startQuiz = async () => {
    try {
      // Get enrollment for the course
      const enrollmentsRes = await enrollmentsAPI.getAll({ userId: user.id });
      if (enrollmentsRes.data.enrollments.length === 0) {
        alert('You must be enrolled in the course to take this quiz');
        navigate(-1);
        return;
      }

      const enrollmentId = enrollmentsRes.data.enrollments[0].id;

      // Start quiz attempt
      const response = await quizzesAPI.startAttempt(quizId, enrollmentId);
      setAttempt(response.data.attempt);
      setQuiz(response.data.quiz);
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Error: ' + (error.response?.data?.error || 'Failed to start quiz'));
      navigate(-1);
    }
    setLoading(false);
  };

  const handleOptionSelect = (questionId, optionId) => {
    setResponses({
      ...responses,
      [questionId]: optionId
    });
  };

  const handleSubmit = async () => {
    if (!confirm('Are you sure you want to submit your quiz?')) return;

    const formattedResponses = Object.entries(responses).map(([questionId, optionId]) => ({
      questionId,
      optionId
    }));

    try {
      const response = await quizzesAPI.submitAttempt(attempt.id, formattedResponses);
      setResult(response.data);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error: ' + (error.response?.data?.error || 'Failed to submit quiz'));
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!quiz || !attempt) {
    return <div className="container"><div className="card"><p>Quiz not available</p></div></div>;
  }

  if (submitted && result) {
    return (
      <div className="container" style={{ paddingTop: '20px' }}>
        <div className="card">
          <h1>Quiz Results</h1>
          <h2>{quiz.title}</h2>
          
          <div style={{ marginTop: '30px', padding: '20px', background: result.passed ? '#d4edda' : '#f8d7da', borderRadius: '8px' }}>
            <h3>Score: {result.attempt.score} / {result.attempt.max_score}</h3>
            <h3>Percentage: {((result.attempt.score / result.attempt.max_score) * 100).toFixed(2)}%</h3>
            <h3>Status: {result.passed ? '✓ PASSED' : '✗ FAILED'}</h3>
            <p>Pass score required: {quiz.pass_score}%</p>
          </div>

          <div style={{ marginTop: '20px' }}>
            <button onClick={() => navigate(-1)} className="primary">
              Back to Lesson
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '20px' }}>
      <div className="card">
        <h1>{quiz.title}</h1>
        <p>{quiz.description}</p>
        <p><strong>Pass Score:</strong> {quiz.pass_score}%</p>
        {quiz.time_limit && <p><strong>Time Limit:</strong> {quiz.time_limit} minutes</p>}
        <p><strong>Attempt:</strong> {attempt.attempt_number} of {quiz.max_attempts}</p>

        <div style={{ marginTop: '30px' }}>
          {quiz.questions && quiz.questions.map((question, index) => (
            <div key={question.id} className="card" style={{ marginTop: '20px' }}>
              <h3>Question {index + 1}</h3>
              <p>{question.question_text}</p>
              <p><em>Points: {question.points}</em></p>

              <div style={{ marginTop: '16px' }}>
                {question.options && question.options.map(option => (
                  <div key={option.id} style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={option.id}
                        checked={responses[question.id] === option.id}
                        onChange={() => handleOptionSelect(question.id, option.id)}
                        style={{ marginRight: '8px' }}
                      />
                      <span>{option.option_text}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '30px', display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleSubmit} 
            className="success"
            disabled={Object.keys(responses).length !== quiz.questions.length}
          >
            Submit Quiz
          </button>
          <button onClick={() => navigate(-1)} className="secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizTake;
