// import bcrypt from "bcryptjs";
// import User from "../models/User.js";
// import jwt from "jsonwebtoken";

// export const signup = async (req, res) => {
//   try {
//     const { username, password, role } = req.body;
//     if (!username || !password || !role) {
//       return res.status(400).json({ error: "All fields are required" });
//     }
//     if (!["mentor", "mentee"].includes(role)) {
//       return res.status(400).json({ error: "Invalid role specified" });
//     }
//     const existingUser = await User.findOne({ username });
//     if (existingUser) {
//       return res.status(400).json({ error: "Username already taken" });
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({ username, password: hashedPassword, role });
//     await user.save();

//     res.status(201).json({ message: "User created successfully" });
//   } catch (error) {
//     console.error("Signup error:", error);
//     res.status(500).json({ error: "Error creating user" });
//   }
// }

// export const login = async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     if (!username || !password) {
//       return res.status(400).json({ error: "Username and password are required" });
//     }
//     const user = await User.findOne({ username });
//     if (!user) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ error: "Invalid credentials" });
//     }
//     // console.log("User logged in:", user._id);
//     const token = jwt.sign({ userId: user._id, role: user.role }, process.env.SECRET_KEY, {
//       expiresIn: "1h",
//     });
//     res.cookie("token", token, {
//       httpOnly: true,
//       // secure: process.env.NODE_ENV === "production", // Only use cookies over HTTPS in production
//       sameSite: "lax",
//       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//     });

//     // Send a response body after setting cookie
//     return res.status(200).json({
//       message: "Login successful",
//       user: {
//         username: user.username,
//         role: user.role,
//         userId: user._id,
//       },
//     });
//   } catch (error) {
//     console.error("Login error:", error);
//     return res.status(500).json({ error: "Error logging in" });
//   }
// };

// export const getCurrentUser = async (req, res) => {
//   try {
//     const token = req.cookies.token;
//     if (!token) return res.status(401).json({ error: "Not authenticated" });

//     const decoded = jwt.verify(token, process.env.SECRET_KEY);
//     const user = await User.findById(decoded.userId);
//     if (!user) return res.status(401).json({ error: "User not found" });
//     // console.log("User found:", user);
//     res.status(200).json({
//       username: user.username,
//       role: user.role,
//       userId: user._id,
//     });
//   } catch (error) {
//     console.error("Error verifying token:", error);
//     res.status(401).json({ error: "Not authenticated" });
//   }
// };

// export const logout = async (req, res) => {
//   try {
//     res.clearCookie("token", {
//       httpOnly: true,
//       // secure: process.env.NODE_ENV === "production",  // Uncomment in production
//       sameSite: "lax",
//     });
//     return res.status(200).json({ message: "Logged out successfully" });
//   } catch (error) {
//     console.error("Logout error:", error);
//     return res.status(500).json({ error: "Error logging out" });
//   }
// };

//// filepath: /Users/kamna/Desktop/socket.io - tutorial/server/controllers/auth.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// Use the Appwrite database connection
import databases from "../config/appwrite.config.js";
import { Query } from "node-appwrite";

// Environment variables used:
// APPWRITE_DATABASE_ID and APPWRITE_COLLECTION_ID refer to your Appwrite database & users collection

export const signup = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (!["mentor", "mentee"].includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    // Check if the user already exists by querying the Appwrite collection.
    const existingUsers = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_ID,
      [Query.equal("username", username)]
    );

    if (existingUsers.documents.length > 0) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new document in Appwrite (auto-generating a unique id)
    const createdUser = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_ID,
      "unique()", // Use Appwrite to generate a unique document ID
      { username, password: hashedPassword, role }
    );

    return res.status(201).json({ message: "User created successfully", user: createdUser });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({ error: "Error creating user" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    // Query the Appwrite users collection for the given username
    const result = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_ID,
      [Query.equal("username", username)]
    );

    if (result.documents.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Get the first matching document (assuming usernames are unique)
    const userDoc = result.documents[0];
    const isMatch = await bcrypt.compare(password, userDoc.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Create a JWT token
    const token = jwt.sign({ userId: userDoc.$id, role: userDoc.role }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });
    // Set the token in an httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production", // Uncomment for production
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return a response with user details
    return res.status(200).json({
      message: "Login successful",
      user: {
        username: userDoc.username,
        role: userDoc.role,
        userId: userDoc.$id,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Error logging in" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    // Query Appwrite collection based on the decoded userId
    const result = await databases.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_COLLECTION_ID,
      [Query.equal("$id", decoded.userId)]
    );

    if (result.documents.length === 0) return res.status(401).json({ error: "User not found" });

    const userDoc = result.documents[0];
    return res.status(200).json({
      username: userDoc.username,
      role: userDoc.role,
      userId: userDoc.$id,
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ error: "Not authenticated" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production", // Uncomment for production
      sameSite: "lax",
    });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: "Error logging out" });
  }
};