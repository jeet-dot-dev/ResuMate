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
import { Mic, X, LogOut, StopCircle, Pause, Play } from "lucide-react";
import { Avatar } from "@/Components/ui/avatar";
import { Badge } from "@/Components/ui/badge";

const InterviewSimulator = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const { resume, setResume, job, setJob, url } = useContext(StoreContext);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userAudioUrl, setUserAudioUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState(""); // Added missing state
  const [error, setError] = useState(null); // Added missing state
  const [history, sethistory] = useState([
    {
      role: "interviewer",
      content:
        "Welcome to your interview. I'll be asking you a series of questions to assess your qualifications. Are you ready to begin?",
    },
  ]);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const audioRef = useRef(null);
  const userAudioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const questions = [
    "Can you tell me about your relevant experience in this field?",
    "What would you say are your greatest strengths?",
    "How do you handle difficult situations or conflicts at work?",
    "Why are you interested in this position?",
    "Where do you see yourself in 5 years?",
  ];

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
      setIsProcessing(true); // Set processing state when recording stops
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

          // Check if there's text in the response - don't check for success flag
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
        userResponse: text, // Include the latest response explicitly
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
  // Function to get the next interview question
  const getNextQuestion = async () => {
    if (currentQuestion < questions.length) {
      try {
        setIsProcessing(true);

        // Send the current conversation history to the backend
        const res = await axios.post(`${url}/interview`, {
          resume: resume,
          jobDescription: job,
          history: history, // Changed from previousResponses to history
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
    }
  };

  // Function to convert text to speech
  const textToSpeech = async (text) => {
    try {
      // Ensure we're using the URL from context for consistency
      const response = await axios.post(
        `${url}/tts`,
        { text },
        { headers: { "Content-Type": "application/json" } }
      );

      const audioUrlPath = response.data.audioUrl;
      // Make sure we're constructing the URL correctly
      // const fullAudioUrl = audioUrlPath.startsWith('http')
      //   ? audioUrlPath
      //   : `${url}${audioUrlPath}`;
      console.log(audioUrlPath);
      setAudioUrl(`http://localhost:5000${audioUrlPath}`);

      // setAudioUrl(fullAudioUrl);
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

  // Start the interview
  const startInterview = async () => {
    if (history.length === 1) {
      await getNextQuestion();
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
      // You could add a toast or notification here
      console.error("Error:", error);

      // Clear error after showing it
      setTimeout(() => {
        setError(null);
      }, 5000);
    }
  }, [error]);

  return (
    <div className="flex flex-col md:flex-row gap-6 h-screen bg-slate-900 p-6 text-white">
      {/* Left side - transcript content */}
      <div className="w-full md:w-2/3 h-full flex flex-col">
        <Card className="flex-grow bg-slate-800 border-slate-700 text-white">
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
              <Button
                onClick={() => navigate("/")}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <LogOut className="mr-2 h-4 w-4" /> End Interview
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 overflow-y-auto h-full max-h-[calc(100vh-12rem)]">
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

                    {/* Audio player for interviewer history */}
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

            {/* Error message display */}
            {error && (
              <div className="mt-4 text-center">
                <Badge className="bg-red-600">{error}</Badge>
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
      <div className="w-full md:w-1/3 h-full">
        <Card className="h-full bg-slate-800 border-slate-700 text-white">
          <CardHeader className="border-b border-slate-700">
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
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center justify-center h-[calc(100%-8rem)]">
            <div className="flex flex-col items-center space-y-8">
              <div
                className={`p-12 rounded-full ${
                  isRecording
                    ? "bg-rose-500 pulse-animation"
                    : isProcessing
                    ? "bg-amber-500 processing-animation"
                    : "bg-slate-700"
                } transition-all duration-300`}
              >
                {isRecording ? (
                  <StopCircle size={64} className="text-white" />
                ) : (
                  <Mic size={64} className="text-white" />
                )}
              </div>
              <Badge className="text-lg py-2 px-4 bg-slate-700">
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
                  className="w-64 h-14 text-lg bg-sky-600 hover:bg-sky-700 text-white rounded-full"
                >
                  Start Interview
                </Button>
              ) : isRecording ? (
                <Button
                  onClick={stopRecording}
                  className="w-64 h-14 text-lg bg-rose-600 hover:bg-rose-700 text-white rounded-full"
                >
                  <StopCircle className="mr-2" /> Stop Recording
                </Button>
              ) : (
                <Button
                  onClick={startRecording}
                  disabled={
                    isProcessing ||
                    isPlaying ||
                    currentQuestion >= questions.length + 1 // +1 accounts for welcome message
                  }
                  className="w-64 h-14 text-lg bg-sky-600 hover:bg-sky-700 text-white rounded-full"
                >
                  <Mic className="mr-2" /> Record Answer
                </Button>
              )}

              <p className="text-slate-400 text-center mt-4">
                {isRecording
                  ? "Click Stop when you've finished your answer"
                  : isProcessing
                  ? "Processing your response..."
                  : "Click to record your answer to the question"}
              </p>
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-700 p-4">
            <div className="w-full">
              <p className="text-sm text-slate-400 text-center">
                Interview Progress
              </p>
              <div className="mt-2 bg-slate-700 h-2 rounded-full w-full">
                <div
                  className="bg-sky-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (currentQuestion / questions.length) * 100
                    )}%`,
                  }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-400">
                <span>Start</span>
                <span>{`Question ${currentQuestion}/${questions.length}`}</span>
                <span>Complete</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

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

        /* Animation for processing state */
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
      `}</style>
    </div>
  );
};

export default InterviewSimulator;
