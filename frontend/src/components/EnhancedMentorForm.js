import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";
import {
  Button,
  Typography,
  Box,
  Paper,
  Grid,
  IconButton,
  Alert,
  Fade,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Stack,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";

function EnhancedMentorForm({ roomId, mentorId, onSubmission, socket }) {
  const [contents, setContents] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const addField = () => {
    setContents([...contents, { image: null, file: null, text: "" }]);
  };

  const handleImageChange = (index, event) => {
    const file = event.target.files[0];
    if (!file) return;
    const updatedContents = [...contents];
    updatedContents[index].image = URL.createObjectURL(file);
    updatedContents[index].file = file;
    setContents(updatedContents);
  };

  const handleTextChange = (index, value) => {
    const updatedContents = [...contents];
    updatedContents[index].text = value;
    setContents(updatedContents);
  };

  const removeField = (index) => {
    const updatedContents = [...contents];
    updatedContents.splice(index, 1);
    setContents(updatedContents);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (contents.length === 0) {
      alert("Please add at least one content field");
      return;
    }

    setLoading(true);

    // Prepare FormData to handle file uploads along with text
    const formData = new FormData();
    formData.append("roomId", roomId);
    formData.append("mentor", mentorId);

    // Append each content field's text and image file to the FormData.
    contents.forEach((content, index) => {
      formData.append(`contents[${index}][text]`, content.text);
      // Append file if available; otherwise, send an empty string
      if (content.file) {
        formData.append(`contents[${index}][image]`, content.file);
      } else {
        formData.append(`contents[${index}][image]`, "");
      }
    });

    // log the FormData for debugging
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

    try {
      await axios.post(
        "https://fit-align.onrender.com/api/upload/mentorforms",
        formData,
        {
          // headers: {
          //     'Content-Type': 'multipart/form-data',
          // },
          withCredentials: true,
        }
      );
      setContents([]);
      setSubmitted(true);

      const galleryRes = await axios.get(
        "https://fit-align.onrender.com/api/upload/mentorforms/get",
        {
          params: { roomId, mentor: mentorId },
          withCredentials: true,
        }
      );

      console.log("Updated gallery data:", galleryRes);
      const updatedGallery = galleryRes.data;

      // Emit the gallery update event with the updated gallery data and room ID.
      if (onSubmission) onSubmission(updatedGallery);

      // In MentorForm.js (inside handleSubmit, after fetching updatedGallery):
      if (socket) {
        console.log("1 -> updated gallery is emitting");
        socket.emit("galleryUpdated", updatedGallery, roomId);
      }

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting mentor form:", error);
      alert(
        "Error submitting form: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Yoga Poses Content
      </Typography>

      <Fade in={submitted}>
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setSubmitted(false)}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          Content submitted successfully!
        </Alert>
      </Fade>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {contents.map((content, index) => (
            <Card key={index} variant="outlined" sx={{ position: "relative" }}>
              <IconButton
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: "rgba(255,255,255,0.7)",
                  "&:hover": {
                    backgroundColor: "rgba(255,0,0,0.1)",
                  },
                }}
                onClick={() => removeField(index)}
              >
                <CloseIcon />
              </IconButton>

              <CardHeader title={`Pose ${index + 1}`} sx={{ pb: 0 }} />

              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Image
                    </Typography>
                    <Box
                      sx={{
                        border: "1px dashed rgba(0,0,0,0.2)",
                        borderRadius: 1,
                        p: 1,
                        textAlign: "center",
                        backgroundColor: content.image
                          ? "transparent"
                          : "rgba(0,0,0,0.03)",
                      }}
                    >
                      <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id={`file-input-${index}`}
                        type="file"
                        onChange={(e) => handleImageChange(index, e)}
                      />
                      <label htmlFor={`file-input-${index}`}>
                        {!content.image ? (
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={<CloudUploadIcon />}
                            sx={{ mb: 1 }}
                          >
                            Upload Image
                          </Button>
                        ) : null}

                        {content.image && (
                          <Box sx={{ position: "relative" }}>
                            <CardMedia
                              component="img"
                              image={content.image}
                              alt={`preview-${index}`}
                              sx={{
                                width: "100%",
                                maxHeight: 200,
                                objectFit: "contain",
                                borderRadius: 1,
                              }}
                            />
                            <Button
                              variant="contained"
                              size="small"
                              sx={{
                                position: "absolute",
                                bottom: 8,
                                right: 8,
                                opacity: 0.8,
                              }}
                              component="span"
                            >
                              Replace
                            </Button>
                          </Box>
                        )}
                      </label>

                      {!content.image && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Recommended: Clear images of yoga poses
                        </Typography>
                      )}
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" gutterBottom>
                      Description
                    </Typography>
                    <Box
                      sx={{
                        "& .ql-container": {
                          borderBottomLeftRadius: "4px",
                          borderBottomRightRadius: "4px",
                          backgroundColor: "#fff",
                        },
                        "& .ql-toolbar": {
                          borderTopLeftRadius: "4px",
                          borderTopRightRadius: "4px",
                          backgroundColor: "#f8f9fa",
                        },
                        "& .ql-editor": {
                          minHeight: "150px",
                          fontSize: "0.9rem",
                        },
                      }}
                    >
                      <ReactQuill
                        value={content.text}
                        onChange={(value) => handleTextChange(index, value)}
                        placeholder="Describe the yoga pose and provide instructions..."
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="outlined"
              onClick={addField}
              startIcon={<AddIcon />}
              color="primary"
            >
              Add Yoga Pose
            </Button>

            <Button
              variant="contained"
              type="submit"
              disabled={loading || contents.length === 0}
              startIcon={<SendIcon />}
              color="primary"
            >
              {loading ? "Submitting..." : "Submit All Poses"}
            </Button>
          </Box>
        </Stack>
      </Box>

      {contents.length === 0 && !loading && (
        <Paper
          sx={{
            p: 3,
            mt: 2,
            textAlign: "center",
            backgroundColor: "rgba(0,0,0,0.02)",
          }}
        >
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No yoga poses added yet
          </Typography>
          <Button variant="outlined" onClick={addField} startIcon={<AddIcon />}>
            Add Your First Yoga Pose
          </Button>
        </Paper>
      )}
    </Box>
  );
}

export default EnhancedMentorForm;
