import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../Context/Context";
import axios from "axios";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import {
  Mic,
  X,
  LogOut,
  StopCircle,
  Pause,
  Play,
  Camera,
  Video,
} from "lucide-react";
import { 
  Collapsible, 
  CollapsibleTrigger, 
  CollapsibleContent 
} from "@/Components/ui/collapsible";
import { 
  AlertTriangle, 
  ChevronDown 
} from "lucide-react";
import { Avatar } from "@/Components/ui/avatar";
import { Badge } from "@/Components/ui/badge";
//import { Toast, ToastProvider, ToastViewport } from "@/Components/ui/toast";
import WebcamComponent from "../Components/WebcamComponent";
import ScreenRecorder from "../Components/ScreenRecorder";

const InterviewSimulator = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const { resume, job, url } = useContext(StoreContext);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userAudioUrl, setUserAudioUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [error, setError] = useState(null);
  const [history, sethistory] = useState([
    {
      role: "interviewer",
      content:
        "Welcome to your interview. I'll be asking you a series of questions to assess your qualifications. Are you ready to begin?",
    },
  ]);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // New states for camera and recording
  const [cameraActive, setCameraActive] = useState(false);
  const [videoRecording, setVideoRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [cheatingEvents, setCheatingEvents] = useState([]);
  const [showCheatingWarning, setShowCheatingWarning] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const audioRef = useRef(null);
  const userAudioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const screenRecorderRef = useRef(null);

  const questions = [
    "Can you tell me about your relevant experience in this field?",
    "What would you say are your greatest strengths?",
    "How do you handle difficult situations or conflicts at work?",
    "Why are you interested in this position?",
    "Where do you see yourself in 5 years?",
  ];

  // Initialize screen recorder
  useEffect(() => {
    screenRecorderRef.current = new ScreenRecorder();
  }, []);

  // Display notification
  const showToast = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Function to handle tab/visibility changes (cheating detection)
  const handleCheatingDetection = (type) => {
    if (videoRecording) {
      // Record the cheating event with timestamp
      const timestamp = new Date().getTime();
      screenRecorderRef.current.recordCheatingEvent(type, timestamp);

      // Update UI to show cheating warning
      setShowCheatingWarning(true);
      
      // Show notification for suspicious activity
      showToast("Suspicious activity detected! Interview may be cancelled.");
      
      setTimeout(() => setShowCheatingWarning(false), 3000);

      // Update cheating events list
      setCheatingEvents((prev) => [
        ...prev,
        {
          type,
          timestamp,
          formattedTime: new Date(timestamp).toLocaleTimeString(),
        },
      ]);
    }
  };

  // Function to start video recording
  const startVideoRecording = async () => {
    if (screenRecorderRef.current) {
      const success = await screenRecorderRef.current.startRecording();
      if (success) {
        setVideoRecording(true);
        setCameraActive(true);
      } else {
        setError("Failed to start video recording. Please check permissions.");
      }
    }
  };

  // Function to stop video recording
  const stopVideoRecording = async () => {
    if (screenRecorderRef.current && videoRecording) {
      try {
        const { videoUrl, cheatingEvents: events } =
          await screenRecorderRef.current.stopRecording();
        setRecordedVideoUrl(videoUrl);
        setCheatingEvents(events);
        setVideoRecording(false);
        setCameraActive(false);
      } catch (err) {
        console.error("Error stopping video recording:", err);
        setError("Failed to save recording.");
      }
    }
  };

  // Function to start recording user's audio
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = handleStopRecording;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Microphone access error:", error);
      setError("Microphone access denied. Please enable permissions.");
    }
  };

  // Function to stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  // Handle recorded audio - transcribe and submit response
  const handleStopRecording = async () => {
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp3" });
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64data = reader.result;

        try {
          const response = await fetch(`${url}/stt`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audioData: base64data }),
          });

          const data = await response.json();
          console.log("STT Response:", data);

          if (data.text && data.text.trim() !== "") {
            setTranscribedText(data.text);
            submitResponse(data.text);
          } else {
            throw new Error("No transcription text received");
          }
        } catch (error) {
          console.error("Transcription error:", error);
          setError("Failed to transcribe your answer. Please try again.");
          setIsProcessing(false);
        }
      };

      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("Recording processing error:", error);
      setError("Error processing your recording.");
      setIsProcessing(false);
    }
  };

  // Submit transcribed response and get next question
  const submitResponse = async (text) => {
    try {
      // Add user's response to history
      const updatedHistory = [
        ...history,
        {
          role: "candidate",
          content: text,
        },
      ];

      sethistory(updatedHistory);

      // Get the next question using the updated history
      const res = await axios.post(`${url}/interview`, {
        resume: resume,
        jobDescription: job,
        history: updatedHistory,
        userResponse: text,
        questionCount: currentQuestion,
      });

      const newQuestion = res.data.message || questions[currentQuestion];

      // Add the interviewer's response to history
      sethistory((prev) => [
        ...prev,
        {
          role: "interviewer",
          content: newQuestion,
        },
      ]);

      // Convert the question to speech
      await textToSpeech(newQuestion);
      setCurrentQuestion(currentQuestion + 1);
      setIsProcessing(false);
    } catch (error) {
      console.error("Error submitting response:", error);
      setError("Failed to process your response. Please try again.");
      setIsProcessing(false);
    }
  };

  // Start the interview
  const startInterview = async () => {
    if (history.length === 1) {
      // Start video recording when interview begins
      await startVideoRecording();
      await getNextQuestion();
    }
  };

  // End the interview
  const endInterview = async () => {
    // Stop video recording if active
    if (videoRecording) {
      await stopVideoRecording();
    }
    
    // Stop camera
    setCameraActive(false);
    
    // Navigate away from interview page
    showToast("Interview ended. Thank you for your participation.");
    setTimeout(() => navigate("/"), 1500); 
  };

  // Function to get the next interview question
  const getNextQuestion = async () => {
    if (currentQuestion < 13) {
      try {
        setIsProcessing(true);

        // Send the current conversation history to the backend
        const res = await axios.post(`${url}/interview`, {
          resume: resume,
          jobDescription: job,
          history: history,
        });

        const newQuestion = res.data.message || questions[currentQuestion];

        sethistory((prev) => [
          ...prev,
          {
            role: "interviewer",
            content: newQuestion,
          },
        ]);

        // Convert the question to speech
        await textToSpeech(newQuestion);
        setCurrentQuestion(currentQuestion + 1);
        setIsProcessing(false);
      } catch (error) {
        console.error("Error getting next question:", error);

        // Fallback to static questions in case of error
        sethistory((prev) => [
          ...prev,
          {
            role: "interviewer",
            content: questions[currentQuestion],
          },
        ]);

        await textToSpeech(questions[currentQuestion]);
        setCurrentQuestion(currentQuestion + 1);
        setIsProcessing(false);
      }
    } else {
      // End of interview
      const endMessage =
        "Thank you for your responses. That concludes our interview. We'll be in touch soon with next steps.";

      sethistory((prev) => [
        ...prev,
        {
          role: "interviewer",
          content: endMessage,
        },
      ]);

      await textToSpeech(endMessage);

      // Stop video recording at end of interview
      if (videoRecording) {
        await stopVideoRecording();
      }
    }
  };

  // Function to convert text to speech
  const textToSpeech = async (text) => {
    try {
      const response = await axios.post(
        `${url}/tts`,
        { text },
        { headers: { "Content-Type": "application/json" } }
      );

      const audioUrlPath = response.data.audioUrl;
      console.log(audioUrlPath);
      setAudioUrl(`http://localhost:5000${audioUrlPath}`);
    } catch (error) {
      console.error("TTS Error:", error);
      setError("Failed to generate speech for interviewer question.");
    }
  };

  // Handle audio player events
  const handleAudioPlay = () => {
    setIsPlaying(true);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Play or pause interviewer's audio
  const toggleAudioPlayback = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Play or pause user's audio
  const toggleUserAudioPlayback = () => {
    if (userAudioRef.current) {
      if (userAudioRef.current.paused) {
        userAudioRef.current.play();
      } else {
        userAudioRef.current.pause();
      }
    }
  };

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.error("Error playing audio:", err);
      });
    }
  }, [audioUrl]);

  // Show error message if there is one
  useEffect(() => {
    if (error) {
      console.error("Error:", error);
      showToast(error);
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  }, [error]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-screen bg-slate-900 p-6 text-white">
      {/* Left side - transcript and camera content */}
      <div className="w-full md:w-2/3 h-full flex flex-col space-y-4">
        {/* Fixed webcam container with absolute height */}
        <div className="relative bg-slate-800 rounded-lg border border-slate-700 overflow-hidden h-56">
          <WebcamComponent
            isRecording={videoRecording}
            onTabChange={(status) => handleCheatingDetection(`tab_${status}`)}
            onVisibilityChange={(status) =>
              handleCheatingDetection(`visibility_${status}`)
            }
          />

          {/* Recording indicator */}
          {videoRecording && (
            <div className="absolute bottom-2 left-2 flex items-center">
              <div className="h-3 w-3 rounded-full bg-red-500 mr-2 animate-pulse"></div>
              <span className="text-xs text-white font-medium">Recording</span>
            </div>
          )}
        </div>

        {/* Transcript card */}
        <Card className="flex-grow bg-slate-800 border-slate-700 text-white overflow-hidden">
          <CardHeader className="border-b border-slate-700">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-sky-400">
                  Interview Transcript
                </CardTitle>
                <CardDescription className="text-slate-400">
                  AI-Powered Interview Simulator
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={endInterview}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <LogOut className="mr-2 h-4 w-4" /> End Interview
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 overflow-y-auto h-[calc(100%-8rem)]">
            <div className="space-y-6">
              {history.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "interviewer"
                      ? "justify-start"
                      : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === "interviewer"
                        ? "bg-slate-700"
                        : "bg-sky-600"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Avatar
                        className={`h-8 w-8 ${
                          message.role === "interviewer"
                            ? "bg-amber-600"
                            : "bg-emerald-600"
                        }`}
                      >
                        {message.role === "interviewer" ? "I" : "C"}
                      </Avatar>
                      <Badge className="ml-2 bg-slate-600">
                        {message.role === "interviewer"
                          ? "Interviewer"
                          : "Candidate"}
                      </Badge>
                    </div>
                    <p>{message.content}</p>

                    {/* Audio player for interviewer */}
                    {message.role === "interviewer" &&
                      index === history.length - 1 &&
                      audioUrl && (
                        <div className="mt-3 flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-slate-600 hover:bg-slate-500"
                            onClick={toggleAudioPlayback}
                          >
                            {isPlaying ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <div className="text-xs text-slate-300">
                            {isPlaying ? "Playing audio..." : "Play question"}
                          </div>
                        </div>
                      )}

                    {/* Audio player for candidate history */}
                    {message.role === "candidate" &&
                      index === history.length - 1 &&
                      userAudioUrl && (
                        <div className="mt-3 flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-slate-600 hover:bg-slate-500"
                            onClick={toggleUserAudioPlayback}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <div className="text-xs text-slate-300">
                            Play your response
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>

            {/* Hidden audio elements */}
            <audio
              ref={audioRef}
              src={audioUrl}
              onPlay={handleAudioPlay}
              onEnded={handleAudioEnded}
              className="hidden"
            />
            <audio ref={userAudioRef} src={userAudioUrl} className="hidden" />

            {/* Audio playback indicator */}
            {isPlaying && (
              <div className="mt-4 text-center">
                <Badge className="bg-sky-600 animate-pulse">
                  Playing audio...
                </Badge>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t border-slate-700 p-4">
            <p className="text-xs text-slate-400">
              Speak clearly and concisely. Your responses are being recorded and
              analyzed.
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Right side - controls */}
      <div className="w-full md:w-1/3 h-full flex flex-col gap-4">
        {/* Controls card */}
        <Card className="flex-grow bg-slate-800 border-slate-700 text-white flex flex-col">
          <CardHeader className="border-b border-slate-700 pb-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-sky-400">
                  Interview Controls
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {isRecording
                    ? "Recording in progress..."
                    : isProcessing
                    ? "Processing your response..."
                    : "Press to start recording your answer"}
                </CardDescription>
              </div>
              {videoRecording && (
                <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6 flex flex-col items-center justify-center flex-grow">
            <div className="flex flex-col items-center space-y-8 w-full max-w-sm mx-auto">
              <div
                className={`p-12 rounded-full ${
                  isRecording
                    ? "bg-rose-500 pulse-animation"
                    : isProcessing
                    ? "bg-amber-500 processing-animation"
                    : "bg-slate-700"
                } transition-all duration-300 shadow-lg`}
              >
                {isRecording ? (
                  <StopCircle size={64} className="text-white" />
                ) : (
                  <Mic size={64} className="text-white" />
                )}
              </div>

              <Badge className="text-lg py-2 px-4 bg-slate-700/80 backdrop-blur-sm">
                {isRecording
                  ? "Recording..."
                  : isProcessing
                  ? "Processing..."
                  : "Ready"}
              </Badge>

              {history.length === 1 ? (
                <Button
                  onClick={startInterview}
                  disabled={isRecording || isProcessing || isPlaying}
                  className="w-64 h-14 text-lg bg-sky-600 hover:bg-sky-700 text-white rounded-full shadow-md transition-all duration-200 hover:scale-105"
                >
                  <Play className="mr-2 h-5 w-5" /> Start Interview
                </Button>
              ) : isRecording ? (
                <Button
                  onClick={stopRecording}
                  className="w-64 h-14 text-lg bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition-all duration-200 hover:scale-105"
                >
                  <StopCircle className="mr-2 h-5 w-5" /> Stop Recording
                </Button>
              ) : (
                <Button
                  onClick={startRecording}
                  disabled={
                    isProcessing ||
                    isPlaying ||
                    currentQuestion >= questions.length + 1
                  }
                  className="w-64 h-14 text-lg bg-sky-600 hover:bg-sky-700 text-white rounded-full shadow-md transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                  <Mic className="mr-2 h-5 w-5" /> Record Answer
                </Button>
              )}

              <div className="w-full px-6 py-3 bg-slate-700/30 rounded-lg text-center">
                <p className="text-slate-300 text-sm">
                  {isRecording
                    ? "Click Stop when you've finished your answer"
                    : isProcessing
                    ? "Processing your response..."
                    : "Click to record your answer to the question"}
                </p>
              </div>
            </div>
          </CardContent>

          {/* Suspicious Activity Log - Improved with fixed height */}
          {cheatingEvents.length > 0 && (
            <div className="mt-auto border-t border-slate-700">
              <Collapsible className="w-full">
                <CollapsibleTrigger className="flex justify-between items-center w-full p-4 text-left hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
                    <h3 className="text-red-400 font-medium">
                      Suspicious Activity
                    </h3>
                    <Badge
                      variant="outline"
                      className="ml-3 bg-red-900/30 text-red-300 border-red-700"
                    >
                      {cheatingEvents.length}
                    </Badge>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 ui-open:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4">
                    <div className="w-full max-h-32 overflow-y-auto bg-slate-900 rounded-md p-3 border border-slate-700">
                      {cheatingEvents.length > 0 ? (
                        <ul className="list-disc pl-5 space-y-1">
                          {cheatingEvents.map((event, idx) => (
                            <li key={idx} className="text-sm text-slate-300">
                              <span className="text-slate-500">
                                {event.formattedTime}:
                              </span>{" "}
                              {event.type.includes("tab") ? (
                                <span className="text-amber-400">
                                  Tab switched
                                </span>
                              ) : (
                                <span className="text-red-400">
                                  Window hidden
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-400 text-center py-2">No suspicious activity detected</p>
                      )}
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          )}
        </Card>
      </div>

      {/* Toast notification for suspicious activity */}
      {showNotification && (
        <div className="fixed top-4 right-4 bg-red-600 text-white py-2 px-4 rounded-md shadow-lg flex items-center space-x-2 z-50 animate-fade-in">
          <AlertTriangle className="h-5 w-5" />
          <p>{notificationMessage}</p>
          <button 
            onClick={() => setShowNotification(false)}
            className="ml-2 text-white hover:text-red-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.7);
          }
          70% {
            box-shadow: 0 0 0 20px rgba(244, 63, 94, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(244, 63, 94, 0);
          }
        }
        .pulse-animation {
          animation: pulse 2s infinite;
        }

        @keyframes processing-pulse {
          0% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.6;
          }
        }

        .processing-animation {
          animation: processing-pulse 1.5s infinite;
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease forwards;
        }
      `}</style>
    </div>
  );
};

export default InterviewSimulator;