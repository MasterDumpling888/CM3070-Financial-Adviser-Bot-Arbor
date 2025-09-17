'use client';

import Image from 'next/image';

interface LogoProps {
  variant?: 'white' | 'black';
  width?: number;
  height?: number;
}

export const Logo = ({ variant = 'black', width = 40, height   = 39 }: LogoProps) => {
  const src = variant === 'white' ? '/assets/logo-white.png' : '/assets/logo-blk.png';

  return <Image src={src} alt="Logo" width={width} height={height} />;
};