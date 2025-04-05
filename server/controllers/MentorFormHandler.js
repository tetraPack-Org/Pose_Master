import MentorForm from "../models/MentorFromSchema.js";
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
// Configure Cloudinary
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});

// Create a new Mentor Form

export const createMentorForm = async (req, res) => {
    try {
        const { roomId, mentor } = req.body;
        console.log(`Mentor ID: ${mentor}`);
        console.log(`Room ID: ${roomId}`);
        const contentsArray = [];

        console.log("Request files:", req.files);
        console.log("Request body:", req.body);

        // Parse the contents data from form-data
        const contentIndices = new Set();

        // Go through all body fields to identify content indices
        Object.keys(req.body).forEach(key => {
            const match = key.match(/contents\[(\d+)\]\[text\]/);
            if (match) {
                contentIndices.add(parseInt(match[1], 10));
            }
        });

        // For each content index, process text and image
        const uploadPromises = Array.from(contentIndices).map(async (index) => {
            const textKey = `contents[${index}][text]`;
            const imageKey = `contents[${index}][image]`;
            const text = req.body[textKey];

          
            //Initialize content object with text
            const contentItem = { text };

            // If there's an image file, upload it to Cloudinary
            if (req.files && req.files[imageKey]) {
                const file = req.files[imageKey];

                try {
                    // Upload to Cloudinary
                    const result = await new Promise((resolve, reject) => {
                        cloudinary.uploader.upload(
                            file.tempFilePath,
                            { folder: process.env.FOLDER_NAME },
                            (error, result) => {
                                if (error) reject(error);
                                else resolve(result);
                            }
                        );
                    });

                    // Store the secure URL in the content item
                    contentItem.image = result.secure_url;
                    console.log(`Uploaded image for index ${index}: ${result.secure_url}`);

                } catch (uploadError) {
                    console.error(`Failed to upload image for index ${index}:`, uploadError);
                    // Skip this content item if image upload fails
                    return null;
                }

            } else {
                console.log(`No image file for index ${index}`);
                return null; // Skip items without images   
            }

            // Return the completed content item
            return contentItem;
        });
        // Wait for all uploads to complete and filter out any failed uploads (null values)
        const contents = (await Promise.all(uploadPromises)).filter(item => item !== null);

        console.log("Final contents to save:", contents);

        // Create and save the mentor form
        const mentorForm = new MentorForm({ roomId, mentor, contents });
        await mentorForm.save();

        res.status(201).json({
            message: "Mentor form created successfully",
            mentorForm,
        });
    } catch (error) {
        console.error("Error creating mentor form:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get a single Mentor Form by its ID
export const getMentorFormByIdAndRoom = async (req, res) => {
    try {
        const { roomId, mentor } = req.query;

        let query = { roomId };
        // If mentor ID is provided, add it to the query
        if (mentor) {
            query.mentor = mentor;
        }

        // Find forms that match the query
        const forms = await MentorForm.find(query).sort({ createdAt: -1 });

        if (forms.length === 0) {
            return res.json([]);
        }

        // Return the form contents
        res.json(forms[0].contents);
    } catch (error) {
        console.error("Error fetching mentor forms:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update a Mentor Form by its ID
export const updateMentorForm = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedForm = await MentorForm.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedForm) {
            return res.status(404).json({ error: "Mentor form not found" });
        }
        res.status(200).json({
            message: "Mentor form updated successfully",
            updatedForm,
        });
    } catch (error) {
        console.error("Error updating mentor form:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Delete a Mentor Form by its ID
export const deleteMentorForm = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedForm = await MentorForm.findByIdAndDelete(id);
        if (!deletedForm) {
            return res.status(404).json({ error: "Mentor form not found" });
        }
        res.status(200).json({ message: "Mentor form deleted successfully" });
    } catch (error) {
        console.error("Error deleting mentor form:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};