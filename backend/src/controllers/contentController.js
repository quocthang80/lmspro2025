const { LessonContent, Lesson, FileAsset, EmbeddedMedia, Quiz } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 } // 50MB default
});

const contentController = {
  uploadMiddleware: upload.single('file'),

  async getAll(req, res) {
    try {
      const { lessonId } = req.params;

      const contents = await LessonContent.findAll({
        where: { lesson_id: lessonId },
        include: [
          {
            model: FileAsset,
            as: 'fileAsset'
          },
          {
            model: EmbeddedMedia,
            as: 'embeddedMedia'
          },
          {
            model: Quiz,
            as: 'quiz',
            attributes: ['id', 'title', 'pass_score']
          }
        ],
        order: [['order_index', 'ASC']]
      });

      res.json({ contents });
    } catch (error) {
      console.error('Get contents error:', error);
      res.status(500).json({ error: 'Failed to fetch contents' });
    }
  },

  async create(req, res) {
    try {
      const { lessonId } = req.params;
      const { contentType, title, orderIndex, isRequired, textContent, embedUrl, mediaType, duration, quizId } = req.body;

      const lesson = await Lesson.findByPk(lessonId);
      if (!lesson) {
        return res.status(404).json({ error: 'Lesson not found' });
      }

      let fileAssetId = null;
      let embeddedMediaId = null;

      // Handle file upload
      if (contentType === 'FILE' && req.file) {
        const fileAsset = await FileAsset.create({
          file_name: req.file.originalname,
          file_path: req.file.path,
          file_size: req.file.size,
          mime_type: req.file.mimetype,
          uploaded_by: req.user.id
        });
        fileAssetId = fileAsset.id;
      }

      // Handle embedded media
      if (contentType === 'VIDEO' && embedUrl) {
        const embeddedMedia = await EmbeddedMedia.create({
          media_type: mediaType || 'YOUTUBE',
          embed_url: embedUrl,
          title: title,
          duration: duration
        });
        embeddedMediaId = embeddedMedia.id;
      }

      const content = await LessonContent.create({
        lesson_id: lessonId,
        content_type: contentType,
        title,
        order_index: orderIndex || 0,
        is_required: isRequired !== undefined ? isRequired : true,
        file_asset_id: fileAssetId,
        embedded_media_id: embeddedMediaId,
        text_content: textContent,
        quiz_id: quizId
      });

      const createdContent = await LessonContent.findByPk(content.id, {
        include: [
          { model: FileAsset, as: 'fileAsset' },
          { model: EmbeddedMedia, as: 'embeddedMedia' },
          { model: Quiz, as: 'quiz', attributes: ['id', 'title'] }
        ]
      });

      res.status(201).json({
        message: 'Content created successfully',
        content: createdContent
      });
    } catch (error) {
      console.error('Create content error:', error);
      res.status(500).json({ error: 'Failed to create content' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, orderIndex, isRequired, textContent } = req.body;

      const content = await LessonContent.findByPk(id);
      if (!content) {
        return res.status(404).json({ error: 'Content not found' });
      }

      await content.update({
        title: title || content.title,
        order_index: orderIndex !== undefined ? orderIndex : content.order_index,
        is_required: isRequired !== undefined ? isRequired : content.is_required,
        text_content: textContent !== undefined ? textContent : content.text_content
      });

      res.json({
        message: 'Content updated successfully',
        content
      });
    } catch (error) {
      console.error('Update content error:', error);
      res.status(500).json({ error: 'Failed to update content' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const content = await LessonContent.findByPk(id, {
        include: [{ model: FileAsset, as: 'fileAsset' }]
      });

      if (!content) {
        return res.status(404).json({ error: 'Content not found' });
      }

      // Delete associated file if exists
      if (content.fileAsset && fs.existsSync(content.fileAsset.file_path)) {
        fs.unlinkSync(content.fileAsset.file_path);
        await content.fileAsset.destroy();
      }

      await content.destroy();

      res.json({ message: 'Content deleted successfully' });
    } catch (error) {
      console.error('Delete content error:', error);
      res.status(500).json({ error: 'Failed to delete content' });
    }
  }
};

module.exports = contentController;
