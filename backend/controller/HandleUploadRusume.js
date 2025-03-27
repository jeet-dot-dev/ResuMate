const path = require("path") // Module to handle and transform file paths
const pdf = require("pdf-parse") // Library to parse PDF files
const fs = require("fs") // File system module to read/write files
const mammoth = require("mammoth") // Library to extract text from DOCX files
//const formdata = require("form-data") // Library to create form-data objects for HTTP requests

// Define an async function to handle resume uploads
const HandleUploadResume = async (req, res) => {
    try {
        // Check if a file was uploaded
        if (!req.file) {
            return res.status(400).json({
                error: "No file uploaded"
            });
        }

        // Extract the file path and extension from the uploaded file
        const filePath = req.file.path; // Path where the file is temporarily stored
        const fileExt = path.extname(req.file.originalname).toLowerCase(); // Get the file extension and convert to lowercase
        let resumeText = '' // Variable to store extracted text

        try {
            // Extract text from PDF using `pdf-parse`
            if (fileExt === '.pdf') {
                const dataBuffer = fs.readFileSync(filePath) // Read file as buffer
                const pdfData = await pdf(dataBuffer) // Parse PDF data
                resumeText = pdfData.text // Store extracted text
            }

            // Extract text from DOCX using `mammoth`
            else if (fileExt === '.docx') {
                const result = await mammoth.extractRawText({ path: filePath }) // Extract raw text
                resumeText = result.value // Store extracted text
            }

            // Extract text from plain text files using `fs`
            else if (fileExt === '.txt') {
                resumeText = fs.readFileSync(filePath, "utf8") // Read file as UTF-8 string
            }

            // Unsupported file format case
            else {
                resumeText = "Unsupported file format"
            }
        } catch (err) {
            // Handle errors during text extraction
            return res.status(500).json({
                Error: `Text extraction failed: ${err.message}`
            });
        }

        // Delete the temporary file after extraction
        fs.unlinkSync(filePath);

        // Send the extracted text back in the response (limited to 10000 characters to avoid token limits)
        res.json({
            resumeText: resumeText.substring(0, 10000)
        });

    } catch (err) {
        // Handle any unexpected errors
        console.error("Resume processing error", err);
        res.status(500).json({
            error: err.message
        });
    }
}

// Export the function to be used in other parts of the application
module.exports = HandleUploadResume;
