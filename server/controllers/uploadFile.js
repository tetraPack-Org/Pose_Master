const { uploadFileToCloudinary } = require("../utils/fileUploader");

exports.uploadFile = async (req, res) => {
    try {
        const imageFile = req.files.file;
        if (!imageFile) {
            console.log("No image File")
        }
        console.log("Image File", imageFile);
        const uploadResponse = await uploadFileToCloudinary(imageFile, process.env.FOLDER_NAME);
        console.log(uploadResponse);

        return res.json({
            success: true,
            message: "Upload Successful"
        })
    } catch (err) {
        console.log(err);
        return res.json({
            success: false,
            message: "File upload failed"
        })
    }
}