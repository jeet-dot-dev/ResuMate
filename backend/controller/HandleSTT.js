const path = require("path");
const { audioDir } = require("../multer");
const fs = require("fs");
const FormData = require("form-data"); // Import form-data explicitly
const axios = require("axios");

const HanleSTT = async (req, res) => {
  try {
    const { audioData } = req.body;
    const audioBuffer = Buffer.from(audioData.split(",")[1], "base64");

    const tempFileName = `stt-${Date.now()}.mp3`;
    const tempFilePath = path.join(audioDir, tempFileName);
    fs.writeFileSync(tempFilePath, audioBuffer);

    // Use FormData from 'form-data' package
    const formData = new FormData();
    formData.append("file", fs.createReadStream(tempFilePath));
    formData.append("model_id", "scribe_v1");

    const headers = { 
      ...formData.getHeaders(), // This will now work correctly
      "xi-api-key": process.env.ELEVENLABS_API_KEY,
    };

    const sttResponse = await axios.post(
      "https://api.elevenlabs.io/v1/speech-to-text",
      formData,
      { headers }
    );

    fs.unlinkSync(tempFilePath);
    res.json({
      text: sttResponse.data.text
    });

  } catch (err) {
    res.status(500).json({
      error: "Speech recognition failed: " + err.message
    });
  }
};

module.exports = HanleSTT;
