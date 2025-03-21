import React from "react";

const HowToUseSection = () => {
  return (
    <div className="w-full py-16 px-6 bg-gradient-to-br from-black via-purple-950 to-black flex justify-center items-center flex-col" id="how-it-works">
      <h2 className="text-4xl font-bold text-center mb-3 text-white">
        How It Works
      </h2>
      <p className="text-lg text-gray-300 text-center mb-12 max-w-3xl mx-auto">
        Follow these simple steps to master your interview skills and say goodbye to interview anxiety
      </p>

      {/* Video Section */}
      <div className=" bg-gray-900 rounded-xl mb-16 w-4xl overflow-hidden ">
        <div className="aspect-w-16 aspect-h-9">
          <div className="w-full h-96 rounded-lg overflow-hidden">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/kHv1ivsFacc"
              title="Tutorial Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gray-900 rounded-xl p-6 border border-purple-600 transition-all hover:border-purple-400">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-xl font-bold mr-4">
              1
            </div>
            <h3 className="text-xl font-semibold text-white">Upload Your Resume</h3>
          </div>
          <p className="text-gray-300">
            Upload your resume in PDF, DOC, or DOCX format. We'll analyze your qualifications and prepare targeted interview questions.
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-purple-600 transition-all hover:border-purple-400">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-xl font-bold mr-4">
              2
            </div>
            <h3 className="text-xl font-semibold text-white">Practice Interview</h3>
          </div>
          <p className="text-gray-300">
            Begin your AI-powered interview session with personalized questions based on your resume and job preferences.
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-6 border border-purple-600 transition-all hover:border-purple-400">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-xl font-bold mr-4">
              3
            </div>
            <h3 className="text-xl font-semibold text-white">Get AI Feedback</h3>
          </div>
          <p className="text-gray-300">
            Receive detailed performance insights, improvement suggestions, and practice until you perfect your interview responses.
          </p>
        </div>
      </div>

      
    </div>
  );
};

export default HowToUseSection;