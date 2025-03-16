const path = require("path")
const pdf = require("pdf-parse")
const fs = require("fs");
const mammoth = require("mammoth")
const formdata = require("form-data")
const HandleUploadResume = async(req,res)=>{
    try{
        if(!req.file){
            return res.status(400).json({
                error: "no file uploaded"
            });
        }

        
        const filePath = req.file.path; // extract file path 
        const fileExt = path.extname(req.file.originalname).toLowerCase() // extract file extention name ex : pdf,docx 
        let resumeText = ''

        try{
            // extractin data from pdf using pdf parse

            if(fileExt === '.pdf'){
                const dataBuffer = fs.readFileSync(filePath) 
                const pdfData = await pdf(dataBuffer) 
                resumeText = pdfData.text
            }

            // extracting data from docx using mammoth
            else if(fileExt === '.docx'){
                const result = await mammoth.extractRawText({path:filePath})
                resumeText = result.value
            }
            
            // extracting data from plain txt file using fs
            else if(fileExt ==='.txt'){
                resumeText = fs.readFileSync(filePath, "utf8")
            }

            else{
                resumeText = "unUnsupported file format"
            }
        }catch(err){
            return  res.status(500).json({
                Error: `Text extraction failed ${err.message}`
            })
        }

        // Deleting temp files 
        fs.unlinkSync(filePath);
        res.json({
            resumeText: resumeText.substring(0,10000) // adding substring to avoid llm token limits

        })
    }catch(err){
        console.error("Resume processing error", err);
        res.status(500).json({
            error: err.message
        })
    }
}


module.exports = HandleUploadResume;