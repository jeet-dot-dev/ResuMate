import React, { useContext, useState } from "react";
import axios from "axios";
import { FaCloudUploadAlt } from "react-icons/fa";
import { ArrowRight } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { StoreContext } from "../Context/Context";
import { useNavigate } from "react-router-dom";

const Resumeupload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const [jobDescription, setJobDescription] = useState("");
  const [showJobDescription, setShowJobDescription] = useState(false);
  const { resume, setResume, job, setJob } = useContext(StoreContext);
  const navigate = useNavigate();
  const handleFileChange = (event) => {
    const resume = event.target.files[0];
    if (resume) {
      setLoading(true);
      setTimeout(() => {
        setSelectedFile(resume);
        setLoading(false);
        setShowJobDescription(true);
      }, 2000); // Simulating file processing delay
    }
  };

  const handleClick = async () => {
    if (!selectedFile) {
      alert("Please Upload your resume!");
      return;
    }

    if (!jobDescription) {
      alert("Please enter the job description!");
      return;
    }

    const formData = new FormData();
    formData.append("resume", selectedFile);
    formData.append("jobDescription", jobDescription);

    const url = import.meta.env.VITE_API_URL;

    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    try {
      const res = await axios.post(`${url}/uplaod-resume`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("File uploaded successfully:", res?.data?.resumeText);
      if (res?.data?.resumeText) {
        setResume(res?.data?.resumeText);
        setJob(jobDescription);
      }
      navigate("/interview");
    } catch (error) {
      console.error("Error uploading file:", error);
      console.log(error);
    }
  };

  const Cancel = () => {
    setShowJobDescription(false);
    setSelectedFile(null);
    setJobDescription("");

    // Clear file input
    const fileInput = document.getElementById("file-upload");
    if (fileInput) fileInput.value = "";
  };

  return (
    <div
      className="w-full flex flex-col items-center py-12 bg-gray-50 mt-28"
      id="Resume-Upload"
    >
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
      {/* Job Description Input */}
      {showJobDescription && (
        <div className="mt-6 w-[900px]">
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Enter Job Description:
          </label>
          <textarea
            className="w-full min-h-[150px] p-4 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            placeholder="Describe the job role and responsibilities..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>
      )}
      <div className="flex justify-center items-center gap-20">
        <Button
          className="text-lg px-8 py-6 mt-12 cursor-pointer"
          size="lg"
          onClick={() => handleClick()}
        >
          Start Your Interview <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        {showJobDescription && (
          <Button
            className="text-lg px-8 py-6 mt-12 cursor-pointer bg-red-700"
            size="lg"
            onClick={() => Cancel()}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};

export default Resumeupload;
