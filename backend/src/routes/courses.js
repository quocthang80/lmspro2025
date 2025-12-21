const express = require('express');
const courseController = require('../controllers/courseController');
const moduleController = require('../controllers/moduleController');
const authMiddleware = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const auditLog = require('../middleware/auditLog');

const router = express.Router();

router.use(authMiddleware);

// Course routes
router.get('/', courseController.getAll);
router.get('/:id', courseController.getById);
router.post('/', checkRole('ADMIN'), auditLog('CREATE', 'COURSE'), courseController.create);
router.put('/:id', checkRole('ADMIN'), auditLog('UPDATE', 'COURSE'), courseController.update);
router.put('/:id/publish', checkRole('ADMIN'), auditLog('PUBLISH', 'COURSE'), courseController.publish);
router.delete('/:id', checkRole('ADMIN'), auditLog('DELETE', 'COURSE'), courseController.delete);

// Module routes (nested under courses)
router.get('/:courseId/modules', moduleController.getAll);
router.post('/:courseId/modules', checkRole('ADMIN'), auditLog('CREATE', 'MODULE'), moduleController.create);

module.exports = router;
