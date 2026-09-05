import React from 'react';

/**
 * VIHARA Logo with stylized artistic 'V'
 */
export function ViharaLogo({ className = '', onClick }) {
  return (
    <div 
      className={`vihara-brand-logo ${className}`} 
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      title="VIHARA - Smart India Hackathon"
    >
      <span className="vihara-logo-v">V</span>
      <span className="vihara-logo-rest">IHARA</span>
    </div>
  );
}

/**
 * Golden Marigold Floral Vine for left & right borders
 */
export function FloralVines({ position = 'left', className = '' }) {
  const isLeft = position === 'left';
  
  return (
    <div className={`vihara-floral-vine ${isLeft ? 'vine-left' : 'vine-right'} ${className}`}>
      <svg
        viewBox="0 0 160 550"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          height: '100%',
          transform: isLeft ? 'none' : 'scaleX(-1)'
        }}
      >
        {/* Main curved vine stem */}
        <path
          d="M 25 540 C 25 450, 70 380, 50 300 C 30 220, 85 140, 60 40 C 55 20, 70 10, 85 5"
          stroke="#4A6048"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Branch 1 */}
        <path
          d="M 50 300 C 75 285, 110 290, 130 270"
          stroke="#4A6048"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Branch 2 */}
        <path
          d="M 45 420 C 80 400, 115 420, 135 390"
          stroke="#4A6048"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Branch 3 */}
        <path
          d="M 68 180 C 105 160, 125 180, 145 150"
          stroke="#4A6048"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Branch 4 upper */}
        <path
          d="M 62 100 C 95 85, 120 95, 135 75"
          stroke="#4A6048"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Leaves along the stems */}
        {/* Leaf 1 */}
        <path d="M 52 320 C 70 330, 75 350, 60 355 C 50 350, 48 335, 52 320 Z" fill="#607D5A" stroke="#3D5237" strokeWidth="0.8" />
        {/* Leaf 2 */}
        <path d="M 42 250 C 20 240, 15 220, 30 215 C 40 220, 42 235, 42 250 Z" fill="#607D5A" stroke="#3D5237" strokeWidth="0.8" />
        {/* Leaf 3 */}
        <path d="M 65 190 C 80 205, 75 225, 60 225 C 55 215, 58 200, 65 190 Z" fill="#708E69" stroke="#3D5237" strokeWidth="0.8" />
        {/* Leaf 4 */}
        <path d="M 55 140 C 35 130, 30 110, 45 105 C 55 110, 56 125, 55 140 Z" fill="#708E69" stroke="#3D5237" strokeWidth="0.8" />
        {/* Leaf 5 */}
        <path d="M 100 280 C 115 295, 125 290, 120 275 C 110 270, 102 272, 100 280 Z" fill="#607D5A" stroke="#3D5237" strokeWidth="0.8" />
        {/* Leaf 6 */}
        <path d="M 110 165 C 128 175, 138 170, 132 155 C 122 150, 114 155, 110 165 Z" fill="#708E69" stroke="#3D5237" strokeWidth="0.8" />
        {/* Leaf 7 */}
        <path d="M 100 85 C 115 95, 125 90, 120 78 C 110 75, 104 78, 100 85 Z" fill="#829E7A" stroke="#3D5237" strokeWidth="0.8" />

        {/* Marigold Flower 1 (Upper) */}
        <g transform="translate(135, 75)">
          <circle cx="0" cy="0" r="16" fill="#E68A2E" opacity="0.3" />
          {/* Petals */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <ellipse
              key={i}
              cx="0"
              cy="-11"
              rx="6"
              ry="9"
              fill={i % 2 === 0 ? '#E8912D' : '#F5A623'}
              stroke="#BF6D1B"
              strokeWidth="0.7"
              transform={`rotate(${angle})`}
            />
          ))}
          <circle cx="0" cy="0" r="7" fill="#C46816" stroke="#9A4E0B" strokeWidth="0.8" />
          <circle cx="0" cy="0" r="4" fill="#8B4006" />
        </g>

        {/* Marigold Flower 2 (Middle) */}
        <g transform="translate(145, 150)">
          <circle cx="0" cy="0" r="19" fill="#E68A2E" opacity="0.3" />
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
            <ellipse
              key={i}
              cx="0"
              cy="-13"
              rx="6.5"
              ry="10.5"
              fill={i % 3 === 0 ? '#ED9634' : i % 3 === 1 ? '#F7B043' : '#DB7E23'}
              stroke="#BD6A18"
              strokeWidth="0.7"
              transform={`rotate(${angle})`}
            />
          ))}
          <circle cx="0" cy="0" r="8" fill="#C46816" stroke="#9A4E0B" strokeWidth="0.8" />
          <circle cx="0" cy="0" r="4.5" fill="#8B4006" />
        </g>

        {/* Small Flower / Bud (Lower branch) */}
        <g transform="translate(130, 270)">
          <circle cx="0" cy="0" r="14" fill="#E68A2E" opacity="0.25" />
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <ellipse
              key={i}
              cx="0"
              cy="-9"
              rx="5"
              ry="7.5"
              fill={i % 2 === 0 ? '#E8912D' : '#F5A623'}
              stroke="#BF6D1B"
              strokeWidth="0.7"
              transform={`rotate(${angle})`}
            />
          ))}
          <circle cx="0" cy="0" r="5" fill="#C46816" stroke="#9A4E0B" strokeWidth="0.6" />
        </g>

        {/* Small Flower (Left lower) */}
        <g transform="translate(15, 390)">
          <circle cx="0" cy="0" r="12" fill="#E68A2E" opacity="0.25" />
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <ellipse
              key={i}
              cx="0"
              cy="-8"
              rx="4.5"
              ry="7"
              fill="#F5A623"
              stroke="#BF6D1B"
              strokeWidth="0.6"
              transform={`rotate(${angle})`}
            />
          ))}
          <circle cx="0" cy="0" r="4" fill="#C46816" />
        </g>

        {/* Top bud */}
        <g transform="translate(85, 5)">
          <path d="M 0 0 C -6 -8, -6 -14, 0 -20 C 6 -14, 6 -8, 0 0 Z" fill="#E8912D" stroke="#BF6D1B" strokeWidth="0.7" />
          <path d="M -3 0 C -7 -5, -4 -10, -1 -12" stroke="#4A6048" strokeWidth="1.2" fill="none" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Detailed Architectural Landscape Artwork at bottom (Taj Mahal, Qutub Minar, Heritage Arches)
 */
export function MonumentLandscape() {
  return (
    <div className="vihara-monuments-container">
      <svg
        viewBox="0 0 1440 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax meet"
        className="vihara-monuments-svg"
      >
        <defs>
          <linearGradient id="sandGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F5E4C4" stopOpacity="0" />
            <stop offset="60%" stopColor="#ECCF9E" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#E2BD82" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="monumentSepia" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#8C673C" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#5E4324" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Sand & Horizon Glow Background */}
        <rect x="0" y="80" width="1440" height="300" fill="url(#sandGlow)" />

        {/* Ground base lines */}
        <path d="M 0 350 L 1440 350" stroke="#C49F67" strokeWidth="2" opacity="0.6" />
        <path d="M 0 365 L 1440 365" stroke="#B89056" strokeWidth="1.5" opacity="0.4" />
        <path d="M 0 375 L 1440 375" stroke="#A88046" strokeWidth="1" opacity="0.3" />

        {/* Distant trees & garden foliage */}
        <path
          d="M 50 350 Q 80 325 110 350 Q 140 330 170 350 Q 200 320 240 350 Q 280 330 320 350 Q 360 325 400 350 Q 750 335 800 350 Q 850 330 900 350 Q 950 320 1000 350 Q 1050 330 1100 350 Q 1150 325 1200 350 Q 1280 320 1350 350 Q 1400 330 1440 350"
          fill="#CCA76F"
          opacity="0.4"
        />

        {/* ========================================================= */}
        {/* LEFT: TAJ MAHAL (Architectural Etching)                   */}
        {/* ========================================================= */}
        <g transform="translate(60, 45)" stroke="#7D5B31" strokeWidth="1.2" fill="none" opacity="0.92">
          {/* Main Base Platform */}
          <rect x="30" y="245" width="280" height="60" fill="#F4E3C6" fillOpacity="0.4" />
          <line x1="30" y1="260" x2="310" y2="260" />
          <line x1="30" y1="275" x2="310" y2="275" />
          <line x1="30" y1="290" x2="310" y2="290" />
          {/* Base arch niches */}
          {[50, 90, 130, 170, 210, 250, 290].map((x, i) => (
            <path key={i} d={`M ${x-12} 305 L ${x-12} 265 Q ${x} 250 ${x+12} 265 L ${x+12} 305`} fill="#EAD5B0" fillOpacity="0.5" />
          ))}

          {/* Central Tomb Structure */}
          <rect x="90" y="110" width="160" height="135" fill="#FAF1DF" fillOpacity="0.5" />
          
          {/* Main Grand Central Iwan (Arch) */}
          <path d="M 125 245 L 125 140 Q 170 85 215 140 L 215 245" fill="#E6CE9F" fillOpacity="0.45" strokeWidth="1.6" />
          <path d="M 135 245 L 135 155 Q 170 110 205 155 L 205 245" fill="#DDBF86" fillOpacity="0.5" strokeWidth="1.2" />
          <path d="M 148 245 L 148 180 Q 170 150 192 180 L 192 245" fill="#CFAC6F" fillOpacity="0.55" strokeWidth="1" />

          {/* Left Wing & Arches */}
          <rect x="90" y="110" width="35" height="135" />
          <path d="M 95 160 L 95 130 Q 107.5 115 120 130 L 120 160 Z" />
          <path d="M 95 235 L 95 185 Q 107.5 170 120 185 L 120 235 Z" />

          {/* Right Wing & Arches */}
          <rect x="215" y="110" width="35" height="135" />
          <path d="M 220 160 L 220 130 Q 232.5 115 245 130 L 245 160 Z" />
          <path d="M 220 235 L 220 185 Q 232.5 170 245 185 L 245 235 Z" />

          {/* Central Great Onion Dome */}
          {/* Drum under dome */}
          <rect x="140" y="70" width="60" height="40" fill="#FAF1DF" fillOpacity="0.5" />
          <line x1="140" y1="85" x2="200" y2="85" />
          <line x1="140" y1="98" x2="200" y2="98" />
          {/* Bulbous Onion Dome Curve */}
          <path
            d="M 140 70 C 120 40, 150 0, 170 -15 C 190 0, 220 40, 200 70 Z"
            fill="#FAF1DF"
            fillOpacity="0.65"
            strokeWidth="1.6"
          />
          {/* Dome Finial / Kalash */}
          <line x1="170" y1="-15" x2="170" y2="-40" strokeWidth="1.6" />
          <circle cx="170" cy="-28" r="3" fill="#7D5B31" />
          <circle cx="170" cy="-38" r="2" fill="#7D5B31" />

          {/* Left Chhatri (Kiosk) */}
          <rect x="102" y="80" width="18" height="30" />
          <path d="M 98 80 C 98 68, 124 68, 124 80 Z" fill="#FAF1DF" fillOpacity="0.5" />
          <line x1="111" y1="68" x2="111" y2="58" />

          {/* Right Chhatri (Kiosk) */}
          <rect x="220" y="80" width="18" height="30" />
          <path d="M 216 80 C 216 68, 242 68, 242 80 Z" fill="#FAF1DF" fillOpacity="0.5" />
          <line x1="229" y1="68" x2="229" y2="58" />

          {/* Far Left Minaret */}
          <g transform="translate(10, 0)">
            <polygon points="12,305 28,305 24,35 16,35" fill="#FAF1DF" fillOpacity="0.5" />
            {/* Balconies */}
            <rect x="13" y="195" width="14" height="6" fill="#7D5B31" fillOpacity="0.4" />
            <rect x="14" y="115" width="12" height="6" fill="#7D5B31" fillOpacity="0.4" />
            <rect x="15" y="35" width="10" height="6" fill="#7D5B31" fillOpacity="0.4" />
            {/* Minaret Cupola */}
            <path d="M 14 35 C 14 20, 26 20, 26 35 Z" fill="#FAF1DF" />
            <line x1="20" y1="20" x2="20" y2="8" strokeWidth="1.2" />
          </g>

          {/* Inner Left Minaret base hint */}
          {/* Far Right Minaret */}
          <g transform="translate(305, 0)">
            <polygon points="12,305 28,305 24,35 16,35" fill="#FAF1DF" fillOpacity="0.5" />
            <rect x="13" y="195" width="14" height="6" fill="#7D5B31" fillOpacity="0.4" />
            <rect x="14" y="115" width="12" height="6" fill="#7D5B31" fillOpacity="0.4" />
            <rect x="15" y="35" width="10" height="6" fill="#7D5B31" fillOpacity="0.4" />
            <path d="M 14 35 C 14 20, 26 20, 26 35 Z" fill="#FAF1DF" />
            <line x1="20" y1="20" x2="20" y2="8" strokeWidth="1.2" />
          </g>
        </g>

        {/* ========================================================= */}
        {/* CENTER-RIGHT: HISTORIC PAVILION & ARCHWAYS (Humayun's/Mughal) */}
        {/* ========================================================= */}
        <g transform="translate(920, 160)" stroke="#7D5B31" strokeWidth="1.2" fill="none" opacity="0.88">
          <rect x="0" y="80" width="180" height="110" fill="#FAF1DF" fillOpacity="0.45" />
          {/* Central Dome on Pavilion */}
          <path d="M 65 80 C 65 30, 115 30, 115 80 Z" fill="#FAF1DF" fillOpacity="0.5" strokeWidth="1.4" />
          <line x1="90" y1="30" x2="90" y2="15" strokeWidth="1.4" />
          {/* Arches */}
          <path d="M 20 190 L 20 120 Q 40 95 60 120 L 60 190" fill="#E8D1A4" fillOpacity="0.3" />
          <path d="M 70 190 L 70 100 Q 90 70 110 100 L 110 190" fill="#DFBF86" fillOpacity="0.4" strokeWidth="1.4" />
          <path d="M 120 190 L 120 120 Q 140 95 160 120 L 160 190" fill="#E8D1A4" fillOpacity="0.3" />
          {/* Cornice detailing */}
          <line x1="0" y1="80" x2="180" y2="80" strokeWidth="1.5" />
          <line x1="0" y1="90" x2="180" y2="90" />
        </g>

        {/* ========================================================= */}
        {/* FAR RIGHT: QUTUB MINAR (Tower & Fluted Minaret)           */}
        {/* ========================================================= */}
        <g transform="translate(1120, -10)" stroke="#7D5B31" strokeWidth="1.2" fill="none" opacity="0.94">
          {/* Tier 1 (Base - Fluted & Polygon) */}
          <polygon points="12,360 88,360 76,260 24,260" fill="#FAF1DF" fillOpacity="0.6" strokeWidth="1.4" />
          {/* Fluting lines */}
          <line x1="30" y1="360" x2="33" y2="260" />
          <line x1="42" y1="360" x2="43" y2="260" />
          <line x1="50" y1="360" x2="50" y2="260" />
          <line x1="58" y1="360" x2="57" y2="260" />
          <line x1="70" y1="360" x2="67" y2="260" />
          {/* Balcony 1 (Ornate stalactite brackets) */}
          <rect x="18" y="252" width="64" height="8" fill="#7D5B31" fillOpacity="0.5" strokeWidth="1.4" />
          <line x1="20" y1="256" x2="80" y2="256" />

          {/* Tier 2 (Round Fluting) */}
          <polygon points="26,252 74,252 66,165 34,165" fill="#FAF1DF" fillOpacity="0.6" strokeWidth="1.4" />
          <line x1="40" y1="252" x2="42" y2="165" />
          <line x1="50" y1="252" x2="50" y2="165" />
          <line x1="60" y1="252" x2="58" y2="165" />
          {/* Balcony 2 */}
          <rect x="28" y="157" width="44" height="8" fill="#7D5B31" fillOpacity="0.5" strokeWidth="1.4" />

          {/* Tier 3 (Star Fluting) */}
          <polygon points="34,157 66,157 60,80 40,80" fill="#FAF1DF" fillOpacity="0.6" strokeWidth="1.3" />
          <line x1="45" y1="157" x2="46" y2="80" />
          <line x1="50" y1="157" x2="50" y2="80" />
          <line x1="55" y1="157" x2="54" y2="80" />
          {/* Balcony 3 */}
          <rect x="36" y="73" width="28" height="7" fill="#7D5B31" fillOpacity="0.5" strokeWidth="1.3" />

          {/* Tier 4 (Marble & Sandstone Top) */}
          <polygon points="40,73 60,73 56,15 44,15" fill="#FAF1DF" fillOpacity="0.6" strokeWidth="1.2" />
          <line x1="50" y1="73" x2="50" y2="15" />
          {/* Balcony 4 */}
          <rect x="42" y="9" width="16" height="6" fill="#7D5B31" fillOpacity="0.5" strokeWidth="1.2" />

          {/* Spire / Top Cupola */}
          <polygon points="45,9 55,9 50,-8" fill="#7D5B31" fillOpacity="0.7" strokeWidth="1.2" />
          <line x1="50" y1="-8" x2="50" y2="-20" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
}

/**
 * Floral divider flourish for "TRIP PLANNING" header on Page 2
 */
export function FloralDivider() {
  return (
    <div className="vihara-floral-divider" aria-hidden="true">
      <svg width="180" height="24" viewBox="0 0 180 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="10" y1="12" x2="65" y2="12" stroke="#B89056" strokeWidth="1" strokeLinecap="round" />
        {/* Center floral motif */}
        <circle cx="90" cy="12" r="3.5" fill="#E68A2E" stroke="#8C4E0B" strokeWidth="0.8" />
        <ellipse cx="80" cy="12" rx="4" ry="2.5" fill="#507056" />
        <ellipse cx="100" cy="12" rx="4" ry="2.5" fill="#507056" />
        <ellipse cx="90" cy="5" rx="2.5" ry="4" fill="#507056" />
        <ellipse cx="90" cy="19" rx="2.5" ry="4" fill="#507056" />
        <line x1="115" y1="12" x2="170" y2="12" stroke="#B89056" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
  );
}
