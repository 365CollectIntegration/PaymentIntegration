// import { getButtonVariantClassNames } from "@/utils/componentHelpers";
import classNames from "classnames";
import { ReactNode } from "react";

type ButtonProps = {
  label?: string;
  containerClassName?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isBlock?: boolean;
  children?: ReactNode;
  variant?: "button-light" | "button-dark" | "secondary" | "primary";
  stopPropagation?: boolean;
  isLoading?: boolean;
};

export function Button({
  label,
  containerClassName,
  onClick,
  isBlock = true,
  children,
  variant = "button-light",
  stopPropagation = true,
  isLoading,
}: ButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);

    if (stopPropagation) {
      e.stopPropagation();
    }
  };

  return (
    <div className={classNames(containerClassName, isBlock && "flex")}>
      <button
        type="button"
        className={classNames(
          "m-0 rounded-3xl px-5 py-2.5 text-center text-sm font-medium text-white focus:outline-none focus:ring-4",
          isBlock && "flex-1",
          variant === "secondary" &&
            "bg-white text-pa-normal border border-pa-border hover:bg-gray-100",
          variant === "button-light" &&
            "bg-pa-button-light hover:bg-blue-800 focus:ring-blue-300",
          variant === "button-dark" &&
            "bg-pa-button-dark hover:bg-blue-800 focus:ring-blue-300",
          variant === "primary" &&
            "bg-pa-primary hover:bg-blue-800 focus:ring-blue-300"
        )}
        onClick={handleClick}
      >
        {isLoading ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.5em"
            height="1.5em"
            viewBox="0 0 24 24"
            className="mx-auto"
          >
            <path
              fill="none"
              stroke="#FFF"
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
        ) : children ? (
          children
        ) : (
          label
        )}
      </button>
    </div>
  );
}
