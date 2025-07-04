import React from 'react';
import axios from 'axios';
import { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Grid,
} from '@mui/material'

const ProfileUpdateForm = ({user }) => {

    const [profile, setProfile] = useState({});

    const updateProfile = async () => {
        try {
            const updatedProfile = { ...profile, userId: user.userId };
            const res = await axios.put(
                "http://localhost:4000/api/auth/profile",
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

    const dietPlanclickHandler = () => {
        if (!user || !user.userId) {
            alert("Please log in to generate a diet plan");
            return;
        }
        const url = `http://diet-planner-al.streamlit.app/?user_id=${user.userId}`;

        // Redirect to the diet planner API with userId as a query parameter
        window.location.href = url;
    };

  return (
    <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Update Profile
                      </Typography>
    
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Age"
                            variant="outlined"
                            value={profile.age || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, age: e.target.value })
                            }
                          />
                        </Grid>
    
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Weight"
                            variant="outlined"
                            value={profile.weight || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, weight: e.target.value })
                            }
                          />
                        </Grid>
    
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Height"
                            variant="outlined"
                            value={profile.height || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, height: e.target.value })
                            }
                          />
                        </Grid>
    
                        <Grid item xs={12} sm={6}>
                          <TextField
                            select
                            fullWidth
                            label="Gender"
                            variant="outlined"
                            value={profile.gender || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, gender: e.target.value })
                            }
                            SelectProps={{
                              native: true,
                            }}
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                          </TextField>
                        </Grid>
    
                        <Grid item xs={12} sm={6}>
                          <TextField
                            select
                            fullWidth
                            label="Activity Level"
                            variant="outlined"
                            value={profile.activity_level || ""}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                activity_level: e.target.value,
                              })
                            }
                            SelectProps={{
                              native: true,
                            }}
                          >
                            <option value="lightly active">Lightly Active</option>
                            <option value="Sedentary">Sedentary</option>
                            <option value="Moderately active">
                              Moderately Active
                            </option>
                            <option value="very active">Very Active</option>
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            select
                            fullWidth
                            label="Goal"
                            variant="outlined"
                            value={profile.goal || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, goal: e.target.value })
                            }
                            SelectProps={{
                              native: true,
                            }}
                          >
                            <option value="weight Loss">Weight Loss</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="muscle Gain">Muscle Gain</option>
                            <option value="Improve Health">Improve Health</option>
                          </TextField>
                        </Grid>
    
                        <Grid item xs={12} sm={6}>
                          <TextField
                            select
                            fullWidth
                            label="Diet Preference"
                            variant="outlined"
                            value={profile.diet_pref || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, diet_pref: e.target.value })
                            }
                            SelectProps={{
                              native: true,
                            }}
                          >
                            <option value="Vegeterian">Vegetarian</option>
                            <option value="Non-vegeterian">Non-Vegetarian</option>
                            <option value="Gluten Free">Gluten Free</option>
                            <option value="No Preference">No Preference</option>
                          </TextField>
                        </Grid>
    
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Allergies"
                            variant="outlined"
                            value={profile.allergies || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, allergies: e.target.value })
                            }
                          />
                        </Grid>
    
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Medical Conditions"
                            variant="outlined"
                            value={profile.medical_conditions || ""}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                medical_conditions: e.target.value,
                              })
                            }
                          />
                        </Grid>
    
                        <Grid item xs={12} sm={6}>
                          <TextField
                            select
                            fullWidth
                            label="Meal Preference"
                            variant="outlined"
                            value={profile.meal_pref || ""}
                            onChange={(e) =>
                              setProfile({ ...profile, meal_pref: e.target.value })
                            }
                            SelectProps={{
                              native: true,
                            }}
                          >
                            <option value="Vegetarian">Vegetarian</option>
                            <option value="Non-Vegetarian">Non-Vegetarian</option>
                            <option value="Gluten Free">Gluten Free</option>
                            <option value="No Preference">No Preference</option>
                          </TextField>
                        </Grid>
    
                        <Grid item xs={12} sm={6}>
                          <TextField
                            select
                            fullWidth
                            label="Budget Level"
                            variant="outlined"
                            value={profile.budget_level || ""}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                budget_level: e.target.value,
                              })
                            }
                            SelectProps={{
                              native: true,
                            }}
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </TextField>
                        </Grid>
    
                        <Grid item xs={12}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={updateProfile}
                            sx={{ mr: 2 }}
                          >
                            Save Profile
                          </Button>
                          <Button
                            variant="contained"
                            color="secondary"
                            onClick={dietPlanclickHandler}
                          >
                            Get Diet Plan
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
  )
}

export default ProfileUpdateForm