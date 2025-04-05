import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("Token from cookies:", token);
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    // Attach the user details to the request object
    req.user = { userId: decoded.userId, role: decoded.role };
    console.log("Decoded user:", req.user);
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ error: "Not authenticated" });
  }
};