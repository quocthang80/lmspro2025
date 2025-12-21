const { CourseModule, Course, Lesson } = require('../models');

const moduleController = {
  async getAll(req, res) {
    try {
      const { courseId } = req.params;

      const modules = await CourseModule.findAll({
        where: { course_id: courseId },
        include: [{
          model: Lesson,
          as: 'lessons',
          attributes: ['id', 'title', 'order_index', 'is_required']
        }],
        order: [['order_index', 'ASC'], [{ model: Lesson, as: 'lessons' }, 'order_index', 'ASC']]
      });

      res.json({ modules });
    } catch (error) {
      console.error('Get modules error:', error);
      res.status(500).json({ error: 'Failed to fetch modules' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;

      const module = await CourseModule.findByPk(id, {
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title']
          },
          {
            model: Lesson,
            as: 'lessons',
            order: [['order_index', 'ASC']]
          }
        ]
      });

      if (!module) {
        return res.status(404).json({ error: 'Module not found' });
      }

      res.json({ module });
    } catch (error) {
      console.error('Get module error:', error);
      res.status(500).json({ error: 'Failed to fetch module' });
    }
  },

  async create(req, res) {
    try {
      const { courseId } = req.params;
      const { title, description, orderIndex } = req.body;

      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }

      const module = await CourseModule.create({
        course_id: courseId,
        title,
        description,
        order_index: orderIndex || 0
      });

      res.status(201).json({
        message: 'Module created successfully',
        module
      });
    } catch (error) {
      console.error('Create module error:', error);
      res.status(500).json({ error: 'Failed to create module' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, description, orderIndex } = req.body;

      const module = await CourseModule.findByPk(id);
      if (!module) {
        return res.status(404).json({ error: 'Module not found' });
      }

      await module.update({
        title: title || module.title,
        description: description !== undefined ? description : module.description,
        order_index: orderIndex !== undefined ? orderIndex : module.order_index
      });

      res.json({
        message: 'Module updated successfully',
        module
      });
    } catch (error) {
      console.error('Update module error:', error);
      res.status(500).json({ error: 'Failed to update module' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const module = await CourseModule.findByPk(id);
      if (!module) {
        return res.status(404).json({ error: 'Module not found' });
      }

      await module.destroy();

      res.json({ message: 'Module deleted successfully' });
    } catch (error) {
      console.error('Delete module error:', error);
      res.status(500).json({ error: 'Failed to delete module' });
    }
  }
};

module.exports = moduleController;
