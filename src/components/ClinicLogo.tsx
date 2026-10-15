import React from 'react';

interface ClinicLogoProps {
  variant?: 'hero' | 'half-page' | 'compact' | 'icon-only';
  className?: string;
  showTagline?: boolean;
}

export const ClinicLogo: React.FC<ClinicLogoProps> = ({
  variant = 'hero',
  className = '',
  showTagline = true
}) => {
  // Exact Brand Colors from the Al-Eman Logo:
  // Primary Royal Blue: #0047AB / #0B4DA2 / #003D99
  // Bright Golden Yellow: #FFC72C / #F5A623
  // Pure White: #FFFFFF
  // Accent Medical Red: #DC2626 / #E11D48

  // 1. Compact Variant: for Navbar Header, Letters, Badges
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="relative w-11 h-11 shrink-0 flex items-center justify-center rounded-full bg-[#0047AB] shadow-md shadow-blue-950/40 border-2 border-white ring-2 ring-[#0047AB]/30">
          <svg viewBox="0 0 100 100" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Royal Blue Background Circle */}
            <circle cx="50" cy="50" r="48" fill="#0047AB" />
            
            {/* White Ring */}
            <circle cx="50" cy="50" r="45" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="32" stroke="#FFFFFF" strokeWidth="1.5" />

            {/* Golden 8-Pointed Star (Rub el Hizb) */}
            <g transform="translate(50,50) scale(0.65) translate(-50,-50)">
              <rect x="25" y="25" width="50" height="50" fill="#FFC72C" rx="2" />
              <rect x="25" y="25" width="50" height="50" fill="#FFC72C" rx="2" transform="rotate(45 50 50)" />
              <circle cx="50" cy="50" r="18" fill="#0047AB" stroke="#FFC72C" strokeWidth="1.5" />
            </g>

            {/* Horizontal Blue Banner with White Border and Red Stripe */}
            <g>
              <rect x="18" y="47" width="64" height="10" rx="2" fill="#003D99" stroke="#FFFFFF" strokeWidth="1" />
              <line x1="20" y1="52" x2="80" y2="52" stroke="#DC2626" strokeWidth="2.5" />
            </g>

            {/* Golden Medical Caduceus Staff & Wings */}
            <g>
              {/* Staff */}
              <line x1="50" y1="28" x2="50" y2="70" stroke="#FFC72C" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="50" cy="27" r="3" fill="#FFC72C" stroke="#FFFFFF" strokeWidth="0.8" />
              {/* Wings */}
              <path d="M50 32 C42 27 34 32 32 37 C38 36 44 38 50 42 C56 38 62 36 68 37 C66 32 58 27 50 32 Z" fill="#FFC72C" />
              {/* Serpents */}
              <path d="M44 42 C41 46 45 50 50 50 C55 50 59 46 56 42" stroke="#FFC72C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M44 54 C41 58 45 62 50 62 C55 62 59 58 56 54" stroke="#FFC72C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </g>
          </svg>
        </div>
        <div className="leading-tight">
          <div className="font-black text-sm tracking-tight text-slate-900 font-sans">
            AL-EMAN <span className="text-[#0047AB] font-bold">CLINIC & MATERNITY HOME</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium tracking-wide">
            No. 19 Gulma Road, Argungu, Kebbi State
          </div>
        </div>
      </div>
    );
  }

  // 2. Icon-Only Variant: Clean Standalone Scalable Official Seal
  if (variant === 'icon-only') {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Outer Royal Blue Disc */}
          <circle cx="100" cy="100" r="98" fill="#0047AB" />
          
          {/* White Outer Concentric Borders */}
          <circle cx="100" cy="100" r="94" stroke="#FFFFFF" strokeWidth="3" />
          <circle cx="100" cy="100" r="88" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="100" cy="100" r="66" stroke="#FFFFFF" strokeWidth="2.5" />
          <circle cx="100" cy="100" r="62" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 2" />

          {/* Arced Text Top & Bottom Paths */}
          <defs>
            <path id="iconArcTop" d="M 22,100 A 78,78 0 0,1 178,100" fill="none" />
            <path id="iconArcBottom" d="M 178,100 A 78,78 0 0,1 22,100" fill="none" />
          </defs>

          <text className="font-black text-[12px] fill-white uppercase tracking-wider font-sans">
            <textPath href="#iconArcTop" startOffset="50%" textAnchor="middle">
              AL-EMAN HOSPITAL
            </textPath>
          </text>

          <text className="font-bold text-[11px] fill-white uppercase tracking-widest font-sans">
            <textPath href="#iconArcBottom" startOffset="50%" textAnchor="middle">
              • ARGUNGU •
            </textPath>
          </text>

          {/* Golden 8-Pointed Star (Rub el Hizb) */}
          <g transform="translate(100,100) scale(0.95) translate(-100,-100)">
            <rect x="70" y="70" width="60" height="60" fill="#FFC72C" rx="4" stroke="#E5A812" strokeWidth="1.5" />
            <rect x="70" y="70" width="60" height="60" fill="#FFC72C" rx="4" stroke="#E5A812" strokeWidth="1.5" transform="rotate(45 100 100)" />
            <circle cx="100" cy="100" r="26" fill="#003D99" stroke="#FFFFFF" strokeWidth="1.5" />
          </g>

          {/* Horizontal Banner Across Lower-Middle */}
          <g>
            <rect x="36" y="93" width="128" height="18" rx="3" fill="#003D99" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="40" y1="102" x2="160" y2="102" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* Golden Caduceus (Staff, Wings & Serpents) */}
          <g>
            {/* Center Rod */}
            <line x1="100" y1="56" x2="100" y2="140" stroke="#FFC72C" strokeWidth="4" strokeLinecap="round" />
            <circle cx="100" cy="54" r="6" fill="#FFC72C" stroke="#FFFFFF" strokeWidth="1.5" />
            <line x1="100" y1="58" x2="100" y2="138" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

            {/* Wings */}
            <path
              d="M100 66 C86 54 70 64 66 74 C78 72 90 76 100 84 C110 76 122 72 134 74 C130 64 114 54 100 66 Z"
              fill="#FFC72C"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            {/* Wing Feather Accents */}
            <path d="M72 73 C80 67 92 73 98 80" stroke="#E5A812" strokeWidth="1.5" fill="none" />
            <path d="M128 73 C120 67 108 73 102 80" stroke="#E5A812" strokeWidth="1.5" fill="none" />

            {/* Intertwined Serpents */}
            <path
              d="M88 84 C80 92 88 100 100 100 C112 100 120 92 112 84"
              stroke="#FFC72C"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M88 106 C80 114 88 122 100 122 C112 122 120 114 112 106"
              stroke="#FFC72C"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            {/* Serpent Eyes / Finials */}
            <circle cx="88" cy="84" r="2.5" fill="#DC2626" />
            <circle cx="112" cy="84" r="2.5" fill="#DC2626" />
          </g>
        </svg>
      </div>
    );
  }

  // 3. Variant: 'half-page' or 'hero' — The Full Centerpiece for the Landing Page
  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      {/* Outer Emblem Container */}
      <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[440px] lg:h-[440px] flex items-center justify-center">
        
        {/* Ambient Royal Blue & Golden Glow (Harmonized with exact brand colors) */}
        <div className="absolute inset-0 bg-[#0047AB]/25 rounded-full blur-3xl transform scale-110 pointer-events-none" />
        <div className="absolute inset-8 bg-[#FFC72C]/15 rounded-full blur-2xl pointer-events-none" />

        {/* Master SVG Emblem with Exact Colors: Royal Blue #0047AB, Gold #FFC72C, White #FFFFFF, Red #DC2626 */}
        <svg
          viewBox="0 0 440 440"
          className="w-full h-full drop-shadow-[0_25px_50px_rgba(0,35,90,0.6)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <radialGradient id="royalBlueDisc" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0B57C7" />
              <stop offset="65%" stopColor="#0047AB" />
              <stop offset="100%" stopColor="#00317A" />
            </radialGradient>

            <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFE066" />
              <stop offset="45%" stopColor="#FFC72C" />
              <stop offset="100%" stopColor="#D99B00" />
            </linearGradient>

            <linearGradient id="innerBlueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0047AB" />
              <stop offset="100%" stopColor="#002E70" />
            </linearGradient>

            {/* Circular Text Paths */}
            <path
              id="masterTopArc"
              d="M 52,220 A 168,168 0 0,1 388,220"
              fill="none"
            />
            <path
              id="masterBottomArc"
              d="M 388,220 A 168,168 0 0,1 52,220"
              fill="none"
            />

            {/* Filters */}
            <filter id="royalShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#001F52" floodOpacity="0.7" />
            </filter>
            
            <filter id="caduceusGlow" x="-15%" y="-15%" width="130%" height="130%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* ============================================================== */}
          {/* 1. OUTER CIRCULAR SEAL WITH WHITE BORDERS                      */}
          {/* ============================================================== */}
          
          {/* Outermost Precision White Ring */}
          <circle
            cx="220"
            cy="220"
            r="215"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeOpacity="0.95"
          />

          <circle
            cx="220"
            cy="220"
            r="209"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />

          {/* Main Royal Blue Seal Background Disc */}
          <circle
            cx="220"
            cy="220"
            r="204"
            fill="url(#royalBlueDisc)"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            filter="url(#royalShadow)"
          />

          {/* Decorative Perimeter Dots & Star Markers */}
          {[0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345].map((deg) => (
            <circle
              key={deg}
              cx="220"
              cy="23"
              r={deg % 90 === 0 ? "3" : "1.75"}
              fill="#FFFFFF"
              opacity={deg % 90 === 0 ? "0.95" : "0.6"}
              transform={`rotate(${deg} 220 220)`}
            />
          ))}

          {/* ============================================================== */}
          {/* 2. ARCUATE TYPOGRAPHY: EXACT AL-EMAN HOSPITAL & ARGUNGU         */}
          {/* ============================================================== */}
          
          {/* Top Arc Text: AL-EMAN HOSPITAL (White, Bold, Uppercase) */}
          <text className="font-black tracking-[0.25em] text-[20px] fill-white uppercase drop-shadow font-sans">
            <textPath href="#masterTopArc" startOffset="50%" textAnchor="middle">
              ★ AL-EMAN HOSPITAL ★
            </textPath>
          </text>

          {/* Bottom Arc Text: ARGUNGU (White, Bold, Uppercase) */}
          <text className="font-bold tracking-[0.35em] text-[17px] fill-white uppercase drop-shadow font-sans">
            <textPath href="#masterBottomArc" startOffset="50%" textAnchor="middle">
              • ARGUNGU •
            </textPath>
          </text>

          {/* Inner Dividing Concentric White Circles */}
          <circle
            cx="220"
            cy="220"
            r="144"
            stroke="#FFFFFF"
            strokeWidth="3.5"
          />
          <circle
            cx="220"
            cy="220"
            r="138"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeDasharray="5 3"
            opacity="0.8"
          />

          {/* Inner Field Royal Blue Disc */}
          <circle
            cx="220"
            cy="220"
            r="134"
            fill="url(#innerBlueGrad)"
          />

          {/* ============================================================== */}
          {/* 3. CENTER CONTENTS: GOLDEN 8-POINTED STAR (RUB EL HIZB)       */}
          {/* ============================================================== */}
          <g filter="url(#caduceusGlow)">
            {/* Outer Geometric Gold Star (2 overlapping squares at 45 deg) */}
            <rect
              x="152"
              y="152"
              width="136"
              height="136"
              rx="6"
              fill="url(#goldGradient)"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            <rect
              x="152"
              y="152"
              width="136"
              height="136"
              rx="6"
              fill="url(#goldGradient)"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              transform="rotate(45 220 220)"
            />

            {/* Inner Golden Star Inset Line */}
            <rect
              x="158"
              y="158"
              width="124"
              height="124"
              rx="4"
              fill="none"
              stroke="#B37D00"
              strokeWidth="1.5"
            />
            <rect
              x="158"
              y="158"
              width="124"
              height="124"
              rx="4"
              fill="none"
              stroke="#B37D00"
              strokeWidth="1.5"
              transform="rotate(45 220 220)"
            />

            {/* Center Royal Blue Inset Circle inside Star */}
            <circle
              cx="220"
              cy="220"
              r="58"
              fill="#003D99"
              stroke="#FFFFFF"
              strokeWidth="3"
            />
          </g>

          {/* ============================================================== */}
          {/* 4. HORIZONTAL BLUE BANNER WITH WHITE BORDER & RED STRIPE       */}
          {/* ============================================================== */}
          <g>
            {/* Banner Drop Shadow Base */}
            <rect
              x="76"
              y="204"
              width="288"
              height="34"
              rx="5"
              fill="#001F52"
              opacity="0.6"
            />
            {/* Banner Main Royal Blue Rect */}
            <rect
              x="74"
              y="202"
              width="292"
              height="36"
              rx="5"
              fill="#003D99"
              stroke="#FFFFFF"
              strokeWidth="3"
            />
            {/* Crisp White Inner Trim Lines */}
            <line x1="84" y1="208" x2="356" y2="208" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
            <line x1="84" y1="232" x2="356" y2="232" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.8" />
            {/* Vivid Red Accent Stripe Through Center of Banner */}
            <rect
              x="82"
              y="216"
              width="276"
              height="8"
              rx="3"
              fill="#DC2626"
              stroke="#FFFFFF"
              strokeWidth="1"
            />
          </g>

          {/* ============================================================== */}
          {/* 5. GOLDEN MEDICAL CADUCEUS / ROD OF ASCLEPIUS                  */}
          {/* ============================================================== */}
          <g filter="url(#caduceusGlow)">
            {/* Central Vertical Staff / Rod in Rich Gold */}
            <line
              x1="220"
              y1="116"
              x2="220"
              y2="310"
              stroke="url(#goldGradient)"
              strokeWidth="7"
              strokeLinecap="round"
            />
            {/* Staff Highlight Core */}
            <line
              x1="220"
              y1="120"
              x2="220"
              y2="306"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.75"
            />
            {/* Top Sphere / Finial */}
            <circle
              cx="220"
              cy="112"
              r="12"
              fill="url(#goldGradient)"
              stroke="#FFFFFF"
              strokeWidth="2.5"
            />
            <circle
              cx="217"
              cy="109"
              r="3.5"
              fill="#FFFFFF"
              opacity="0.8"
            />

            {/* Symmetrical Outspread Wings at Top of Caduceus */}
            <path
              d="M220 134 C190 108 152 130 144 150 C168 146 194 154 220 172 C246 154 272 146 296 150 C288 130 250 108 220 134 Z"
              fill="url(#goldGradient)"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Wing Feather Detail Grooves */}
            <path d="M158 148 C174 136 198 148 214 164" stroke="#D99B00" strokeWidth="2.5" fill="none" />
            <path d="M282 148 C266 136 242 148 226 164" stroke="#D99B00" strokeWidth="2.5" fill="none" />
            <path d="M174 153 C186 144 204 153 216 167" stroke="#FFFFFF" strokeWidth="1.5" fill="none" opacity="0.6" />
            <path d="M266 153 C254 144 236 153 224 167" stroke="#FFFFFF" strokeWidth="1.5" fill="none" opacity="0.6" />

            {/* Two Intertwining Serpents in Rich Gold with White Highlights */}
            {/* Upper Loop */}
            <path
              d="M194 172 C178 188 194 204 220 204 C246 204 262 188 246 172"
              stroke="url(#goldGradient)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M194 172 C178 188 194 204 220 204 C246 204 262 188 246 172"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              opacity="0.65"
            />

            {/* Middle Serpents crossing behind/in front of banner */}
            <path
              d="M246 236 C262 254 246 272 220 272 C194 272 178 254 194 236"
              stroke="url(#goldGradient)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M246 236 C262 254 246 272 220 272 C194 272 178 254 194 236"
              stroke="#FFFFFF"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              opacity="0.65"
            />

            {/* Serpent Heads at Upper Arc */}
            <circle cx="194" cy="172" r="5" fill="#FFC72C" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="193" cy="171" r="2" fill="#DC2626" />
            
            <circle cx="246" cy="172" r="5" fill="#FFC72C" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="247" cy="171" r="2" fill="#DC2626" />

            {/* Base Finial of Staff */}
            <circle cx="220" cy="310" r="6" fill="url(#goldGradient)" stroke="#FFFFFF" strokeWidth="2" />
          </g>

          {/* ============================================================== */}
          {/* 6. BOTTOM FIVE EMBLEM ACCREDITATION STARS                      */}
          {/* ============================================================== */}
          <g fill="#FFFFFF" stroke="#003D99" strokeWidth="0.5">
            <polygon points="172,374 175,382 184,382 177,387 179,395 172,390 165,395 167,387 160,382 169,382" />
            <polygon points="196,380 199,388 208,388 201,393 203,401 196,396 189,401 191,393 184,388 193,388" />
            <polygon points="220,384 223,392 232,392 225,397 227,405 220,400 213,405 215,397 208,392 217,392" />
            <polygon points="244,380 247,388 256,388 249,393 251,401 244,396 237,401 239,393 232,388 241,388" />
            <polygon points="268,374 271,382 280,382 273,387 275,395 268,390 261,395 263,387 256,382 265,382" />
          </g>
        </svg>
      </div>

      {/* Typography & Official Name & Address with Exact Brand Colors */}
      <div className="mt-6 text-center max-w-md px-4">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white font-sans drop-shadow-md leading-tight">
          AL-EMAN <span className="text-[#FFC72C] drop-shadow-sm">CLINIC &amp; MATERNITY HOME</span>
        </h1>
        
        {/* Physical Address Banner */}
        <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#003380]/90 border border-[#FFC72C]/40 text-[#FFC72C] shadow-md shadow-blue-950/50">
          <span className="w-2 h-2 rounded-full bg-[#FFC72C] shrink-0 animate-pulse" />
          <span className="text-xs sm:text-sm font-bold tracking-wide uppercase font-mono text-white">
            NO. 19 GULMA ROAD, ARGUNGU, KEBBI STATE
          </span>
        </div>

        {showTagline && (
          <p className="mt-3 text-xs sm:text-[13px] text-blue-100/90 leading-relaxed font-sans max-w-sm mx-auto">
            Dedicated Maternal &amp; Neonatal Care, Inpatient Delivery, Outpatient Clinical Consultations,
            Diagnostic Pathology &amp; Secure Health Records.
          </p>
        )}
      </div>
    </div>
  );
};
