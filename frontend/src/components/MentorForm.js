import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import axios from "axios";

function MentorForm({ roomId, mentorId }) {
    const [contents, setContents] = useState([]);
    const [submitted, setSubmitted] = useState(false);

    const addField = () => {
        setContents([...contents, { image: null, file: null, text: "" }]);
    };

    const handleImageChange = (index, event) => {
        const file = event.target.files[0];
        if (!file) return;
        const updatedContents = [...contents];
        // Save both file and create a temporary URL for preview
        updatedContents[index].image = URL.createObjectURL(file);
        updatedContents[index].file = file;
        setContents(updatedContents);
    };

    const handleTextChange = (index, value) => {
        const updatedContents = [...contents];
        updatedContents[index].text = value;
        setContents(updatedContents);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

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
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }
        try {
            const response = await axios.post(
                "http://localhost:4000/api/upload/mentorforms",
                formData
            );
            // Clear the form by resetting the contents state
            setContents([]);
            setSubmitted(true);
        } catch (error) {
            console.error("Error submitting mentor form:", error);
        }
    };

    return (
        <div>
            <h2>Mentor Content Form</h2>
            <form onSubmit={handleSubmit}>
                {contents.map((content, index) => (
                    <div
                        key={index}
                        style={{
                            marginBottom: "20px",
                            border: "1px solid #ccc",
                            padding: "10px",
                        }}
                    >
                        <div>
                            <label>Image:</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange(index, e)}
                            />
                            {content.image && (
                                <img
                                    src={content.image}
                                    alt={`preview-${index}`}
                                    style={{
                                        width: "150px",
                                        display: "block",
                                        marginTop: "10px",
                                    }}
                                />
                            )}
                        </div>
                        <div>
                            <label>Text:</label>
                            <ReactQuill
                                value={content.text}
                                onChange={(value) => handleTextChange(index, value)}
                                style={{ height: "100px", fontSize: "0.8rem" }}
                            />
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addField}>
                    Add Content Field
                </button>
                <button type="submit">Submit Content</button>
            </form>
            {submitted && <p>Form submitted successfully!</p>}
        </div>
    );
}

export default MentorForm;