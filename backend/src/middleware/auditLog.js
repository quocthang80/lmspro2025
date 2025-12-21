const { AuditLog } = require('../models');

const auditLog = (action, entityType) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = async function(data) {
      if (req.user && res.statusCode < 400) {
        try {
          await AuditLog.create({
            user_id: req.user.id,
            action,
            entity_type: entityType,
            entity_id: data?.id || req.params?.id || null,
            changes: {
              method: req.method,
              body: req.body,
              params: req.params
            },
            ip_address: req.ip || req.connection.remoteAddress
          });
        } catch (error) {
          console.error('Audit log error:', error);
        }
      }
      
      originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = auditLog;
