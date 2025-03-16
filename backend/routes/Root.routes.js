const express = require("express");
const router = express.Router()
const {upload} = require("../multer");
const HandleUploadResume = require("../controller/HandleUploadRusume");
const HandleTTS = require("../controller/HandleTTS");
const HandleGenQuestion = require("../controller/HandleGenQuestion");


router.post('/uplaod-resume', upload.single('resume'), HandleUploadResume)
router.post('/tts', HandleTTS);
router.post('/interview',HandleGenQuestion)

module.exports = router;