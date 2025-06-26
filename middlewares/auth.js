require("dotenv").config();

const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: 'No token found' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.jwtData = { userId: decoded.userId, email: decoded.email }; // { userId, email }
    console.log("JWT data :", req.jwtData);

    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};