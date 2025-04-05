import React from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Paper,
} from "@mui/material";

const activityLevels = [
  "Sedentary",
  "lightly active",
  "Moderately active",
  "very active",
];

const goals = ["weight Loss", "maintenance", "muscle Gain", "Improve Health"];

const dietPreferences = [
  "Vegeterian",
  "Non-vegeterian",
  "Gluten Free",
  "No Preference",
];

const budgetLevels = ["low", "medium", "high"];

export default function Profile({
  profile,
  setProfile,
  updateProfile,
  navigate,
}) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile();
    navigate("/");
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom color="primary">
          Update Profile
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                type="number"
                value={profile.age || ""}
                onChange={(e) =>
                  setProfile({ ...profile, age: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Gender"
                value={profile.gender || "female"}
                onChange={(e) =>
                  setProfile({ ...profile, gender: e.target.value })
                }
              >
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="male">Male</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Weight (kg)"
                type="number"
                value={profile.weight || ""}
                onChange={(e) =>
                  setProfile({ ...profile, weight: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Height (cm)"
                type="number"
                value={profile.height || ""}
                onChange={(e) =>
                  setProfile({ ...profile, height: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Activity Level"
                value={profile.activity_level || "lightly active"}
                onChange={(e) =>
                  setProfile({ ...profile, activity_level: e.target.value })
                }
              >
                {activityLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Goal"
                value={profile.goal || "Improve Health"}
                onChange={(e) =>
                  setProfile({ ...profile, goal: e.target.value })
                }
              >
                {goals.map((goal) => (
                  <MenuItem key={goal} value={goal}>
                    {goal}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Diet Preference"
                value={profile.diet_pref || "No Preference"}
                onChange={(e) =>
                  setProfile({ ...profile, diet_pref: e.target.value })
                }
              >
                {dietPreferences.map((pref) => (
                  <MenuItem key={pref} value={pref}>
                    {pref}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Budget Level"
                value={profile.budget_level || "low"}
                onChange={(e) =>
                  setProfile({ ...profile, budget_level: e.target.value })
                }
              >
                {budgetLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Allergies"
                multiline
                rows={2}
                value={profile.allergies || ""}
                onChange={(e) =>
                  setProfile({ ...profile, allergies: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medical Conditions"
                multiline
                rows={2}
                value={profile.medical_conditions || ""}
                onChange={(e) =>
                  setProfile({ ...profile, medical_conditions: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button variant="outlined" onClick={() => navigate("/")}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained">
                  Save Changes
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}
