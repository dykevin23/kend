export default function CloseFloatingIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="76"
      height="76"
      viewBox="0 0 76 76"
      fill="none"
    >
      <g filter="url(#filter0_d)">
        <rect x="10" y="10" width="56" height="56" rx="28" fill="white" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M32.3431 32.3431C32.7336 31.9526 33.3668 31.9526 33.7573 32.3431L38 36.5858L42.2426 32.3431C42.6332 31.9526 43.2663 31.9526 43.6569 32.3431C44.0474 32.7337 44.0474 33.3668 43.6569 33.7574L39.4142 38L43.6569 42.2426C44.0474 42.6332 44.0474 43.2663 43.6569 43.6569C43.2663 44.0474 42.6332 44.0474 42.2426 43.6569L38 39.4142L33.7573 43.6569C33.3668 44.0474 32.7336 44.0474 32.3431 43.6569C31.9526 43.2663 31.9526 42.6332 32.3431 42.2426L36.5858 38L32.3431 33.7574C31.9526 33.3668 31.9526 32.7337 32.3431 32.3431Z"
          fill="black"
        />
      </g>
      <defs>
        <filter
          id="filter0_d"
          x="0"
          y="0"
          width="76"
          height="76"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="5" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}
