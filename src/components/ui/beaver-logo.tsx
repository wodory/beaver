import React from 'react';

interface BeaverLogoProps {
  size?: number;
  className?: string;
}

export function BeaverLogo({ size = 24, className = '' }: BeaverLogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="146 130 220 190" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 비버 얼굴(큰 원) */}
      <circle cx="256" cy="256" r="110" fill="#C8A272"/>

      {/* 비버 귀(좌우 작은 원) */}
      <circle cx="200" cy="160" r="24" fill="#C8A272"/>
      <circle cx="312" cy="160" r="24" fill="#C8A272"/>

      {/* 비버 주둥이(ellipse) */}
      <ellipse cx="256" cy="285" rx="58" ry="45" fill="#B48A6C"/>

      {/* 코 */}
      <circle cx="256" cy="265" r="12" fill="#5B3F29"/>

      {/* 눈(좌우) */}
      <circle cx="230" cy="235" r="8" fill="#3C2A19"/>
      <circle cx="282" cy="235" r="8" fill="#3C2A19"/>

      {/* 앞니(두 개의 사각형) */}
      <rect x="240" y="295" width="10" height="14" fill="#FFFFFF" rx="2"/>
      <rect x="262" y="295" width="10" height="14" fill="#FFFFFF" rx="2"/>
    </svg>
  );
} 