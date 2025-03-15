import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, ExternalLink } from "lucide-react";

const Ats = () => {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 mt-10">
      <h1 className="text-4xl font-bold text-center mb-8 text-slate-800">ATS Score Analysis</h1>
      
      <Card className="w-full">
        <div className="flex">
          {/* Left side - Score */}
          <div className="w-1/3 p-8 flex flex-col items-center justify-center border-r border-gray-200">
            <h2 className="text-xl font-semibold mb-2">ATS Score</h2>
            <div className="text-6xl font-bold text-orange-500 mb-2">78%</div>
            <div className="text-lg text-orange-500">Good</div>
            <Progress value={78} className="w-full h-2 mt-4 bg-gray-200" />
          </div>
          
          {/* Right side - Feedback */}
          <div className="w-2/3 p-8">
            <h2 className="text-xl font-semibold mb-6">ATS Feedback</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={20} />
                <span>Good use of relevant keywords for the industry</span>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={20} />
                <span>Clear work experience section with quantifiable achievements</span>
              </div>
              
              <div className="flex items-start gap-3">
                <XCircle className="text-red-500 mt-1 flex-shrink-0" size={20} />
                <span>Missing some technical skills that match the job description</span>
              </div>
              
              <div className="flex items-start gap-3">
                <AlertCircle className="text-orange-500 mt-1 flex-shrink-0" size={20} />
                <span>Consider adding more specific project outcomes</span>
              </div>
              
              <div className="flex items-start gap-3">
                <XCircle className="text-red-500 mt-1 flex-shrink-0" size={20} />
                <span>Resume format may cause parsing issues with some ATS systems</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom info box */}
        <CardContent className="bg-blue-50 p-4 m-4 rounded-md">
          <div className="flex justify-between items-start">
            <div className="pr-4">
              <h3 className="font-semibold text-blue-700 mb-2">What is an ATS Score?</h3>
              <p className="text-blue-700">
                An Applicant Tracking System (ATS) score indicates how well your resume will perform when processed by automated resume screening software used by employers. A higher score means your resume is more likely to pass through these systems and reach human recruiters.
              </p>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              onClick={() => window.open("https://www.jobscan.co/blog/ats-resume/", "_blank")}
            >
              Know More <ExternalLink size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Ats;