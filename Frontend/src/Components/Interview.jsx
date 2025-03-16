import React, { useContext, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, X, LogOut } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../Context/Context';
import axios from 'axios';

const InterviewSimulator = () => {
  //const router = useRouter();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
   const { resume, setResume, job, setJob,url } = useContext(StoreContext);

  const [messages, setMessages] = useState([
    { role: 'interviewer', content: 'Welcome to your interview. I\'ll be asking you a series of questions to assess your qualifications. Are you ready to begin?' }
  ]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  const questions = [
    'Can you tell me about your relevant experience in this field?',
    'What would you say are your greatest strengths?',
    'How do you handle difficult situations or conflicts at work?',
    'Why are you interested in this position?',
    'Where do you see yourself in 5 years?'
  ];
  
  const handlePushToTalk = () => {
    setIsRecording(true);
    
    // Simulate recording for 3 seconds
    setTimeout(() => {
      setIsRecording(false);
      
      // Add user message
      setMessages(prev => [...prev, { 
        role: 'candidate', 
        content: 'This is a simulated candidate response. In a real implementation, this would be your actual response transcribed from speech.' 
      }]);
      
      // Add interviewer response after a delay
      setTimeout(() => {
        if (currentQuestion < questions.length) {
          setMessages(prev => [...prev, { 
            role: 'interviewer', 
            content: questions[currentQuestion] 
          }]);
          setCurrentQuestion(currentQuestion + 1);
        } else {
          setMessages(prev => [...prev, { 
            role: 'interviewer', 
            content: 'Thank you for your responses. That concludes our interview. We\'ll be in touch soon with next steps.' 
          }]);
        }
      }, 1000);
    }, 3000);
  };
 
  const sendMsg = async()=>{
    try {
        const res = await axios.post(`${url}/interview`,{
            resume:resume,
            jobDescription:job
        })
        console.log(res);
    } catch (error) {
        console.log(error);
    }
  }

 

  return (
    <div className="flex flex-col md:flex-row gap-6 h-screen bg-slate-900 p-6 text-white">
      <div className="w-full md:w-2/3 h-full flex flex-col">
        <Card className="flex-grow bg-slate-800 border-slate-700 text-white">
          <CardHeader className="border-b border-slate-700">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold text-sky-400">Interview Transcript</CardTitle>
                <CardDescription className="text-slate-400">AI-Powered Interview Simulator</CardDescription>
              </div>
              <Button 
                onClick={()=>navigate('/')}
                variant="destructive" 
                className="bg-red-600 hover:bg-red-700"
              >
                <LogOut className="mr-2 h-4 w-4" /> End Interview
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 overflow-y-auto h-full max-h-[calc(100vh-12rem)]">
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'interviewer' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'interviewer' ? 'bg-slate-700' : 'bg-sky-600'
                  }`}>
                    <div className="flex items-center mb-2">
                      <Avatar className={`h-8 w-8 ${message.role === 'interviewer' ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                        {message.role === 'interviewer' ? 'I' : 'C'}
                      </Avatar>
                      <Badge className="ml-2 bg-slate-600">
                        {message.role === 'interviewer' ? 'Interviewer' : 'Candidate'}
                      </Badge>
                    </div>
                    <p>{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-700 p-4">
            <p className="text-xs text-slate-400">
              This is a simulated interview experience. In a real implementation, speech recognition and AI response generation would be integrated.
            </p>
          </CardFooter>
        </Card>
      </div>
      
      <div className="w-full md:w-1/3 h-full">
        <Card className="h-full bg-slate-800 border-slate-700 text-white">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-2xl font-bold text-sky-400">Interview Controls</CardTitle>
            <CardDescription className="text-slate-400">Press and hold to speak</CardDescription>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center justify-center h-[calc(100%-8rem)]">
            <div className="flex flex-col items-center space-y-8">
              <div className={`p-12 rounded-full ${isRecording ? 'bg-rose-500 pulse-animation' : 'bg-slate-700'} transition-all duration-300`}>
                <Mic size={64} className="text-white" />
              </div>
              <Badge className="text-lg py-2 px-4 bg-slate-700">
                {isRecording ? 'Recording...' : 'Ready'}
              </Badge>
              
              <Button 
                onClick={sendMsg}
                disabled={isRecording}
                className="w-64 h-14 text-lg bg-sky-600 hover:bg-sky-700 text-white rounded-full"
              >
                <Mic className="mr-2" /> Push to Talk
              </Button>
              
              <p className="text-slate-400 text-center mt-4">
                Press the button and hold to speak
              </p>
              
              
            </div>
          </CardContent>
          <CardFooter className="border-t border-slate-700 p-4">
            <div className="w-full">
              <p className="text-sm text-slate-400 text-center">Interview Progress</p>
              <div className="mt-2 bg-slate-700 h-2 rounded-full w-full">
                <div 
                  className="bg-sky-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (currentQuestion / questions.length) * 100)}%` }}
                />
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <style jsx>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.7); }
          70% { box-shadow: 0 0 0 20px rgba(244, 63, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0); }
        }
        .pulse-animation {
          animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default InterviewSimulator;