import React from "react";
import Navbar from "./Components/Navbar";
import Resumeupload from "./Components/Resumeupload";
import Ats from "./Components/Ats";
import HowToUseSection from "./Components/HowToUseSection";
import ScrollToTopButton from "./Components/ScrollToTopButton ";
import { Route, Routes } from "react-router-dom";
import Interview from "./Components/Interview";
import InterviewSimulator from "./Components/Interview";

const App = () => {
  return (
    <div className="w-full h-screen">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar />
              <Resumeupload />
              <Ats />
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
