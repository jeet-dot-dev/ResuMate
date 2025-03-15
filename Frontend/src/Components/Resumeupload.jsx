import React, { useState } from "react";
import axios from "axios";
import { FaCloudUploadAlt } from "react-icons/fa";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Resumeupload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [value, setvalue] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLoading(true);
      setTimeout(() => {
        setSelectedFile(file);
        setLoading(false);
      }, 2000); // Simulating file processing delay
    }
  };

  const handleClick = async (endpoint) => {
    if (!selectedFile){
      alert('Please Upload your resume!');
      return;
    };

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await axios.post(`http://localhost:5000/${endpoint}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("File uploaded successfully:", res.data);
    } catch (error) {
      console.error("Error uploading file:", error);
      console.log(error);
    }
  };

 


  return (
    <div className="w-full flex flex-col items-center py-12 bg-gray-50 mt-28">
      <h2 className="text-4xl font-bold text-gray-800 mb-8">
        Upload Your Resume
      </h2>
      <div className="w-[900px] min-h-[400px] border-2 border-dashed border-gray-400 rounded-lg bg-white flex flex-col items-center justify-center p-6 shadow-lg">
        <FaCloudUploadAlt className="text-6xl text-blue-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Upload Your Resume
        </h3>
        <p className="text-gray-600 text-center mb-4 px-4">
          Drag and drop your PDF resume or click to browse files. We'll analyze
          it for ATS compatibility and prepare tailored interview questions.
        </p>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          id="file-upload"
          onChange={handleFileChange}
        />
        <label
          htmlFor="file-upload"
          className="flex items-center px-6 py-2 bg-black text-white rounded hover:bg-zinc-800 cursor-pointer transition"
        >
          Select PDF File
        </label>
        {loading && (
          <p className="mt-2 text-blue-500 animate-pulse">Uploading...</p>
        )}
        {selectedFile && (
          <p className="mt-2 text-gray-700">
            Selected File: {selectedFile.name}
          </p>
        )}
      </div>
      <div className="flex justify-center items-center gap-20">
        <Button
          className="text-lg px-8 py-6 mt-12 cursor-pointer"
          size="lg"
          onClick={()=>handleClick("uploads")}
        >
          Start Your Interview <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <Button
          className="text-lg px-8 py-6 mt-12 cursor-pointer"
          size="lg"
          onClick={()=>handleClick("ats")}
        >
          Know ATS Score <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default Resumeupload;
