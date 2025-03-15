import React from "react";

const Navbar = () => {
  return (
    <div className="w-full h-[80px] bg-black  grid grid-cols-12 items-center shadow-lg px-6 py-5">
      <div className="logo col-span-4 flex items-center">
        <h1 className="text-3xl text-white font-bold">Resumate</h1>
      </div>
      {/* Navigation Links */}
      <div className="col-span-8 gap-10 pr-32 flex justify-end space-x-10">
        <a href="#" className="text-white text-[1.2rem] hover:text-amber-500 transition">Resume Upload</a>
        <a href="#" className="text-white text-[1.2rem] hover:text-amber-500 transition">ATS Score</a>
        <a href="#" className="text-white text-[1.2rem] hover:text-amber-500 transition">How to Use</a>
        
      </div>
    </div>
  );
};

export default Navbar;
