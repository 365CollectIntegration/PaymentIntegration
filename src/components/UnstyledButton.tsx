import { ReactNode } from "react";

type UnstyledButtonProps = {
  containerClassName?: string;
  className?: string;
  stopPropagation?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit";
  children?: ReactNode;
};

export function UnstyledButton({
  containerClassName,
  onClick,
  stopPropagation,
  type = "button",
  children,
  className,
}: UnstyledButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);

    if (stopPropagation) {
      e.stopPropagation();
    }
  };

  return (
    <div className={containerClassName}>
      <button type={type} className={className} onClick={handleClick}>
        {children}
      </button>
    </div>
  );
}
