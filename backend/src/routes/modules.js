const express = require('express');
const moduleController = require('../controllers/moduleController');
const lessonController = require('../controllers/lessonController');
const authMiddleware = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const auditLog = require('../middleware/auditLog');

const router = express.Router();

router.use(authMiddleware);

// Module routes
router.get('/:id', moduleController.getById);
router.put('/:id', checkRole('ADMIN'), auditLog('UPDATE', 'MODULE'), moduleController.update);
router.delete('/:id', checkRole('ADMIN'), auditLog('DELETE', 'MODULE'), moduleController.delete);

// Lesson routes (nested under modules)
router.get('/:moduleId/lessons', lessonController.getAll);
router.post('/:moduleId/lessons', checkRole('ADMIN'), auditLog('CREATE', 'LESSON'), lessonController.create);

module.exports = router;
