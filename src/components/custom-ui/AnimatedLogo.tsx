import React from "react";

export const AnimatedLogo = () => {
  return (
    <div className="relative">
      {/* Synthwave rotating background */}
      <div className="absolute inset-0 rounded-full animate-rotate bg-[conic-gradient(from_0deg,_#00ffd5,_#00b2ff,_#0077ff,_#0011ff,_#00ffd5)] blur-xl opacity-80" />

      {/* Logo on top */}
      <img
        src="/logo/logo1.png"
        alt="ALVA Logo"
        className="relative w-full h-full object-cover rounded-full drop-shadow-lg z-10"
        loading="eager"
      />
    </div>
  );
};
