import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "../lib/utils";

const HeroSection = () => {
  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-black via-purple-950 to-black  overflow-hidden" id="home">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-60"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-purple-600/20 blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 h-full pt-24">
        <div className="flex flex-col md:flex-row items-center justify-between h-full">
          {/* Left content */}
          <motion.div
            className="md:w-1/2 text-white z-10 pt-12 md:pt-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-block px-4 py-2 bg-purple-900/40 rounded-full mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm text-purple-300">
                Your Personal Interview Coach
              </p>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-6xl font-bold mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <span className="text-purple-400">Master</span> Your Interview
              <br />
              Skills <span className="text-white">With AI</span>
            </motion.h1>

            <motion.p
              className="text-lg text-gray-300 mb-8 max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              Practice, learn, and perfect your interview responses with
              personalized AI feedback. Say goodbye to interview anxiety.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 rounded-md text-lg cursor-pointer">
                Try Free Demo
              </Button>
              <Button
                variant="outline"
                className="border-gray-600 text-[#9810fa] hover:bg-purple-600 hover:text-white px-8 py-6 rounded-md text-lg cursor-pointer"
              >
                How It Works
              </Button>
            </motion.div>

            <motion.div
              className="mt-10 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              
              
            </motion.div>
          </motion.div>

          {/* Right content - demo image */}
          <motion.div
            className="md:w-1/2 mt-12 md:mt-0 z-10 flex justify-center"
            initial={{ x: 0 }}
            animate={{
              x: [10, 0, 10],
            }}
            transition={{
              duration: 3.6,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "reverse",
            }}
          >
            <div className="relative w-full max-w-lg">
              <div className=""></div>
              <div className="">
                <img
                  src="https://res.cloudinary.com/dhdmbwnak/image/upload/v1742482425/mohamed-nohassi--0xMiYQmk8g-unsplash-removebg-preview_opujir.png"
                  alt="Interview simulation"
                  className="w-full h-auto"
                />
                <div className="absolute bottom-8 left-0 right-0 text-center">
                  <div className="flex justify-center mb-2"></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
