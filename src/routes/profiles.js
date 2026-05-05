const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const exportController = require('../controllers/exportController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const uploadController = require('../controllers/uploadController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const { requireApiVersion } = require('../middleware/apiVersion');

// Debug middleware
router.use((req, res, next) => {
    console.log('Profiles route hit:', req.method, req.path, req.params);
    next();
});

// All profile routes require authentication and API version
router.use(authenticate);
router.use(requireApiVersion);

// IMPORTANT: Specific routes BEFORE parameterized routes
router.get('/search', authorize('admin', 'analyst'), profileController.searchProfiles);
router.get('/export', authorize('admin', 'analyst'), exportController.exportProfiles);

// Generic routes
router.get('/', authorize('admin', 'analyst'), profileController.getAllProfiles);
router.post('/', authorize('admin'), profileController.createProfile);
router.get('/:id', authorize('admin', 'analyst'), profileController.getProfile);
router.delete('/:id', authorize('admin'), profileController.deleteProfile);
router.post('/upload', authorize('admin'), upload.single('file'), uploadController.uploadCSV);

module.exports = router;