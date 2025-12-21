const { Course, CourseModule, Lesson, LessonContent, User, Enrollment } = require('../models');
const { Op } = require('sequelize');

const courseController = {
  async getAll(req, res) {
    try {
      const { status, search, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows: courses } = await Course.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'full_name', 'email']
          },
          {
            model: CourseModule,
            as: 'modules',
            attributes: ['id', 'title']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        courses,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get courses error:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;

      const course = await Course.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'full_name', 'email']
          },
          {
            model: CourseModule,
            as: 'modules',
            include: [{
              model: Lesson,
              as: 'lessons',
              include: [{
                model: LessonContent,
                as: 'contents',
                attributes: ['id', 'content_type', 'title', 'order_index', 'is_required']
              }]
            }],
            order: [['order_index', 'ASC']]
          },
          {
            model: Enrollment,
            as: 'enrollments',
            attributes: ['id', 'user_id', 'status']
          }
        ]
      });

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      res.json({ course });
    } catch (error) {
      console.error('Get course error:', error);
      res.status(500).json({ error: 'Failed to fetch course' });
    }
  },

  async create(req, res) {
    try {
      const { title, description, startDate, endDate } = req.body;

      const course = await Course.create({
        title,
        description,
        status: 'DRAFT',
        start_date: startDate,
        end_date: endDate,
        created_by: req.user.id
      });

      res.status(201).json({
        message: 'Course created successfully',
        course
      });
    } catch (error) {
      console.error('Create course error:', error);
      res.status(500).json({ error: 'Failed to create course' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, description, startDate, endDate, status } = req.body;

      const course = await Course.findByPk(id);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      await course.update({
        title: title || course.title,
        description: description !== undefined ? description : course.description,
        start_date: startDate !== undefined ? startDate : course.start_date,
        end_date: endDate !== undefined ? endDate : course.end_date,
        status: status || course.status
      });

      res.json({
        message: 'Course updated successfully',
        course
      });
    } catch (error) {
      console.error('Update course error:', error);
      res.status(500).json({ error: 'Failed to update course' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const course = await Course.findByPk(id);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      // Soft delete by setting status to ARCHIVED
      await course.update({ status: 'ARCHIVED' });

      res.json({ message: 'Course archived successfully' });
    } catch (error) {
      console.error('Delete course error:', error);
      res.status(500).json({ error: 'Failed to delete course' });
    }
  },

  async publish(req, res) {
    try {
      const { id } = req.params;

      const course = await Course.findByPk(id, {
        include: [{
          model: CourseModule,
          as: 'modules',
          include: [{
            model: Lesson,
            as: 'lessons',
            include: [{
              model: LessonContent,
              as: 'contents'
            }]
          }]
        }]
      });

      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      if (!course.modules || course.modules.length === 0) {
        return res.status(400).json({ error: 'Cannot publish course without modules' });
      }

      await course.update({ status: 'PUBLISHED' });

      res.json({
        message: 'Course published successfully',
        course
      });
    } catch (error) {
      console.error('Publish course error:', error);
      res.status(500).json({ error: 'Failed to publish course' });
    }
  }
};

module.exports = courseController;
