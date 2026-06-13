const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. Missing auth session token header parameters.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Binds both common naming formats simultaneously onto the request context object
    req.user = {
      ...decoded,
      id: decoded.userId || decoded.id,
      userId: decoded.userId || decoded.id
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Session handshake invalid or security token expired.' });
  }
};

module.exports = authMiddleware;  