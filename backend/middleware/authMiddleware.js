import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "wavdex_secret_key";

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), SECRET_KEY);
        req.user = decoded; // ✅ Attach user data to the request
        if (!req.user.userId) {
            return res.status(403).json({ error: "Invalid token: Missing userId" });
        }
        next();
    } catch (error) {
        res.status(403).json({ error: "Invalid or expired token" });
    }
};

export default authMiddleware;

