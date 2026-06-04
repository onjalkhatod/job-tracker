const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // 1. Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  
  // Headers usually arrive as "Bearer <token>", so we split by space and grab the second part
  const token = authHeader && authHeader.split(' ')[1];

  // 2. If no token is provided, block them immediately
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    // 3. Verify the token using your secret master key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Attach the decoded user data (id and email) to the request object
    req.user = decoded;
    
    // 5. Pass control to the next function (the controller)
    next();
  } catch (error) {
    // If token is expired or altered, reject it
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = verifyToken;