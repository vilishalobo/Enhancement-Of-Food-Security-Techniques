import React from "react";
import "./LandingPage.css"; // Ensure you have the correct CSS file

// Import images using relative paths
import img2 from "../assets/img2.jpg";
import img3 from "../assets/img3.jpg";
import img4 from "../assets/img4.jpg";
import img6 from "../assets/img6.jpg";
import img8 from "../assets/img8.jpg";
import img9 from "../assets/img9.jpg";
import img10 from "../assets/img10.jpg";
import img11 from "../assets/img11.jpg";
import img14 from "../assets/img14.jpg";
import img15 from "../assets/img15.jpg";
import img16 from "../assets/img16.jpg";
import img19 from "../assets/img19.jpg";

// Floating Images Component
const FloatingImages = () => {
  const images = [
    img2, img3, img4, img6,
    img8, img9, img10, img11,
    img14, img15, img16, img19
  ];

  return (
    <div className="floating-images">
      {images.map((src, index) => (
        <img 
          key={index} 
          src={src} 
          alt={`Floating Image ${index + 1}`} // Corrected the alt attribute
          className="floating-image"
        />
      ))}
    </div>
  );
};

export default FloatingImages;