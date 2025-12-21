const { ProgressEvent, ProgressSummary, Enrollment, LessonContent, Lesson, CourseModule, EmbeddedMedia, Course } = require('../models');
const sequelize = require('../config/database');

const progressController = {
  async trackEvent(req, res) {
    try {
      const { enrollmentId, lessonContentId, eventType, watchedDuration, totalDuration, metadata } = req.body;

      const enrollment = await Enrollment.findByPk(enrollmentId);
      if (!enrollment) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }

      const content = await LessonContent.findByPk(lessonContentId, {
        include: [
          {
            model: Lesson,
            as: 'lesson'
          },
          {
            model: EmbeddedMedia,
            as: 'embeddedMedia'
          }
        ]
      });

      if (!content) {
        return res.status(404).json({ error: 'Content not found' });
      }

      // Calculate completion based on content type
      let isCompleted = false;
      
      if (content.content_type === 'VIDEO') {
        const videoDuration = content.embeddedMedia?.duration || totalDuration;
        if (videoDuration && watchedDuration) {
          const watchPercent = (watchedDuration / videoDuration) * 100;
          isCompleted = watchPercent >= 80; // 80% threshold
        }
      } else if (content.content_type === 'FILE') {
        isCompleted = eventType === 'DOWNLOAD' || eventType === 'VIEW';
      } else if (content.content_type === 'TEXT') {
        isCompleted = eventType === 'VIEW';
      }

      // Create progress event
      const progressEvent = await ProgressEvent.create({
        enrollment_id: enrollmentId,
        lesson_content_id: lessonContentId,
        event_type: eventType,
        watched_duration: watchedDuration,
        total_duration: totalDuration,
        is_completed: isCompleted,
        metadata
      });

      // Update or create progress summary for the lesson
      await this.updateProgressSummary(enrollment, content.lesson);

      // Update overall enrollment progress
      await this.updateEnrollmentProgress(enrollment);

      res.status(201).json({
        message: 'Progress event tracked successfully',
        progressEvent,
        isCompleted
      });
    } catch (error) {
      console.error('Track event error:', error);
      res.status(500).json({ error: 'Failed to track progress event' });
    }
  },

  async updateProgressSummary(enrollment, lesson) {
    try {
      // Get all lesson contents and their completion status
      const contents = await LessonContent.findAll({
        where: { lesson_id: lesson.id },
        include: [{
          model: ProgressEvent,
          as: 'progressEvents',
          where: { enrollment_id: enrollment.id },
          required: false,
          order: [['event_at', 'DESC']],
          limit: 1
        }]
      });

      let completedCount = 0;
      let totalRequired = 0;

      contents.forEach(content => {
        if (content.is_required) {
          totalRequired++;
          if (content.progressEvents && content.progressEvents.length > 0 && content.progressEvents[0].is_completed) {
            completedCount++;
          }
        }
      });

      const completionPercent = totalRequired > 0 ? (completedCount / totalRequired) * 100 : 0;
      const isCompleted = completionPercent >= 100;

      // Update or create progress summary
      const [progressSummary] = await ProgressSummary.findOrCreate({
        where: {
          enrollment_id: enrollment.id,
          lesson_id: lesson.id
        },
        defaults: {
          completion_percent: completionPercent,
          is_completed: isCompleted,
          last_accessed_at: new Date()
        }
      });

      if (progressSummary) {
        await progressSummary.update({
          completion_percent: completionPercent,
          is_completed: isCompleted,
          last_accessed_at: new Date(),
          completed_at: isCompleted && !progressSummary.completed_at ? new Date() : progressSummary.completed_at
        });
      }

      return progressSummary;
    } catch (error) {
      console.error('Update progress summary error:', error);
      throw error;
    }
  },

  async updateEnrollmentProgress(enrollment) {
    try {
      // Get all lessons for the course
      const course = await Course.findByPk(enrollment.course_id, {
        include: [{
          model: CourseModule,
          as: 'modules',
          include: [{
            model: Lesson,
            as: 'lessons'
          }]
        }]
      });

      const allLessons = [];
      course.modules.forEach(module => {
        module.lessons.forEach(lesson => {
          if (lesson.is_required) {
            allLessons.push(lesson);
          }
        });
      });

      // Get progress summaries for all required lessons
      const progressSummaries = await ProgressSummary.findAll({
        where: {
          enrollment_id: enrollment.id,
          lesson_id: allLessons.map(l => l.id)
        }
      });

      const completedLessons = progressSummaries.filter(ps => ps.is_completed).length;
      const totalLessons = allLessons.length;
      const overallProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      const newStatus = overallProgress >= 100 ? 'COMPLETED' : 
                        overallProgress > 0 ? 'IN_PROGRESS' : 'ENROLLED';

      await enrollment.update({
        progress_percent: overallProgress,
        status: newStatus,
        completed_at: newStatus === 'COMPLETED' && !enrollment.completed_at ? new Date() : enrollment.completed_at
      });

      return enrollment;
    } catch (error) {
      console.error('Update enrollment progress error:', error);
      throw error;
    }
  },

  async getSummary(req, res) {
    try {
      const { enrollmentId, lessonId } = req.query;

      if (!enrollmentId) {
        return res.status(400).json({ error: 'Enrollment ID is required' });
      }

      const where = { enrollment_id: enrollmentId };
      if (lessonId) where.lesson_id = lessonId;

      const progressSummaries = await ProgressSummary.findAll({
        where,
        include: [{
          model: Lesson,
          as: 'lesson',
          attributes: ['id', 'title', 'is_required', 'estimated_duration'],
          include: [{
            model: CourseModule,
            as: 'module',
            attributes: ['id', 'title']
          }]
        }],
        order: [[{ model: Lesson, as: 'lesson' }, { model: CourseModule, as: 'module' }, 'order_index', 'ASC'], [{ model: Lesson, as: 'lesson' }, 'order_index', 'ASC']]
      });

      res.json({ progressSummaries });
    } catch (error) {
      console.error('Get progress summary error:', error);
      res.status(500).json({ error: 'Failed to fetch progress summary' });
    }
  },

  async getDetailedProgress(req, res) {
    try {
      const { enrollmentId, lessonId } = req.params;

      const progressSummary = await ProgressSummary.findOne({
        where: {
          enrollment_id: enrollmentId,
          lesson_id: lessonId
        },
        include: [
          {
            model: Lesson,
            as: 'lesson',
            include: [{
              model: LessonContent,
              as: 'contents',
              include: [{
                model: ProgressEvent,
                as: 'progressEvents',
                where: { enrollment_id: enrollmentId },
                required: false,
                order: [['event_at', 'DESC']]
              }]
            }]
          }
        ]
      });

      if (!progressSummary) {
        return res.status(404).json({ error: 'Progress summary not found' });
      }

      res.json({ progressSummary });
    } catch (error) {
      console.error('Get detailed progress error:', error);
      res.status(500).json({ error: 'Failed to fetch detailed progress' });
    }
  }
};

module.exports = progressController;
