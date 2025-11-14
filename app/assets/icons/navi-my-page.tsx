export default function NaviMyPage({
  isActive = false,
}: {
  isActive: boolean;
}) {
  return isActive ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <g clip-path="url(#clip0_1_486)">
        <rect width="23.33" height="23.33" rx="11.665" fill="black" />
        <path
          d="M1.62056 23.2177C1.65745 18.557 3.99644 13.9331 9.39678 13.9331C14.7971 13.9331 17.1361 18.557 17.173 23.2177C17.1735 23.2797 17.1232 23.3299 17.0613 23.3299H1.73228C1.67033 23.3299 1.62007 23.2797 1.62056 23.2177Z"
          fill="#777777"
        />
        <ellipse
          cx="9.39674"
          cy="8.51188"
          rx="4.53639"
          ry="4.6984"
          fill="#777777"
        />
        <g filter="url(#filter0_d_1_486)">
          <path
            d="M11.0176 23.2178C11.0479 19.6913 12.5109 16.2014 15.8775 16.2014C19.2441 16.2014 20.7071 19.6913 20.7374 23.2178C20.738 23.2798 20.6877 23.33 20.6258 23.33H11.1293C11.0673 23.33 11.017 23.2798 11.0176 23.2178Z"
            fill="white"
          />
        </g>
        <circle cx="15.7155" cy="12.0514" r="3.07826" fill="white" />
      </g>
      <defs>
        <filter
          id="filter0_d_1_486"
          x="10.1203"
          y="16.2014"
          width="11.5143"
          height="8.92328"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="0.897308" />
          <feGaussianBlur stdDeviation="0.448654" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_1_486"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_1_486"
            result="shape"
          />
        </filter>
        <clipPath id="clip0_1_486">
          <rect width="23.33" height="23.33" rx="11.665" fill="white" />
        </clipPath>
      </defs>
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <g clip-path="url(#clip0_1_422)">
        <rect width="23.33" height="23.33" rx="11.665" fill="#F1F1F1" />
        <path
          d="M1.62056 23.2177C1.65745 18.557 3.99644 13.9331 9.39678 13.9331C14.7971 13.9331 17.1361 18.557 17.173 23.2177C17.1735 23.2797 17.1232 23.3299 17.0613 23.3299H1.73228C1.67033 23.3299 1.62007 23.2797 1.62056 23.2177Z"
          fill="#9F9F9F"
        />
        <ellipse
          cx="9.39674"
          cy="8.51188"
          rx="4.53639"
          ry="4.6984"
          fill="#9F9F9F"
        />
        <g filter="url(#filter0_d_1_422)">
          <path
            d="M11.0176 23.2178C11.0479 19.6913 12.5109 16.2014 15.8775 16.2014C19.2441 16.2014 20.7071 19.6913 20.7374 23.2178C20.738 23.2798 20.6877 23.33 20.6258 23.33H11.1293C11.0673 23.33 11.017 23.2798 11.0176 23.2178Z"
            fill="#BFBFBF"
          />
        </g>
        <circle cx="15.7155" cy="12.0514" r="3.07826" fill="#BFBFBF" />
      </g>
      <defs>
        <filter
          id="filter0_d_1_422"
          x="10.1203"
          y="16.2014"
          width="11.5143"
          height="8.92328"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="0.897308" />
          <feGaussianBlur stdDeviation="0.448654" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_1_422"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_1_422"
            result="shape"
          />
        </filter>
        <clipPath id="clip0_1_422">
          <rect width="23.33" height="23.33" rx="11.665" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
