import React from "react";
import Navbar from "./Components/Navbar";
import Resumeupload from "./Components/Resumeupload";
import HowToUseSection from "./Components/HowToUseSection";
import ScrollToTopButton from "./Components/ScrollToTopButton ";
import { Route, Routes } from "react-router-dom";
import InterviewSimulator from "./Components/Interview";
import HeroSection from "./Components/HeroSection";

const App = () => {
  return (
    <div className="w-full h-screen">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <HeroSection />
              <Resumeupload />
              <HowToUseSection />
              <ScrollToTopButton />
            </>
          }
        />
        <Route path="/interview" element={<InterviewSimulator />} />
      </Routes>
    </div>
  );
};
export default App;