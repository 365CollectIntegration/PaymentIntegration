import { ReactNode } from "react";
import classNames from "classnames";
import { MdOutlineExpandLess } from "react-icons/md";
import { MdOutlineExpandMore } from "react-icons/md";

import { UnstyledButton } from "./UnstyledButton";

import { useToggle } from "../hooks/useToggle";

type AccordionProps = {
  isExpanded?: boolean;
  children: ReactNode;
  title: string | ReactNode;
};

export function Accordion({
  isExpanded = false,
  title = "",
  children,
}: AccordionProps) {
  const { isOpen, toggle } = useToggle(isExpanded);

  return (
    <div>
      <UnstyledButton
        onClick={toggle}
        containerClassName="flex"
        className={classNames(
          "m-0 flex flex-1 rounded-t-xl px-5 py-3 text-center font-medium focus:outline-none",
          "border-l border-r border-t border-gray-100 bg-pa-background-box",
          !isOpen &&
            "rounded-b-xl rounded-l-xl rounded-r-xl border-b shadow-md",
        )}
      >
        <div className="flex flex-1 justify-between">
          <div className="text-sm">{title}</div>
          <div className="text-2xl">
            {isOpen ? <MdOutlineExpandLess /> : <MdOutlineExpandMore />}
          </div>
        </div>
      </UnstyledButton>
      {isOpen ? (
        <div className="rounded-b-xl border-b border-l border-r bg-pa-background-box px-5 pb-3 pt-0 text-sm shadow-md">
          <div> {children ?? "No content"}</div>
        </div>
      ) : null}
    </div>
  );
}
