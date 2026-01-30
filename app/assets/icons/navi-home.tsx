export default function NaviHome({ isActive = false }: { isActive: boolean }) {
  return isActive ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="23"
      height="24"
      viewBox="0 0 23 24"
      fill="none"
    >
      <g clipPath="url(#clip0_4006_805)">
        <mask
          id="mask0_4006_805"
          // style="mask-type:luminance"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="23"
          height="24"
        >
          <path d="M22.75 0H0V23.33H22.75V0Z" fill="white" />
        </mask>
        <g mask="url(#mask0_4006_805)">
          <path
            d="M18.26 23.3301H15.93C14.73 23.3301 13.76 22.3601 13.76 21.1701V18.2201C13.76 17.5501 13.21 17.0101 12.52 17.0101H10.24C9.56 17.0101 9 17.5501 9 18.2201V21.1701C9 22.3601 8.03 23.3301 6.83 23.3301H4.5C2.02 23.3301 0 21.3301 0 18.8601V9.72007C0 8.19007 0.73 6.73007 1.97 5.81007L8.56 0.930068C10.22 -0.299932 12.53 -0.299932 14.19 0.930068L20.78 5.83007C22.02 6.75007 22.75 8.21007 22.75 9.74007V18.8701C22.75 21.3301 20.73 23.3401 18.25 23.3401L18.26 23.3301Z"
            fill="black"
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_4006_805">
          <rect width="22.76" height="23.34" fill="white" />
        </clipPath>
      </defs>
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="23"
      height="24"
      viewBox="0 0 23 24"
      fill="none"
    >
      <g clipPath="url(#clip0_1_403)">
        <mask
          id="mask0_1_403"
          // style="mask-type:luminance"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="23"
          height="24"
        >
          <path d="M22.75 0H0V23.33H22.75V0Z" fill="white" />
        </mask>
        <g mask="url(#mask0_1_403)">
          <path
            d="M18.26 23.3301H15.93C14.73 23.3301 13.76 22.3601 13.76 21.1701V18.2201C13.76 17.5501 13.21 17.0101 12.52 17.0101H10.24C9.56 17.0101 9 17.5501 9 18.2201V21.1701C9 22.3601 8.03 23.3301 6.83 23.3301H4.5C2.02 23.3301 0 21.3301 0 18.8601V9.72007C0 8.19007 0.73 6.73007 1.97 5.81007L8.56 0.930068C10.22 -0.299932 12.53 -0.299932 14.19 0.930068L20.78 5.83007C22.02 6.75007 22.75 8.21007 22.75 9.74007V18.8701C22.75 21.3301 20.73 23.3401 18.25 23.3401L18.26 23.3301Z"
            fill="#9F9F9F"
          />
        </g>
      </g>
      <defs>
        <clipPath id="clip0_1_403">
          <rect width="22.76" height="23.34" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
