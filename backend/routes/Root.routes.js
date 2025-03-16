const express = require("express");
const router = express.Router()
const upload = require("../utils/multer");
const HandleUploadResume = require("../controller/HandleUploadRusume");


router.post('/uplaod-resume', upload.single('resume'), HandleUploadResume)


module.exports = router;