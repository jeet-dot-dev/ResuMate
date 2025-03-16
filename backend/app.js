const express = require("express");
const app = express();
const dotenv = require('dotenv')
const cors = require("cors")
const RootRouter = require("./routes/Root.routes");
const path = require("path");
const {audioDir, uploadsDir } = require("./multer")
dotenv.config()

// middleware
app.use(cors());
app.use(express.json({limit: "50MB" }));
app.use("/audio", express.static(__dirname + audioDir))
app.use("/upload", express.static(__dirname + uploadsDir))

app.get('/',(req,res)=>{
    res.send('Server Running')
})

app.use('/api/resumate',RootRouter);

app.listen(process.env.PORT || 3000,()=>console.log(`Server Started at PORT: ${process.env.PORT}`));
