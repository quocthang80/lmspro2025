const express = require('express');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

const router = express.Router();

router.use(authMiddleware);
router.use(checkRole('ADMIN'));

router.get('/', reportController.getAll);
router.post('/', reportController.generate);
router.get('/:id/download', reportController.download);

module.exports = router;
