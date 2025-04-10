import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (!["mentor", "mentee"].includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    const userCheck = await User.findOne({ username });
    res.status(201).json({ message: "User created successfully",
      user: {
        username: userCheck.username,
        role: userCheck.role,
        userId: userCheck._id,
      },
     });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Error creating user" });
  }
}

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials",
        username: user
       });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    // console.log("User logged in:", user._id);
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.SECRET_KEY, {
      expiresIn: "3h",
    });
    res.cookie("token", token, {
      httpOnly: true,
      // secure: true,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Send a response body after setting cookie
    return res.status(200).json({
      message: "Login successful",
      user: {
        username: user.username,
        role: user.role,
        userId: user._id,
      },
      cookies: req.cookies,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Error logging in" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    console.log("request", req.cookies);
    if (!token) return res.status(401).json({ error: "Not authenticated",
      token: token,
      cookies: req.cookies,
     });

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: "User not found" });
    // console.log("User found:", user);
    res.status(200).json({
      username: user.username,
      role: user.role,
      userId: user._id,
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ error: "Not authenticated" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",  // Uncomment in production
      sameSite: "lax",
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: "Error logging out" });
  }
};

