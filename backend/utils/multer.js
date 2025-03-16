const fs = require('fs');
const multer = require('multer');
const path = require("path")

// configure directories
const audioDir = path.join(__dirname, "audio")
const uploadDir = path.join(__dirname, "upload")

if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// File upload configuration 

const storage =multer.diskStorage({
    destination: uploadDir,
    filename: (req,file,cb) =>{
        cb(null, Date.now()+ '-' + file.originalname)
    },
})

const upload = multer({
    storage: storage,
    fileFilter: (req,file,cb)=>{
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
        ];
        allowedTypes.includes(file.mimetype) ? cb(null,true) : cb(new Error("Invalid file type only pdf/doc/docx/txt allowed"))
    }
})

module.exports = upload