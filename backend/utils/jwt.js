import jwt from "jsonwebtoken";
import {db} from '../db.js';

export const generateAccessToken = (userPayload) => {
  return jwt.sign( 
    {
      userId: userPayload.userId,
      schoolId: userPayload.schoolId,
      role: userPayload.role,
      nameFNfirst: userPayload.nameFNfirst,
      nameLNfirst: userPayload.nameLNfirst,
      firstName: userPayload.firstName,
      lastName: userPayload.lastName,
      is_archived: userPayload.isArchived
    }, 
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" }
  );
};

export const generateRefreshToken = (userPayload) => {
  return jwt.sign(
    {
      userId: userPayload.userId,
      schoolId: userPayload.schoolId,
      role: userPayload.role,
      nameFNfirst: userPayload.nameFNfirst,
      nameLNfirst: userPayload.nameLNfirst,
      firstName: userPayload.firstName,
      lastName: userPayload.lastName,
      is_archived: userPayload.isArchived
    },
    process.env.JWT_REFRESH_SECRET, 
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" });
}

export const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

export const verifyJWT = (req, res, next) => {
  console.log("verifyJWT middleware HIT");

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
          console.log("Incoming token:", token);
          console.log("Decoded user:", decoded);
    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    return res.status(403).json({ error: 'Invalid access token' });
  }
};

export const verifyRole = (...requiredRoles) => {
  return (req, res, next) => {
    console.log("Required:", requiredRoles, "| Found:", req.user?.role); 
    if (!requiredRoles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
};

export const refreshAccessToken = async(req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: "Refresh token missing--cant get access token" });

  try {
    //auto update expired-exams; will update the exam status
    await db.query(`
      UPDATE examinations
      SET status = 'completed'
      WHERE (status = 'ongoing' OR status = 'published')
      AND end_datetime <= NOW()`)

    await db.query(`
      UPDATE examinations
      SET status = 'ongoing'
      WHERE status = 'published'
      AND start_datetime <= NOW()
      AND end_datetime > NOW()`)

    const decoded = verifyToken(token, process.env.JWT_REFRESH_SECRET);

    // check if user is archived
    const userCheck = await db.query(
      "SELECT is_archived FROM users WHERE user_id = $1",
      [decoded.userId]
    );

    if (userCheck.rows.length === 0)
      return res.status(403).json({ error: "User not found" });
    if (userCheck.rows[0].is_archived)
      return res.status(403).json({ error: "Archived user cannot refresh token" });

    const newAccessToken = generateAccessToken(decoded);

    res.json({
      accessToken: newAccessToken,
      user: decoded, //already contains userId, schoolId, nameFNfirst, nameLNfirst, role
    });
  } catch (err) {
    return res.status(403).json({ error: "Invalid refresh token" });
  }
};

export const clearToken =  (req, res) => { //for idk yet, i have this logout logic in auth.js
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.LOCAL !== "true",
    sameSite: process.env.LOCAL === "true" ? "Lax" : "None"
  });

  res.status(200).json({ message: "Logged out" });
};




/* 
    // when verifying access token
    verifyToken(accessToken, process.env.JWT_ACCESS_SECRET);

    // when verifying refresh token
    verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
*/