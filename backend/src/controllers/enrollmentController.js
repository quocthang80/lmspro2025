const { Enrollment, Course, User, ProgressSummary, Lesson } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

const enrollmentController = {
  async getAll(req, res) {
    try {
      const { courseId, userId, status, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (courseId) where.course_id = courseId;
      if (userId) where.user_id = userId;
      if (status) where.status = status;

      const { count, rows: enrollments } = await Enrollment.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'full_name']
          },
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'status']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['enrolled_at', 'DESC']]
      });

      res.json({
        enrollments,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get enrollments error:', error);
      res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;

      const enrollment = await Enrollment.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'full_name']
          },
          {
            model: Course,
            as: 'course'
          },
          {
            model: ProgressSummary,
            as: 'progressSummaries',
            include: [{
              model: Lesson,
              as: 'lesson',
              attributes: ['id', 'title', 'is_required']
            }]
          }
        ]
      });

      if (!enrollment) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }

      res.json({ enrollment });
    } catch (error) {
      console.error('Get enrollment error:', error);
      res.status(500).json({ error: 'Failed to fetch enrollment' });
    }
  },

  async create(req, res) {
    try {
      const { courseId, userId } = req.body;

      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (course.status !== 'PUBLISHED') {
        return res.status(400).json({ error: 'Cannot enroll in unpublished course' });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const existingEnrollment = await Enrollment.findOne({
        where: { user_id: userId, course_id: courseId }
      });

      if (existingEnrollment) {
        return res.status(400).json({ error: 'User already enrolled in this course' });
      }

      const enrollment = await Enrollment.create({
        user_id: userId,
        course_id: courseId,
        status: 'ENROLLED',
        progress_percent: 0
      });

      res.status(201).json({
        message: 'Enrollment created successfully',
        enrollment
      });
    } catch (error) {
      console.error('Create enrollment error:', error);
      res.status(500).json({ error: 'Failed to create enrollment' });
    }
  },

  async bulkEnroll(req, res) {
    try {
      const { courseId, userIds } = req.body;

      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ error: 'Invalid user IDs' });
      }

      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      const enrollments = [];
      const errors = [];

      for (const userId of userIds) {
        try {
          const existingEnrollment = await Enrollment.findOne({
            where: { user_id: userId, course_id: courseId }
          });

          if (existingEnrollment) {
            errors.push({ userId, error: 'Already enrolled' });
            continue;
          }

          const enrollment = await Enrollment.create({
            user_id: userId,
            course_id: courseId,
            status: 'ENROLLED',
            progress_percent: 0
          });

          enrollments.push(enrollment);
        } catch (error) {
          errors.push({ userId, error: error.message });
        }
      }

      res.status(201).json({
        message: 'Bulk enrollment completed',
        created: enrollments.length,
        failed: errors.length,
        enrollments,
        errors
      });
    } catch (error) {
      console.error('Bulk enroll error:', error);
      res.status(500).json({ error: 'Failed to enroll users' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const enrollment = await Enrollment.findByPk(id);
      if (!enrollment) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }

      await enrollment.update({ 
        status,
        completed_at: status === 'COMPLETED' ? new Date() : enrollment.completed_at
      });

      res.json({
        message: 'Enrollment updated successfully',
        enrollment
      });
    } catch (error) {
      console.error('Update enrollment error:', error);
      res.status(500).json({ error: 'Failed to update enrollment' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const enrollment = await Enrollment.findByPk(id);
      if (!enrollment) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }

      await enrollment.update({ status: 'DROPPED' });

      res.json({ message: 'Enrollment dropped successfully' });
    } catch (error) {
      console.error('Delete enrollment error:', error);
      res.status(500).json({ error: 'Failed to drop enrollment' });
    }
  }
};

module.exports = enrollmentController;
