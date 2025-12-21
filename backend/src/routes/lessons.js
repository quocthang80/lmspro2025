const express = require('express');
const lessonController = require('../controllers/lessonController');
const contentController = require('../controllers/contentController');
const authMiddleware = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const auditLog = require('../middleware/auditLog');

const router = express.Router();

router.use(authMiddleware);

// Lesson routes
router.get('/:id', lessonController.getById);
router.put('/:id', checkRole('ADMIN'), auditLog('UPDATE', 'LESSON'), lessonController.update);
router.delete('/:id', checkRole('ADMIN'), auditLog('DELETE', 'LESSON'), lessonController.delete);

// Content routes (nested under lessons)
router.get('/:lessonId/contents', contentController.getAll);
router.post('/:lessonId/contents', checkRole('ADMIN'), contentController.uploadMiddleware, auditLog('CREATE', 'CONTENT'), contentController.create);
router.put('/contents/:id', checkRole('ADMIN'), auditLog('UPDATE', 'CONTENT'), contentController.update);
router.delete('/contents/:id', checkRole('ADMIN'), auditLog('DELETE', 'CONTENT'), contentController.delete);

module.exports = router;
