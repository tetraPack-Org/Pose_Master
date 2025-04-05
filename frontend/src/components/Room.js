import React from 'react';
import { Card, CardContent, Typography, Grid, TextField, Button } from '@mui/material';

export function Room({ room, setRoom, role, createRoom, joinRoom }) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Room Controls
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Room ID"
              variant="outlined"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
          </Grid>
          <Grid item>
            {role === "mentor" && (
              <Button
                variant="contained"
                color="primary"
                onClick={createRoom}
                sx={{ mr: 1 }}
              >
                Create Room
              </Button>
            )}
            <Button
              variant="outlined"
              color="primary"
              onClick={joinRoom}
            >
              Join Room
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}