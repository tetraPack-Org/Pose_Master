import { useState } from 'react';
import axios from 'axios';

export function useProfile(user) {
  const [profile, setProfile] = useState({});

  const fetchProfile = async () => {
    try {
      const res = await axios.get("https://fit-align.onrender.com/api/auth/profile", {
        withCredentials: true,
      });
      console.log("Profile data:", res.data);
      setProfile(res.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const updateProfile = async () => {
    try {
      const updatedProfile = { ...profile, userId: user?.userId };
      const res = await axios.put(
        "https://fit-align.onrender.com/api/auth/profile",
        updatedProfile,
        { withCredentials: true }
      );
      console.log("Profile updated:", res.data);
      alert("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  return {
    profile,
    setProfile,
    fetchProfile,
    updateProfile
  };
}