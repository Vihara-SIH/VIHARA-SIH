import React from 'react';

/**
 * Mughal Multi-foil Cusped Arch SVG Backdrop matching the Stitch visual design
 */
export function MughalArch({ children, className = '' }) {
  return (
    <div className={`vihara-arch-container ${className}`}>
      <svg
        className="vihara-arch-backdrop-svg"
        viewBox="0 0 900 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Inner Arch Color Gradient from Soft Sage/Teal at Top to Warm Amber/Sandstone at Bottom */}
          <linearGradient id="archFillGradient" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#7DA89B" stopOpacity="0.75" />
            <stop offset="18%" stopColor="#9ABFB4" stopOpacity="0.65" />
            <stop offset="42%" stopColor="#D9CCA8" stopOpacity="0.55" />
            <stop offset="70%" stopColor="#F2D8A2" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ECCB8B" stopOpacity="0.6" />
          </linearGradient>

          {/* Border Gold Line Gradient */}
          <linearGradient id="archBorderGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B38B48" />
            <stop offset="50%" stopColor="#D8B572" />
            <stop offset="100%" stopColor="#9E7635" />
          </linearGradient>
        </defs>

        {/* Outer subtle shadow/glow arch */}
        <path
          d="
            M 50 700 
            L 50 360 
            C 50 320, 80 280, 110 270
            C 90 230, 130 180, 180 170
            C 170 120, 230 80, 290 85
            C 300 45, 380 25, 450 10
            C 520 25, 600 45, 610 85
            C 670 80, 730 120, 720 170
            C 770 180, 810 230, 790 270
            C 820 280, 850 320, 850 360
            L 850 700
            Z
          "
          fill="#FAF3E6"
          opacity="0.3"
        />

        {/* Primary Multi-foil Cusped Arch Path */}
        <path
          d="
            M 60 700 
            L 60 380 
            C 60 345, 85 315, 115 305
            C 100 270, 135 230, 175 220
            C 165 175, 215 140, 265 140
            C 275 105, 345 80, 410 65
            C 430 45, 440 25, 450 15
            C 460 25, 470 45, 490 65
            C 555 80, 625 105, 635 140
            C 685 140, 735 175, 725 220
            C 765 230, 800 270, 785 305
            C 815 315, 840 345, 840 380
            L 840 700
            Z
          "
          fill="url(#archFillGradient)"
          stroke="url(#archBorderGold)"
          strokeWidth="3"
        />

        {/* Inner Decorative Double Border Line */}
        <path
          d="
            M 72 700 
            L 72 385 
            C 72 355, 95 328, 122 318
            C 110 285, 142 248, 180 238
            C 172 195, 218 162, 264 160
            C 278 128, 342 104, 404 90
            C 424 72, 438 52, 450 35
            C 462 52, 476 72, 496 90
            C 558 104, 622 128, 636 160
            C 682 162, 728 195, 720 238
            C 758 248, 790 285, 778 318
            C 805 328, 828 355, 828 385
            L 828 700
          "
          fill="none"
          stroke="#CDB07B"
          strokeWidth="1.2"
          strokeDasharray="4 2"
          opacity="0.8"
        />

        {/* Top Pinnacle Dome / Kalash Finial */}
        <g transform="translate(450, 15)">
          <path d="M 0 -15 C -4 -8, -6 -2, 0 0 C 6 -2, 4 -8, 0 -15 Z" fill="#D4AF37" stroke="#A57D33" strokeWidth="0.8" />
          <circle cx="0" cy="-18" r="2.5" fill="#D4AF37" />
          <line x1="0" y1="-21" x2="0" y2="-28" stroke="#A57D33" strokeWidth="1" />
        </g>
      </svg>

      {/* Embedded interactive content inside the arch */}
      {children}
    </div>
  );
}

export default MughalArch;
