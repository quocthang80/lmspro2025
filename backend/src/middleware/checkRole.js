const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasRole = allowedRoles.some(role => req.user.roles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.roles
      });
    }

    next();
  };
};

module.exports = checkRole;
