import MentorForm from "../models/MentorFromSchema.js";

// Create a new Mentor Form
export const createMentorForm = async (req, res) => {
    try {
        // req.body now contains roomId, mentor, and the text fields for contents
        const { roomId, mentor } = req.body;
        let { contents } = req.body;

        // If contents is not sent as a JSON string, you may need to reconstruct it.
        // If you sent it as structured field keys (contents[0][text], etc.),
        // the body parser will not automatically group them into an array.
        // One workaround is to have the frontend send contents as JSON.
        if (typeof contents === 'string') {
            contents = JSON.parse(contents);
        }

        // Additionally, process req.files if any file was uploaded:
        // For example, if file.fieldname is like `contents[0][image]`
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                // Extract the index from file.fieldname (adjust regex as needed)
                const match = file.fieldname.match(/contents\[(\d+)\]\[image\]/);
                if (match) {
                    const index = parseInt(match[1], 10);
                    if (!contents[index]) {
                        contents[index] = { text: "" };
                    }
                    // Save the file path so that you can reference the uploaded file later
                    contents[index].image = file.path;
                }
            });
        }

        console.log("Mentor form data:", roomId, mentor, contents);
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
export const getMentorFormById = async (req, res) => {
    try {
        const { id } = req.params;
        const form = await MentorForm.findById(id);
        if (!form) {
            return res.status(404).json({ error: "Mentor form not found" });
        }
        res.status(200).json(form);
    } catch (error) {
        console.error("Error fetching mentor form:", error);
        res.status(500).json({ error: "Internal server error" });
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