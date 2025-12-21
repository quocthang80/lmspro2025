const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const auditLog = require('../middleware/auditLog');

const router = express.Router();

// All user management routes require authentication
router.use(authMiddleware);

router.get('/', checkRole('ADMIN'), userController.getAll);
router.get('/:id', checkRole('ADMIN'), userController.getById);
router.post('/', checkRole('ADMIN'), auditLog('CREATE', 'USER'), userController.create);
router.post('/bulk', checkRole('ADMIN'), auditLog('BULK_CREATE', 'USER'), userController.bulkCreate);
router.put('/:id', checkRole('ADMIN'), auditLog('UPDATE', 'USER'), userController.update);
router.put('/:id/status', checkRole('ADMIN'), auditLog('UPDATE_STATUS', 'USER'), userController.updateStatus);
router.delete('/:id', checkRole('ADMIN'), auditLog('DELETE', 'USER'), userController.delete);

module.exports = router;
