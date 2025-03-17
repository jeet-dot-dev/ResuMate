import React from "react";
import { Card, CardContent } from "@/Components/ui/card";

const HowToUseSection = () => {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-6" id="How-to-Use">
      <h2 className="text-4xl font-bold text-center mb-2 text-slate-800">
        How to Use
      </h2>
      <p className="text-lg text-slate-600 text-center mb-8">
        Follow these simple steps to enhance your interview preparation
      </p>

      <Card className="w-full bg-white shadow-md overflow-hidden">
        <div className="p-6">
          {/* Video Section */}
          <div className="aspect-w-16 aspect-h-9 bg-slate-100 rounded-lg mb-8">
            {/* Placeholder for video - replace with actual video component */}
            <div className="w-full h-96 bg-slate-200 rounded-lg border border-slate-300 overflow-hidden">
              <iframe
                className="w-full h-full"
                src="https://youtu.be/kHv1ivsFacc?si=RzQUHgOhSMtjPSyQ"
                title="Tutorial Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload Your Resume</h3>
              <p className="text-slate-600">
                Upload your resume to get detailed ATS analysis and feedback
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Start Interview</h3>
              <p className="text-slate-600">
                Begin your AI-powered interview with voice interaction
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Get Feedback</h3>
              <p className="text-slate-600">
                Receive detailed performance insights and improvement tips
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HowToUseSection;
