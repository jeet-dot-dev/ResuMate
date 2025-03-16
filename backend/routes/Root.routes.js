const express = require("express");
const router = express.Router()
const {upload} = require("../multer");
const HandleUploadResume = require("../controller/HandleUploadRusume");
const HandleTTS = require("../controller/HandleTTS");
const HandleGenQuestion = require("../controller/HandleGenQuestion");
const HanleSTT = require("../controller/HandleSTT");


router.post('/uplaod-resume', upload.single('resume'), HandleUploadResume)
router.post('/interview',HandleGenQuestion)
router.post('/tts', HandleTTS);
router.post('/stt', HanleSTT)
module.exports = router;