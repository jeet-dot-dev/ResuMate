const axios = require("axios"); // For making HTTP requests
const path = require("path"); // For handling file paths
const fs = require("fs"); // For file system operations
const { audioDir } = require("../multer"); // Import audio directory path from multer config

// Define the HandleTTS function for Text-to-Speech conversion
const HandleTTS = async (req, res) => {
  try {
    // Extract text from request body (fallback to empty string if not provided)
    const text = req.body.text || "";

    // Make a POST request to the ElevenLabs TTS API
    const response = await axios.post(
      "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL",
      {
        // Limit text to 5000 characters to prevent exceeding token limits
        text: text.substring(0, 5000),
        model_id: "eleven_monolingual_v1", // Model used for speech synthesis

        // Voice settings to control output characteristics
        voice_settings: {
          stability: 0.5, // Controls how stable the voice sounds (higher = more stable)
          similarity_boost: 0.5, // Controls how closely the voice resembles training data
        },
      },
      {
        // Set the request headers
        headers: {
          "Content-Type": "application/json", // Tell server to expect JSON data
          "xi-api-key": process.env.ELEVENLABS_API_KEY, // API key for authentication
        },

        // Set response type to 'arraybuffer' to receive binary data (audio)
        responseType: "arraybuffer",
      }
    );

    // Create a unique file name using the current timestamp
    const fileName = `tts-${Date.now()}.mp3`;
    // Create the full file path
    const filePath = path.join(audioDir, fileName);

    // Write the binary audio data into the file
    fs.writeFileSync(filePath, response.data);

    // Log the generated file URL for debugging
    console.log(`/audio/${fileName}`);

    // Send the audio file URL as a response to the client
    res.json({
      audioUrl: `/audio/${fileName}`,
    });
  } catch (err) {
    // Handle errors that occur during the process
    console.log("TTS error: ", err.message); // Log error to console

    // Send a 500 status and error message to the client
    res.status(500).json({
      error: "Speech generation failed",
    });
  }
};

// Export the function for use in other files
module.exports = HandleTTS;
