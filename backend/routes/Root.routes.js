const express = require("express");
const router = express.Router()
const {upload} = require("../multer");
const HandleUploadResume = require("../controller/HandleUploadRusume");
const HandleTTS = require("../controller/HandleTTS");
const HandleGenQuestion = require("../controller/HandleGenQuestion");
const HanleSTT = require("../controller/HandleSTT");


router.post('/upload-resume', upload.single('resume'), HandleUploadResume) //upload resume route
router.post('/interview',HandleGenQuestion) //genarate new question route
router.post('/tts', HandleTTS);  //Text to speech 
router.post('/stt', HanleSTT) //Speech to text
module.exports = router;