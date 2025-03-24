// Import necessary modules
const path = require("path"); // Handles and manipulates file paths
const { audioDir } = require("../multer"); // Imports audio directory path from multer.js
const fs = require("fs"); // File system module to read, write, and delete files
const FormData = require("form-data"); // FormData is used to send files and data as a form
const axios = require("axios"); // Axios is used to send HTTP requests to the API

// Main function to handle Speech-to-Text conversion
const HanleSTT = async (req, res) => {
  try {
    // 1️⃣ Extract audio data from the incoming request body //base64 format
    const { audioData } = req.body;

    /*
     * audioData is expected to be in Base64 format (a text-based encoding of binary data).
     * The Base64 string usually looks like this:
     * "data:audio/mp3;base64,<actual_base64_encoded_data>"
     *
     * We need to remove the prefix and only take the actual encoded data.
     * audioData.split(",")[1] → splits the string at the comma and takes the encoded part.
     * Buffer.from → converts the encoded string into a binary buffer.
     */
    const audioBuffer = Buffer.from(audioData.split(",")[1], "base64");

    // 2️⃣ Create a temporary file to store the audio data
    const tempFileName = `stt-${Date.now()}.mp3`; // Generate a unique filename using timestamp
    const tempFilePath = path.join(audioDir, tempFileName); // Combine the audio directory and filename

    /*
     * fs.writeFileSync → Writes the binary audio data to the file synchronously.
     * tempFilePath → Full path where the file will be saved.
     * audioBuffer → Binary data that represents the audio file.
     */
    fs.writeFileSync(tempFilePath, audioBuffer);

    // 3️⃣ Create form data to send the file to the Eleven Labs API
    const formData = new FormData();

    /*
     * formData.append → Appends key-value pairs to the form.
     * "file" → Key used by the API to identify the file.
     * fs.createReadStream → Creates a readable stream from the file to send it as binary data.
     */
    formData.append("file", fs.createReadStream(tempFilePath));

    /*
     * "model_id" → This is the specific transcription model used by Eleven Labs.
     * "scribe_v1" → Preset model ID that Eleven Labs recognizes for transcription.
     */
    formData.append("model_id", "scribe_v1");

    // 4️⃣ Create headers for the HTTP request
    const headers = { 
      ...formData.getHeaders(), // formData.getHeaders() generates the correct "Content-Type" for multipart form data
      "xi-api-key": process.env.ELEVENLABS_API_KEY, // API key for authentication (stored in environment variables)
    };

    // 5️⃣ Send POST request to Eleven Labs API
    /*
     * axios.post → Sends a POST request.
     * URL → Eleven Labs API endpoint for speech-to-text.
     * formData → Data containing the file and model ID.
     * headers → Headers for authentication and content type.
     */
    const sttResponse = await axios.post(
      "https://api.elevenlabs.io/v1/speech-to-text",
      formData,
      { headers }
    );

    // 6️⃣ Clean up temporary file (to avoid clutter)
    /*
     * fs.unlinkSync → Deletes the temporary file synchronously.
     * tempFilePath → Path to the file being deleted.
     */
    fs.unlinkSync(tempFilePath);

    // 7️⃣ Send the transcribed text back to the frontend
    res.json({
      text: sttResponse.data.text // Return the transcribed text from the API response
    });

  } catch (err) {
    // 8️⃣ Handle errors
    /*
     * If anything goes wrong, this block will catch the error.
     * res.status(500) → Sends an HTTP 500 (Internal Server Error) status.
     * err.message → Includes the error message to help with debugging.
     */
    res.status(500).json({
      error: "Speech recognition failed: " + err.message
    });
  }
};

// Export the function so it can be used elsewhere
module.exports = HanleSTT;
