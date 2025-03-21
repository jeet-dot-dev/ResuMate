import React, { useContext, useState } from "react";
import axios from "axios";
import { FaCloudUploadAlt } from "react-icons/fa";
import { ArrowRight, Upload, X, FileText, Briefcase } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { StoreContext } from "../Context/Context";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
//import { Boxes } from "@/Components/ui/boxes";

const Resumeupload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [showJobDescription, setShowJobDescription] = useState(false);
  const [preferredJob, setPreferredJob] = useState("");
  const { resume, setResume, job, setJob } = useContext(StoreContext);
  const navigate = useNavigate();

  const jobOptions = [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "UX/UI Designer",
    "Product Manager",
    "Data Scientist",
    "DevOps Engineer",
    "Marketing Specialist",
    "Sales Representative",
  ];

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

    if (!preferredJob) {
      alert("Please select your preferred job role!");
      return;
    }

    const formData = new FormData();
    formData.append("resume", selectedFile);
    formData.append("jobDescription", jobDescription);
    formData.append("preferredJob", preferredJob);

    const url = import.meta.env.VITE_API_URL;

    try {
      const res = await axios.post(`${url}/upload-resume`, formData, {
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
    }
  };

  const Cancel = () => {
    setShowJobDescription(false);
    setSelectedFile(null);
    setJobDescription("");
    setPreferredJob("");

    // Clear file input
    const fileInput = document.getElementById("file-upload");
    if (fileInput) fileInput.value = "";
  };

  return (
    <div className="relative w-full flex flex-col items-center py-16  bg-black text-white overflow-hidden" id="Resume-Upload">
      {/* Boxes Background */}

      
      <div className="relative z-10 max-w-4xl w-full px-4">
        <h2 className="text-4xl font-bold text-white mb-4 text-center">
          Upload Your Resume
        </h2>
        <p className="text-gray-300 text-center mb-12 max-w-2xl mx-auto">
          Get personalized interview preparation based on your resume and job preferences.
          We'll analyze your qualifications and prepare targeted questions.
        </p>

        {/* Step 1: Upload Resume */}
        <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden mb-8 border border-purple-500/30">
          <div className="bg-purple-900/40 px-6 py-4 border-b border-purple-500/30">
            <div className="flex items-center">
              <div className="bg-purple-500/20 rounded-full p-2 mr-3">
                <FileText className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Step 1: Upload Your Resume</h3>
            </div>
          </div>
          
          <div className={`p-6 ${!selectedFile ? 'border-2 border-dashed border-gray-600 rounded-lg m-6' : 'm-6'}`}>
            {!selectedFile ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Upload className="h-12 w-12 text-purple-500 mb-4" />
                <h3 className="text-xl font-medium text-gray-200 mb-2">
                  Drag & Drop or Browse
                </h3>
                <p className="text-gray-400 text-center mb-6 max-w-md">
                  Upload your resume in PDF, DOC or DOCX format. We'll analyze it
                  for ATS compatibility.
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
                  className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer transition shadow-md"
                >
                  <FaCloudUploadAlt className="mr-2" /> Select File
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-purple-900/30 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-purple-500/20 p-3 rounded-lg mr-4">
                    <FileText className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-200">{selectedFile.name}</p>
                    <p className="text-sm text-gray-400">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={Cancel}
                  className="text-gray-400 hover:text-red-400 p-2"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            {loading && (
              <div className="mt-4 flex justify-center">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  <span className="text-purple-400 ml-2">Processing your resume...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Select Job Preference */}
        <div className={`bg-gray-900/70 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden mb-8 border border-purple-500/30 ${!showJobDescription && 'opacity-50'}`}>
          <div className="bg-purple-900/40 px-6 py-4 border-b border-purple-500/30">
            <div className="flex items-center">
              <div className="bg-purple-500/20 rounded-full p-2 mr-3">
                <Briefcase className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Step 2: Select Job Preference</h3>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Preferred Job Role:
              </label>
              <Select
                disabled={!showJobDescription}
                value={preferredJob}
                onValueChange={setPreferredJob}
              >
                <SelectTrigger className="w-full border border-gray-600 bg-gray-800/70 text-gray-200 rounded-lg p-3 shadow-sm">
                  <SelectValue placeholder="Select your preferred job role" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border border-gray-700 text-gray-200">
                  {jobOptions.map((job) => (
                    <SelectItem key={job} value={job}>
                      {job}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Job Description:
              </label>
              <textarea
                className="w-full min-h-[150px] p-4 border border-gray-600 bg-gray-800/70 text-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                placeholder="Paste the job description here or describe the role you're applying for..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={!showJobDescription}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Button
            className="w-full sm:w-auto text-lg px-8 py-6 bg-purple-600 hover:bg-purple-700"
            size="lg"
            onClick={() => handleClick()}
            disabled={!showJobDescription}
          >
            Start Your Interview <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          {showJobDescription && (
            <Button
              className="w-full sm:w-auto text-lg px-8 py-6 bg-red-600 hover:bg-red-700"
              size="lg"
              onClick={() => Cancel()}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Resumeupload;