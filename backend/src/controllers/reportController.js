const { Report, FileAsset, Course, User, Enrollment, ProgressSummary, QuizAttempt, Lesson } = require('../models');
const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const reportController = {
  async getAll(req, res) {
    try {
      const { reportType, status, page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (reportType) where.report_type = reportType;
      if (status) where.status = status;

      const { count, rows: reports } = await Report.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'generator',
            attributes: ['id', 'full_name', 'email']
          },
          {
            model: FileAsset,
            as: 'file',
            attributes: ['id', 'file_name', 'file_path']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        reports,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get reports error:', error);
      res.status(500).json({ error: 'Failed to fetch reports' });
    }
  },

  async generate(req, res) {
    try {
      const { reportType, title, filters, format = 'CSV' } = req.body;

      // Create report record
      const report = await Report.create({
        report_type: reportType,
        title,
        filters: filters || {},
        status: 'PROCESSING',
        generated_by: req.user.id
      });

      // Generate report asynchronously
      setImmediate(async () => {
        try {
          let data;
          
          switch (reportType) {
            case 'COURSE_PROGRESS':
              data = await this.generateCourseProgressData(filters);
              break;
            case 'STUDENT_PROGRESS':
              data = await this.generateStudentProgressData(filters);
              break;
            case 'QUIZ_RESULTS':
              data = await this.generateQuizResultsData(filters);
              break;
            case 'ENROLLMENT_SUMMARY':
              data = await this.generateEnrollmentSummaryData(filters);
              break;
            default:
              throw new Error('Invalid report type');
          }

          // Export data to file
          const filePath = format === 'PDF' 
            ? await this.exportToPDF(data, report)
            : await this.exportToCSV(data, report);

          // Save file asset
          const fileAsset = await FileAsset.create({
            file_name: path.basename(filePath),
            file_path: filePath,
            file_size: fs.statSync(filePath).size,
            mime_type: format === 'PDF' ? 'application/pdf' : 'text/csv',
            uploaded_by: req.user.id
          });

          // Update report
          await report.update({
            status: 'READY',
            file_asset_id: fileAsset.id,
            completed_at: new Date()
          });
        } catch (error) {
          console.error('Report generation error:', error);
          await report.update({ status: 'FAILED' });
        }
      });

      res.status(202).json({
        message: 'Report generation started',
        report
      });
    } catch (error) {
      console.error('Create report error:', error);
      res.status(500).json({ error: 'Failed to create report' });
    }
  },

  async generateCourseProgressData(filters) {
    const { courseId, startDate, endDate } = filters;

    const where = {};
    if (courseId) where.course_id = courseId;

    const enrollments = await Enrollment.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        },
        {
          model: ProgressSummary,
          as: 'progressSummaries',
          include: [{
            model: Lesson,
            as: 'lesson',
            attributes: ['id', 'title', 'is_required']
          }]
        }
      ]
    });

    return enrollments.map(enrollment => {
      const completedLessons = enrollment.progressSummaries.filter(ps => ps.is_completed).length;
      const totalLessons = enrollment.progressSummaries.length;

      return {
        'Student Name': enrollment.user.full_name,
        'Student Email': enrollment.user.email,
        'Course': enrollment.course.title,
        'Status': enrollment.status,
        'Progress': `${enrollment.progress_percent}%`,
        'Completed Lessons': `${completedLessons}/${totalLessons}`,
        'Enrolled Date': enrollment.enrolled_at,
        'Completed Date': enrollment.completed_at || 'N/A'
      };
    });
  },

  async generateStudentProgressData(filters) {
    const { userId, courseId } = filters;

    const where = {};
    if (userId) where.user_id = userId;
    if (courseId) where.course_id = courseId;

    const enrollments = await Enrollment.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        },
        {
          model: ProgressSummary,
          as: 'progressSummaries',
          include: [{
            model: Lesson,
            as: 'lesson',
            attributes: ['id', 'title']
          }]
        },
        {
          model: QuizAttempt,
          as: 'quizAttempts',
          attributes: ['id', 'score', 'max_score', 'passed', 'submitted_at']
        }
      ]
    });

    const data = [];

    enrollments.forEach(enrollment => {
      enrollment.progressSummaries.forEach(ps => {
        data.push({
          'Student Name': enrollment.user.full_name,
          'Student Email': enrollment.user.email,
          'Course': enrollment.course.title,
          'Lesson': ps.lesson.title,
          'Completion': `${ps.completion_percent}%`,
          'Quiz Score': ps.quiz_score || 'N/A',
          'Status': ps.is_completed ? 'Completed' : 'In Progress',
          'Last Accessed': ps.last_accessed_at,
          'Completed Date': ps.completed_at || 'N/A'
        });
      });
    });

    return data;
  },

  async generateQuizResultsData(filters) {
    const { courseId, quizId } = filters;

    const where = {};
    if (quizId) where.quiz_id = quizId;

    const attempts = await QuizAttempt.findAll({
      where,
      include: [
        {
          model: Quiz,
          as: 'quiz',
          attributes: ['id', 'title', 'pass_score']
        },
        {
          model: Enrollment,
          as: 'enrollment',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'full_name', 'email']
            },
            {
              model: Course,
              as: 'course',
              attributes: ['id', 'title']
            }
          ]
        }
      ]
    });

    return attempts.map(attempt => ({
      'Student Name': attempt.enrollment.user.full_name,
      'Student Email': attempt.enrollment.user.email,
      'Course': attempt.enrollment.course.title,
      'Quiz': attempt.quiz.title,
      'Attempt Number': attempt.attempt_number,
      'Score': `${attempt.score}/${attempt.max_score}`,
      'Percentage': `${((attempt.score / attempt.max_score) * 100).toFixed(2)}%`,
      'Pass Score': `${attempt.quiz.pass_score}%`,
      'Passed': attempt.passed ? 'Yes' : 'No',
      'Started At': attempt.started_at,
      'Submitted At': attempt.submitted_at
    }));
  },

  async generateEnrollmentSummaryData(filters) {
    const { courseId, status } = filters;

    const where = {};
    if (courseId) where.course_id = courseId;
    if (status) where.status = status;

    const enrollments = await Enrollment.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'start_date', 'end_date']
        }
      ]
    });

    return enrollments.map(enrollment => ({
      'Student Name': enrollment.user.full_name,
      'Student Email': enrollment.user.email,
      'Course': enrollment.course.title,
      'Status': enrollment.status,
      'Progress': `${enrollment.progress_percent}%`,
      'Enrolled Date': enrollment.enrolled_at,
      'Completed Date': enrollment.completed_at || 'N/A',
      'Course Start': enrollment.course.start_date || 'N/A',
      'Course End': enrollment.course.end_date || 'N/A'
    }));
  },

  async exportToCSV(data, report) {
    try {
      const fields = Object.keys(data[0] || {});
      const parser = new Parser({ fields });
      const csv = parser.parse(data);

      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const fileName = `report-${report.id}-${Date.now()}.csv`;
      const filePath = path.join(uploadDir, fileName);

      fs.writeFileSync(filePath, csv);

      return filePath;
    } catch (error) {
      console.error('Export to CSV error:', error);
      throw error;
    }
  },

  async exportToPDF(data, report) {
    try {
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const fileName = `report-${report.id}-${Date.now()}.pdf`;
      const filePath = path.join(uploadDir, fileName);

      const doc = new PDFDocument();
      doc.pipe(fs.createWriteStream(filePath));

      // Add title
      doc.fontSize(20).text(report.title, { align: 'center' });
      doc.moveDown();

      // Add data as table
      if (data.length > 0) {
        const headers = Object.keys(data[0]);
        
        doc.fontSize(10);
        data.forEach((row, index) => {
          if (index === 0) {
            doc.font('Helvetica-Bold');
            doc.text(headers.join(' | '));
            doc.font('Helvetica');
          }
          
          const values = headers.map(h => row[h]);
          doc.text(values.join(' | '));
          
          if (doc.y > 700) {
            doc.addPage();
          }
        });
      }

      doc.end();

      return filePath;
    } catch (error) {
      console.error('Export to PDF error:', error);
      throw error;
    }
  },

  async download(req, res) {
    try {
      const { id } = req.params;

      const report = await Report.findByPk(id, {
        include: [{
          model: FileAsset,
          as: 'file'
        }]
      });

      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      if (report.status !== 'READY' || !report.file) {
        return res.status(400).json({ error: 'Report not ready for download' });
      }

      const filePath = report.file.file_path;

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Report file not found' });
      }

      res.download(filePath, report.file.file_name);
    } catch (error) {
      console.error('Download report error:', error);
      res.status(500).json({ error: 'Failed to download report' });
    }
  }
};

module.exports = reportController;
