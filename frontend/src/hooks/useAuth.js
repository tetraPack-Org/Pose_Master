import { useState, useEffect } from "react";
import axios from "axios";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [authMode, setAuthMode] = useState("signin");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get(
        "https://fit-align.onrender.com/api/auth/me",
        {
          withCredentials: true,
        }
      );
      setUser(res.data);
      setRole(res.data.role);
    } catch (error) {
      console.error("User not authenticated", error);
    }
  };

  const handleSignup = async (username, password, role) => {
    try {
      await axios.post(
        "https://fit-align.onrender.com/api/auth/signup",
        { username, password, role },
        { withCredentials: true }
      );
      alert("Signup successful, please login");
      setAuthMode("signin");
    } catch (error) {
      console.error("Signup failed", error);
      alert(
        "Signup failed: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const handleLogin = async (username, password) => {
    try {
      await axios.post(
        "https://fit-align.onrender.com/api/auth/login",
        { username, password },
        { withCredentials: true }
      );
      await fetchUser();
    } catch (error) {
      console.error("Login failed", error);
      alert(
        "Login failed: " + (error.response?.data?.message || error.message)
      );
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "https://fit-align.onrender.com/api/auth/logout",
        {},
        { withCredentials: true }
      );
      setUser(null);
      setRole(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return {
    user,
    role,
    authMode,
    setAuthMode,
    handleSignup,
    handleLogin,
    handleLogout,
  };
}
