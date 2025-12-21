const { Quiz, QuizQuestion, QuizOption, QuizAttempt, QuizResponse, Enrollment, Lesson, ProgressSummary } = require('../models');

const quizController = {
  async getAll(req, res) {
    try {
      const { lessonId } = req.query;
      
      const where = {};
      if (lessonId) where.lesson_id = lessonId;

      const quizzes = await Quiz.findAll({
        where,
        include: [
          {
            model: Lesson,
            as: 'lesson',
            attributes: ['id', 'title']
          },
          {
            model: QuizQuestion,
            as: 'questions',
            attributes: ['id', 'question_text', 'points']
          }
        ]
      });

      res.json({ quizzes });
    } catch (error) {
      console.error('Get quizzes error:', error);
      res.status(500).json({ error: 'Failed to fetch quizzes' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const { includeAnswers } = req.query;

      const quiz = await Quiz.findByPk(id, {
        include: [
          {
            model: Lesson,
            as: 'lesson',
            attributes: ['id', 'title']
          },
          {
            model: QuizQuestion,
            as: 'questions',
            include: [{
              model: QuizOption,
              as: 'options',
              attributes: includeAnswers === 'true' ? ['id', 'option_text', 'is_correct', 'order_index'] : ['id', 'option_text', 'order_index']
            }],
            order: [['order_index', 'ASC']]
          }
        ]
      });

      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      res.json({ quiz });
    } catch (error) {
      console.error('Get quiz error:', error);
      res.status(500).json({ error: 'Failed to fetch quiz' });
    }
  },

  async create(req, res) {
    try {
      const { lessonId, title, description, passScore, timeLimit, maxAttempts, shuffleQuestions, questions } = req.body;

      const lesson = await Lesson.findByPk(lessonId);
      if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
      }

      const quiz = await Quiz.create({
        lesson_id: lessonId,
        title,
        description,
        pass_score: passScore || 70,
        time_limit: timeLimit,
        max_attempts: maxAttempts || 3,
        shuffle_questions: shuffleQuestions || false
      });

      // Create questions and options if provided
      if (questions && Array.isArray(questions)) {
        for (const [index, questionData] of questions.entries()) {
          const question = await QuizQuestion.create({
            quiz_id: quiz.id,
            question_text: questionData.questionText,
            question_type: questionData.questionType || 'MULTIPLE_CHOICE',
            points: questionData.points || 1,
            order_index: index
          });

          if (questionData.options && Array.isArray(questionData.options)) {
            for (const [optIndex, optionData] of questionData.options.entries()) {
              await QuizOption.create({
                question_id: question.id,
                option_text: optionData.optionText,
                is_correct: optionData.isCorrect || false,
                order_index: optIndex
              });
            }
          }
        }
      }

      const createdQuiz = await Quiz.findByPk(quiz.id, {
        include: [{
          model: QuizQuestion,
          as: 'questions',
          include: [{ model: QuizOption, as: 'options' }]
        }]
      });

      res.status(201).json({
        message: 'Quiz created successfully',
        quiz: createdQuiz
      });
    } catch (error) {
      console.error('Create quiz error:', error);
      res.status(500).json({ error: 'Failed to create quiz' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, description, passScore, timeLimit, maxAttempts, shuffleQuestions } = req.body;

      const quiz = await Quiz.findByPk(id);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      await quiz.update({
        title: title || quiz.title,
        description: description !== undefined ? description : quiz.description,
        pass_score: passScore !== undefined ? passScore : quiz.pass_score,
        time_limit: timeLimit !== undefined ? timeLimit : quiz.time_limit,
        max_attempts: maxAttempts !== undefined ? maxAttempts : quiz.max_attempts,
        shuffle_questions: shuffleQuestions !== undefined ? shuffleQuestions : quiz.shuffle_questions
      });

      res.json({
        message: 'Quiz updated successfully',
        quiz
      });
    } catch (error) {
      console.error('Update quiz error:', error);
      res.status(500).json({ error: 'Failed to update quiz' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const quiz = await Quiz.findByPk(id);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      await quiz.destroy();

      res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
      console.error('Delete quiz error:', error);
      res.status(500).json({ error: 'Failed to delete quiz' });
    }
  },

  async startAttempt(req, res) {
    try {
      const { id: quizId } = req.params;
      const { enrollmentId } = req.body;

      const quiz = await Quiz.findByPk(quizId);
      if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
      }

      const enrollment = await Enrollment.findByPk(enrollmentId);
      if (!enrollment) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }

      // Check number of previous attempts
      const previousAttempts = await QuizAttempt.count({
        where: {
          quiz_id: quizId,
          enrollment_id: enrollmentId
        }
      });

      if (previousAttempts >= quiz.max_attempts) {
        return res.status(400).json({ error: 'Maximum attempts reached' });
      }

      // Calculate max score
      const questions = await QuizQuestion.findAll({ where: { quiz_id: quizId } });
      const maxScore = questions.reduce((sum, q) => sum + parseFloat(q.points), 0);

      const attempt = await QuizAttempt.create({
        quiz_id: quizId,
        enrollment_id: enrollmentId,
        attempt_number: previousAttempts + 1,
        status: 'IN_PROGRESS',
        max_score: maxScore
      });

      // Get quiz with questions and options (without showing correct answers)
      const quizWithQuestions = await Quiz.findByPk(quizId, {
        include: [{
          model: QuizQuestion,
          as: 'questions',
          include: [{
            model: QuizOption,
            as: 'options',
            attributes: ['id', 'option_text', 'order_index']
          }]
        }]
      });

      res.status(201).json({
        message: 'Quiz attempt started successfully',
        attempt,
        quiz: quizWithQuestions
      });
    } catch (error) {
      console.error('Start attempt error:', error);
      res.status(500).json({ error: 'Failed to start quiz attempt' });
    }
  },

  async submitAttempt(req, res) {
    try {
      const { id: attemptId } = req.params;
      const { responses } = req.body;

      const attempt = await QuizAttempt.findByPk(attemptId, {
        include: [{
          model: Quiz,
          as: 'quiz',
          include: [{
            model: QuizQuestion,
            as: 'questions',
            include: [{
              model: QuizOption,
              as: 'options'
            }]
          }]
        }]
      });

      if (!attempt) {
        return res.status(404).json({ error: 'Attempt not found' });
      }

      if (attempt.status !== 'IN_PROGRESS') {
        return res.status(400).json({ error: 'Attempt already submitted' });
      }

      let totalScore = 0;

      // Grade each response
      for (const response of responses) {
        const { questionId, optionId, answerText } = response;

        const question = attempt.quiz.questions.find(q => q.id === questionId);
        if (!question) continue;

        let isCorrect = false;
        let pointsEarned = 0;

        if (question.question_type === 'MULTIPLE_CHOICE') {
          const selectedOption = question.options.find(opt => opt.id === optionId);
          if (selectedOption && selectedOption.is_correct) {
            isCorrect = true;
            pointsEarned = parseFloat(question.points);
          }
        } else if (question.question_type === 'TRUE_FALSE') {
          const selectedOption = question.options.find(opt => opt.id === optionId);
          if (selectedOption && selectedOption.is_correct) {
            isCorrect = true;
            pointsEarned = parseFloat(question.points);
          }
        }

        totalScore += pointsEarned;

        await QuizResponse.create({
          attempt_id: attemptId,
          question_id: questionId,
          option_id: optionId,
          answer_text: answerText,
          is_correct: isCorrect,
          points_earned: pointsEarned
        });
      }

      const passed = (totalScore / parseFloat(attempt.max_score)) * 100 >= parseFloat(attempt.quiz.pass_score);

      await attempt.update({
        status: 'GRADED',
        score: totalScore,
        passed,
        submitted_at: new Date()
      });

      // Update progress summary if passed
      if (passed) {
        const [progressSummary] = await ProgressSummary.findOrCreate({
          where: {
            enrollment_id: attempt.enrollment_id,
            lesson_id: attempt.quiz.lesson_id
          },
          defaults: {
            completion_percent: 100,
            is_completed: true,
            quiz_score: totalScore,
            completed_at: new Date()
          }
        });

        if (progressSummary) {
          await progressSummary.update({
            completion_percent: 100,
            is_completed: true,
            quiz_score: totalScore,
            completed_at: new Date()
          });
        }
      }

      const gradedAttempt = await QuizAttempt.findByPk(attemptId, {
        include: [
          {
            model: Quiz,
            as: 'quiz',
            attributes: ['id', 'title', 'pass_score']
          },
          {
            model: QuizResponse,
            as: 'responses',
            include: [
              {
                model: QuizQuestion,
                as: 'question',
                include: [{
                  model: QuizOption,
                  as: 'options'
                }]
              },
              {
                model: QuizOption,
                as: 'option'
              }
            ]
          }
        ]
      });

      res.json({
        message: 'Quiz submitted and graded successfully',
        attempt: gradedAttempt,
        passed
      });
    } catch (error) {
      console.error('Submit attempt error:', error);
      res.status(500).json({ error: 'Failed to submit quiz' });
    }
  },

  async getAttempts(req, res) {
    try {
      const { quizId, enrollmentId } = req.query;

      const where = {};
      if (quizId) where.quiz_id = quizId;
      if (enrollmentId) where.enrollment_id = enrollmentId;

      const attempts = await QuizAttempt.findAll({
        where,
        include: [
          {
            model: Quiz,
            as: 'quiz',
            attributes: ['id', 'title', 'pass_score']
          },
          {
            model: Enrollment,
            as: 'enrollment',
            attributes: ['id', 'user_id']
          }
        ],
        order: [['started_at', 'DESC']]
      });

      res.json({ attempts });
    } catch (error) {
      console.error('Get attempts error:', error);
      res.status(500).json({ error: 'Failed to fetch attempts' });
    }
  }
};

module.exports = quizController;
