const express = require("express");
const router = express.Router()
const {upload} = require("../multer");
const HandleUploadResume = require("../controller/HandleUploadRusume");
const HandleTTS = require("../controller/HandleTTS");


router.post('/uplaod-resume', upload.single('resume'), HandleUploadResume)
router.post('/tts', HandleTTS);


module.exports = router;