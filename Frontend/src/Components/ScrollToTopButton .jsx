import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  // Show the button when scrolled 200px down
  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top on click
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      {visible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 cursor-pointer bg-black text-white p-4 rounded-full shadow-lg hover:bg-zinc-800 transition duration-300"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
};

export default ScrollToTopButton;
