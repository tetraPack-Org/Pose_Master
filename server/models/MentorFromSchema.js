import mongoose from "mongoose";

const mentorContentSchema = new mongoose.Schema(
    {
        image: { type: String }, // Typically, a URL or file path
        text: { type: String, required: true }
    },
    { _id: false } // No need for separate _id for each content field
);

const mentorFormSchema = new mongoose.Schema({
    roomId: { type: String, required: true },
    mentor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contents: [mentorContentSchema],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("MentorForm", mentorFormSchema);