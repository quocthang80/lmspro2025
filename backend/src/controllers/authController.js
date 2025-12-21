const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Role, UserRole } = require('../models');

const authController = {
  async register(req, res) {
    try {
      const { email, password, fullName, roleName = 'STUDENT' } = req.body;

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

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

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: roleName
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ 
        where: { email },
        include: [{
          model: Role,
          as: 'roles',
          attributes: ['name']
        }]
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (user.status !== 'ACTIVE') {
        return res.status(403).json({ error: 'Account is not active' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      await user.update({ last_login_at: new Date() });

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          roles: user.roles.map(r => r.name)
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  },

  async me(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        include: [{
          model: Role,
          as: 'roles',
          attributes: ['name']
        }],
        attributes: { exclude: ['password_hash'] }
      });

      res.json({ user });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user info' });
    }
  },

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findByPk(req.user.id);

      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await user.update({ password_hash: passwordHash });

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
};

module.exports = authController;
