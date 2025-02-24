export const Loader = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="5em"
    height="5em"
    viewBox="0 0 24 24"
    className="mx-auto my-20"
  >
    <path
      fill="none"
      stroke="#054365"
      strokeDasharray="16"
      strokeDashoffset="16"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M12 3c4.97 0 9 4.03 9 9"
    >
      <animate
        fill="freeze"
        attributeName="stroke-dashoffset"
        dur="0.2s"
        values="16;0"
      />
      <animateTransform
        attributeName="transform"
        dur="1.5s"
        repeatCount="indefinite"
        type="rotate"
        values="0 12 12;360 12 12"
      />
    </path>
  </svg>
);
