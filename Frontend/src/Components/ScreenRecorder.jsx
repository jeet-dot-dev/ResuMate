// ScreenRecorderUtil.js

export class ScreenRecorder {
    constructor() {
      this.mediaRecorder = null;
      this.recordedChunks = [];
      this.stream = null;
      this.videoBlob = null;
      this.cheatingEvents = [];
    }
  
    // Start recording camera and screen
    async startRecording() {
      try {
        // Get camera stream
        const cameraStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        // Combine with audio stream if needed
        this.stream = cameraStream;
        
        // Create media recorder
        this.mediaRecorder = new MediaRecorder(this.stream);
        this.recordedChunks = [];
        
        // Handle data when available
        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.recordedChunks.push(event.data);
          }
        };
        
        // Start recording
        this.mediaRecorder.start();
        
        return true;
      } catch (error) {
        console.error("Error starting recording:", error);
        return false;
      }
    }
  
    // Stop recording and get the recording URL
    stopRecording() {
      return new Promise((resolve, reject) => {
        if (!this.mediaRecorder) {
          reject("No recording in progress");
          return;
        }
  
        this.mediaRecorder.onstop = () => {
          this.videoBlob = new Blob(this.recordedChunks, { type: "video/webm" });
          const videoUrl = URL.createObjectURL(this.videoBlob);
          
          // Stop all tracks
          if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
          }
          
          resolve({
            videoUrl,
            videoBlob: this.videoBlob,
            cheatingEvents: this.cheatingEvents
          });
        };
  
        this.mediaRecorder.stop();
      });
    }
  
    // Record a cheating event
    recordCheatingEvent(type, timestamp) {
      this.cheatingEvents.push({
        type,
        timestamp,
        formattedTime: new Date(timestamp).toISOString().substr(11, 8) // HH:MM:SS
      });
    }
  
    // Download the recorded video
    downloadRecording(filename = "interview-recording.webm") {
      if (!this.videoBlob) {
        return false;
      }
      
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(this.videoBlob);
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      return true;
    }
  }
  
  export default ScreenRecorder;