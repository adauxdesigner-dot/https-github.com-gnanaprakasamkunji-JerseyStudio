import * as React from 'react';
import { GarmentView, JerseyMockupConfig } from './editorTypes';

export interface JerseyMockupProps {
  view: GarmentView;
  config: JerseyMockupConfig;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const JerseyMockup: React.FC<JerseyMockupProps> = ({
  view,
  config,
  className = '',
}) => {
  const {
    primaryColor,
    collarColor,
    trimColor,
    accentColor,
    showSeams,
    showGuides,
  } = config;

  return (
    <svg
      viewBox="0 0 1000 1400"
      className={`w-full h-full pointer-events-none select-none ${className}`}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Subtle fabric texture / shading */}
        <linearGradient id="fabricShading" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.12" />
          <stop offset="15%" stopColor="#000000" stopOpacity="0.03" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.08" />
          <stop offset="85%" stopColor="#000000" stopOpacity="0.03" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.12" />
        </linearGradient>

        <linearGradient id="sleeveShadeLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
        </linearGradient>

        <linearGradient id="sleeveShadeRight" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
        </linearGradient>

        {/* Drop shadow for mockups */}
        <filter id="jerseyShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#0F172A" floodOpacity="0.12" />
        </filter>
      </defs>

      <g filter="url(#jerseyShadow)">
        {/* ====================================================================
            SLEEVES (Left & Right)
            ==================================================================== */}
        {/* Left Sleeve */}
        <path
          d="M 330 190 L 90 350 L 170 510 L 320 420 Z"
          fill={primaryColor}
          stroke="#000000"
          strokeOpacity="0.15"
          strokeWidth="2"
        />
        <path
          d="M 330 190 L 90 350 L 170 510 L 320 420 Z"
          fill="url(#sleeveShadeLeft)"
        />

        {/* Left Sleeve Cuff Trim */}
        <path
          d="M 90 350 L 76 362 L 156 522 L 170 510 Z"
          fill={trimColor}
          stroke="#000000"
          strokeOpacity="0.2"
          strokeWidth="1.5"
        />

        {/* Right Sleeve */}
        <path
          d="M 670 190 L 910 350 L 830 510 L 680 420 Z"
          fill={primaryColor}
          stroke="#000000"
          strokeOpacity="0.15"
          strokeWidth="2"
        />
        <path
          d="M 670 190 L 910 350 L 830 510 L 680 420 Z"
          fill="url(#sleeveShadeRight)"
        />

        {/* Right Sleeve Cuff Trim */}
        <path
          d="M 910 350 L 924 362 L 844 522 L 830 510 Z"
          fill={trimColor}
          stroke="#000000"
          strokeOpacity="0.2"
          strokeWidth="1.5"
        />

        {/* ====================================================================
            MAIN BODY TORSO
            ==================================================================== */}
        <path
          id="torsoBase"
          d="M 330 190 
             C 390 195, 610 195, 670 190
             L 680 420
             C 675 580, 690 980, 700 1280
             C 600 1310, 400 1310, 300 1280
             C 310 980, 325 580, 320 420
             Z"
          fill={primaryColor}
          stroke="#000000"
          strokeOpacity="0.18"
          strokeWidth="2.5"
        />

        {/* ====================================================================
            SIDE BREATHABLE MESH PANELS (Accent Color)
            ==================================================================== */}
        {/* Left Side Panel */}
        <path
          d="M 320 420
             C 340 600, 345 950, 340 1285
             L 300 1280
             C 310 980, 325 580, 320 420 Z"
          fill={accentColor}
          opacity="0.85"
        />
        {/* Right Side Panel */}
        <path
          d="M 680 420
             C 660 600, 655 950, 660 1285
             L 700 1280
             C 690 980, 675 580, 680 420 Z"
          fill={accentColor}
          opacity="0.85"
        />

        {/* Subtle Torso Shading Gradient */}
        <path
          d="M 330 190 
             C 390 195, 610 195, 670 190
             L 680 420
             C 675 580, 690 980, 700 1280
             C 600 1310, 400 1310, 300 1280
             C 310 980, 325 580, 320 420
             Z"
          fill="url(#fabricShading)"
        />

        {/* ====================================================================
            HEM / BOTTOM EDGE
            ==================================================================== */}
        <path
          d="M 300 1280 C 400 1310, 600 1310, 700 1280 L 702 1295 C 600 1325, 400 1325, 298 1295 Z"
          fill={trimColor}
          stroke="#000000"
          strokeOpacity="0.15"
          strokeWidth="1.5"
        />

        {/* ====================================================================
            COLLAR / NECK AREA
            ==================================================================== */}
        {view === 'front' ? (
          /* FRONT VIEW: V-Neck with athletic ribbed collar */
          <g id="frontCollar">
            {/* Inner Back Neck visible from front */}
            <path
              d="M 400 193 C 460 215, 540 215, 600 193 C 570 160, 430 160, 400 193 Z"
              fill="#111827"
              opacity="0.4"
            />
            {/* Front V-neck cutout collar band */}
            <path
              d="M 390 192 
                 C 420 220, 460 270, 500 310
                 C 540 270, 580 220, 610 192
                 L 630 190
                 C 590 230, 540 300, 500 335
                 C 460 300, 410 230, 370 190
                 Z"
              fill={collarColor}
              stroke="#000000"
              strokeOpacity="0.2"
              strokeWidth="2"
            />
            {/* Collar center stitch */}
            <line
              x1="500"
              y1="310"
              x2="500"
              y2="335"
              stroke="#000000"
              strokeOpacity="0.25"
              strokeWidth="2"
            />
          </g>
        ) : (
          /* BACK VIEW: High crew collar & back yoke seam */
          <g id="backCollar">
            <path
              d="M 385 190 
                 C 440 170, 560 170, 615 190
                 L 618 208
                 C 560 190, 440 190, 382 208
                 Z"
              fill={collarColor}
              stroke="#000000"
              strokeOpacity="0.2"
              strokeWidth="2"
            />
            {/* Upper Back Yoke Seam */}
            {showSeams && (
              <path
                d="M 328 320 C 440 350, 560 350, 672 320"
                fill="none"
                stroke="#FFFFFF"
                strokeOpacity="0.35"
                strokeWidth="2.5"
                strokeDasharray="6,4"
              />
            )}
          </g>
        )}

        {/* ====================================================================
            SEAM LINES (Optional realistic stitching)
            ==================================================================== */}
        {showSeams && (
          <g stroke="#000000" strokeOpacity="0.12" strokeWidth="1.5">
            {/* Raglan left shoulder seam */}
            <line x1="395" y1="205" x2="320" y2="420" />
            {/* Raglan right shoulder seam */}
            <line x1="605" y1="205" x2="680" y2="420" />
            {/* Left side panel seam */}
            <path
              d="M 320 420 C 340 600, 345 950, 340 1285"
              fill="none"
              strokeDasharray="4,4"
            />
            {/* Right side panel seam */}
            <path
              d="M 680 420 C 660 600, 655 950, 660 1285"
              fill="none"
              strokeDasharray="4,4"
            />
          </g>
        )}

        {/* ====================================================================
            PLACEMENT SAFE GUIDELINES
            ==================================================================== */}
        {showGuides && (
          <g>
            {view === 'front' ? (
              /* Front Placement Zone Guidelines */
              <g>
                {/* Chest Logo & Sponsor Placement Box */}
                <rect
                  x="360"
                  y="400"
                  width="280"
                  height="340"
                  rx="12"
                  fill="none"
                  stroke="#3B82F6"
                  strokeOpacity="0.35"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
                <text
                  x="500"
                  y="390"
                  textAnchor="middle"
                  fill="#3B82F6"
                  opacity="0.6"
                  fontSize="20"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  letterSpacing="1"
                >
                  CHEST PLACEMENT ZONE
                </text>
              </g>
            ) : (
              /* Back Placement Zone Guidelines */
              <g>
                {/* Name Arc Zone */}
                <rect
                  x="350"
                  y="360"
                  width="300"
                  height="120"
                  rx="10"
                  fill="none"
                  stroke="#3B82F6"
                  strokeOpacity="0.35"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
                <text
                  x="500"
                  y="350"
                  textAnchor="middle"
                  fill="#3B82F6"
                  opacity="0.6"
                  fontSize="18"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  letterSpacing="1"
                >
                  PLAYER NAME ZONE
                </text>

                {/* Squad Number Zone */}
                <rect
                  x="370"
                  y="520"
                  width="260"
                  height="380"
                  rx="12"
                  fill="none"
                  stroke="#3B82F6"
                  strokeOpacity="0.35"
                  strokeWidth="2"
                  strokeDasharray="6,6"
                />
                <text
                  x="500"
                  y="510"
                  textAnchor="middle"
                  fill="#3B82F6"
                  opacity="0.6"
                  fontSize="18"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  letterSpacing="1"
                >
                  SQUAD NUMBER ZONE
                </text>
              </g>
            )}
          </g>
        )}
      </g>
    </svg>
  );
};
