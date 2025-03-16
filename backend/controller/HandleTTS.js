// const axios = require("axios");
// const path = require("path")
// const fs = require("fs")
// const {audioDir} = require("../multer")
// const HandleTTS = async(req,res)=>{
//     try{
//         const text = req.body.text || ""
//         const response = await axios.post("https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL",{
//             text : text.substring(0, 5000), // adding substring to avoid token limit
//             model_id : "eleven_monolingual_v1",
//             voice_settings: {
//                 stability : 0.5,
//                 similarity_boost: 0.5
//             },
//         },{
//             headers:{
//                 "Content-Type" : "application/json",
//                 "xi-api-key" : process.env.ELEVENLABS_API_KEY,
//             },

//             responseType: "arraybuffer"
//         });

//         const fileName = `tts-${Date.now()}.mp3`;
//         const filePath = path.join(audioDir, fileName);
//         fs.writeFileSync(filePath, response.data)

//         res.json({
//             audioUrl: `/audio/${fileName}`
//         })
//     }catch(err){
//         console.log("TTS error: ", err.message);
//         res.status(500).json({
//             error: "Speech generation failed"
//         });
//     }
// }

// module.exports = HandleTTS

const axios = require("axios");
const path = require("path");
const fs = require("fs");
const { audioDir } = require("../multer");

const HandleTTS = async (req, res, next) => {
    try {
        // Use generated text from the previous middleware (HandleGenQuestion)
        const text = req.generatedText || req.body.text || "";
        console.log(text);
        console.log("hello",req.generatedText);
        if (!text) {
            return res.status(400).json({ error: "No text provided for speech generation" });
        }

        const response = await axios.post(
            "https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL",
            {
                text: text.substring(0, 5000), // Avoid token limit
                model_id: "eleven_monolingual_v1",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                },
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "xi-api-key": process.env.ELEVENLABS_API_KEY,
                },
                responseType: "arraybuffer"
            }
        );

        const fileName = `tts-${Date.now()}.mp3`;
        const filePath = path.join(audioDir, fileName);
        fs.writeFileSync(filePath, response.data);

        res.json({
            audioUrl: `/audio/${fileName}`
        });
    } catch (err) {
        console.error("TTS error: ", err.message);
        res.status(500).json({
            error: "Speech generation failed"
        });
    }
};

module.exports = HandleTTS;
