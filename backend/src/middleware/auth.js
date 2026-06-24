import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "cyber-lms-super-secret-key-change-me");
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(401).json({ error: "Invalid token." });
  }
}
