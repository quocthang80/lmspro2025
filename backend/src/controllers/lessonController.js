const { Lesson, CourseModule, LessonContent, Quiz } = require('../models');

const lessonController = {
  async getAll(req, res) {
    try {
      const { moduleId } = req.params;

      const lessons = await Lesson.findAll({
        where: { module_id: moduleId },
        include: [
          {
            model: LessonContent,
            as: 'contents',
            attributes: ['id', 'content_type', 'title', 'order_index']
          },
          {
            model: Quiz,
            as: 'quiz',
            attributes: ['id', 'title', 'pass_score']
          }
        ],
        order: [['order_index', 'ASC'], [{ model: LessonContent, as: 'contents' }, 'order_index', 'ASC']]
      });

      res.json({ lessons });
    } catch (error) {
      console.error('Get lessons error:', error);
      res.status(500).json({ error: 'Failed to fetch lessons' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;

      const lesson = await Lesson.findByPk(id, {
        include: [
          {
            model: CourseModule,
            as: 'module',
            attributes: ['id', 'title', 'course_id']
          },
          {
            model: LessonContent,
            as: 'contents',
            order: [['order_index', 'ASC']]
          },
          {
            model: Quiz,
            as: 'quiz'
          }
        ]
      });

      if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
      }

      res.json({ lesson });
    } catch (error) {
      console.error('Get lesson error:', error);
      res.status(500).json({ error: 'Failed to fetch lesson' });
    }
  },

  async create(req, res) {
    try {
      const { moduleId } = req.params;
      const { title, description, orderIndex, isRequired, estimatedDuration } = req.body;

      const module = await CourseModule.findByPk(moduleId);
      if (!module) {
        return res.status(404).json({ error: 'Module not found' });
      }

      const lesson = await Lesson.create({
        module_id: moduleId,
        title,
        description,
        order_index: orderIndex || 0,
        is_required: isRequired !== undefined ? isRequired : true,
        estimated_duration: estimatedDuration
      });

      res.status(201).json({
        message: 'Lesson created successfully',
        lesson
      });
    } catch (error) {
      console.error('Create lesson error:', error);
      res.status(500).json({ error: 'Failed to create lesson' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, description, orderIndex, isRequired, estimatedDuration } = req.body;

      const lesson = await Lesson.findByPk(id);
      if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
      }

      await lesson.update({
        title: title || lesson.title,
        description: description !== undefined ? description : lesson.description,
        order_index: orderIndex !== undefined ? orderIndex : lesson.order_index,
        is_required: isRequired !== undefined ? isRequired : lesson.is_required,
        estimated_duration: estimatedDuration !== undefined ? estimatedDuration : lesson.estimated_duration
      });

      res.json({
        message: 'Lesson updated successfully',
        lesson
      });
    } catch (error) {
      console.error('Update lesson error:', error);
      res.status(500).json({ error: 'Failed to update lesson' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const lesson = await Lesson.findByPk(id);
      if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
      }

      await lesson.destroy();

      res.json({ message: 'Lesson deleted successfully' });
    } catch (error) {
      console.error('Delete lesson error:', error);
      res.status(500).json({ error: 'Failed to delete lesson' });
    }
  }
};

module.exports = lessonController;
