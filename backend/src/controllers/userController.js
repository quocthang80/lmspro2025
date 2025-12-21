const bcrypt = require('bcrypt');
const { User, Role, UserRole, Enrollment } = require('../models');
const { Op } = require('sequelize');

const userController = {
  async getAll(req, res) {
    try {
      const { role, status, search, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (status) where.status = status;
      if (search) {
        where[Op.or] = [
          { email: { [Op.iLike]: `%${search}%` } },
          { full_name: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const include = [{
        model: Role,
        as: 'roles',
        attributes: ['id', 'name']
      }];

      if (role) {
        include[0].where = { name: role };
      }

      const { count, rows: users } = await User.findAndCountAll({
        where,
        include,
        attributes: { exclude: ['password_hash'] },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        users,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        include: [
          {
            model: Role,
            as: 'roles',
            attributes: ['id', 'name']
          },
          {
            model: Enrollment,
            as: 'enrollments',
            attributes: ['id', 'course_id', 'status', 'progress_percent']
          }
        ],
        attributes: { exclude: ['password_hash'] }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  },

  async create(req, res) {
    try {
      const { email, password, fullName, roleName = 'STUDENT' } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const passwordHash = await bcrypt.hash(password || 'password123', 10);

      const user = await User.create({
        email,
        password_hash: passwordHash,
        full_name: fullName,
        status: 'ACTIVE'
      });

      const role = await Role.findOne({ where: { name: roleName } });
      if (role) {
        await UserRole.create({
          user_id: user.id,
          role_id: role.id
        });
      }

      const userWithRole = await User.findByPk(user.id, {
        include: [{ model: Role, as: 'roles', attributes: ['id', 'name'] }],
        attributes: { exclude: ['password_hash'] }
      });

      res.status(201).json({ 
        message: 'User created successfully',
        user: userWithRole 
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { email, fullName, status } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(400).json({ error: 'Email already exists' });
        }
      }

      await user.update({
        email: email || user.email,
        full_name: fullName || user.full_name,
        status: status || user.status
      });

      const updatedUser = await User.findByPk(id, {
        include: [{ model: Role, as: 'roles', attributes: ['id', 'name'] }],
        attributes: { exclude: ['password_hash'] }
      });

      res.json({ 
        message: 'User updated successfully',
        user: updatedUser 
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Soft delete by setting status to INACTIVE
      await user.update({ status: 'INACTIVE' });

      res.json({ message: 'User deactivated successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  },

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await user.update({ status });

      res.json({ 
        message: 'User status updated successfully',
        user: { id: user.id, status: user.status }
      });
    } catch (error) {
      console.error('Update status error:', error);
      res.status(500).json({ error: 'Failed to update status' });
    }
  },

  async bulkCreate(req, res) {
    try {
      const { users } = req.body;

      if (!Array.isArray(users) || users.length === 0) {
        return res.status(400).json({ error: 'Invalid users data' });
      }

      const createdUsers = [];
      const errors = [];

      for (const userData of users) {
        try {
          const { email, fullName, roleName = 'STUDENT' } = userData;

          const existingUser = await User.findOne({ where: { email } });
          if (existingUser) {
            errors.push({ email, error: 'Email already exists' });
            continue;
          }

          const passwordHash = await bcrypt.hash('password123', 10);

          const user = await User.create({
            email,
            password_hash: passwordHash,
            full_name: fullName,
            status: 'ACTIVE'
          });

          const role = await Role.findOne({ where: { name: roleName } });
          if (role) {
            await UserRole.create({
              user_id: user.id,
              role_id: role.id
            });
          }

          createdUsers.push({
            id: user.id,
            email: user.email,
            fullName: user.full_name
          });
        } catch (error) {
          errors.push({ email: userData.email, error: error.message });
        }
      }

      res.status(201).json({
        message: 'Bulk user creation completed',
        created: createdUsers.length,
        failed: errors.length,
        createdUsers,
        errors
      });
    } catch (error) {
      console.error('Bulk create error:', error);
      res.status(500).json({ error: 'Failed to create users' });
    }
  }
};

module.exports = userController;
