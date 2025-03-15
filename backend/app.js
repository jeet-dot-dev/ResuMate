const express = require("express");
const app = express();
const dotenv = require('dotenv')
const cors = require("cors")
dotenv.config()
// middleware
app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.send('Server Running')
})

app.listen(process.env.PORT || 3000);
