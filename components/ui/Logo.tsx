import React from 'react';

export const Logo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="40px" // Adjusted default size, can be overridden by className
    height="40px"
    viewBox="0 0 256 256"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    preserveAspectRatio="xMidYMid"
    className={className}
    {...props}
  >
    <title>Moon Logo</title>
    <defs>
      <circle id="path-1" cx="128" cy="128" r="128"></circle>
      <radialGradient cx="50%" cy="50%" fx="50%" fy="50%" r="49.7893875%" id="moonRadialGradient-1">
        <stop stopColor="#4600D1" offset="0%"></stop>
        <stop stopColor="#4600D1" offset="49.2852329%"></stop>
        <stop stopColor="#35009F" offset="100%"></stop>
      </radialGradient>
      <radialGradient cx="50%" cy="50%" fx="50%" fy="50%" r="49.6030859%" id="moonRadialGradient-2">
        <stop stopColor="#35019E" offset="0%"></stop>
        <stop stopColor="#320194" offset="18.7296056%"></stop>
        <stop stopColor="#220066" offset="100%"></stop>
      </radialGradient>
    </defs>
    <g>
      <g>
        <circle fill="#5805FF" cx="128" cy="128" r="128"></circle>
        <mask id="mask-2" fill="white">
          <use xlinkHref="#path-1"></use>
        </mask>
        <circle fill="url(#moonRadialGradient-1)" mask="url(#mask-2)" cx="199.694484" cy="105.369165" r="128"></circle>
        <circle fill="url(#moonRadialGradient-2)" mask="url(#mask-2)" cx="275.371994" cy="82.3762376" r="128"></circle>
      </g>
    </g>
  </svg>
);

export default Logo;