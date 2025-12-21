const express = require('express');
const enrollmentController = require('../controllers/enrollmentController');
const authMiddleware = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const auditLog = require('../middleware/auditLog');

const router = express.Router();

router.use(authMiddleware);

router.get('/', enrollmentController.getAll);
router.get('/:id', enrollmentController.getById);
router.post('/', checkRole('ADMIN'), auditLog('CREATE', 'ENROLLMENT'), enrollmentController.create);
router.post('/bulk', checkRole('ADMIN'), auditLog('BULK_ENROLL', 'ENROLLMENT'), enrollmentController.bulkEnroll);
router.put('/:id', checkRole('ADMIN'), auditLog('UPDATE', 'ENROLLMENT'), enrollmentController.update);
router.delete('/:id', checkRole('ADMIN'), auditLog('DELETE', 'ENROLLMENT'), enrollmentController.delete);

module.exports = router;
