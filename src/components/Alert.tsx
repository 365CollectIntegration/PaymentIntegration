import { ReactNode } from "react";
import classNames from "classnames";
import { MdInfo } from "react-icons/md";
import { MdCancel } from "react-icons/md";
import { MdCheckCircle } from "react-icons/md";

import { COLOR_VARIANT } from "@/utils/componentHelpers";

type AlertProps = {
  variant: COLOR_VARIANT;
  title: string;
  children?: ReactNode;
};

export function Alert({ variant, title, children }: AlertProps) {
  function renderIcon() {
    switch (variant) {
      case COLOR_VARIANT.INFO:
        return (
          <MdInfo className="text-pa-info mt-1 text-xl text-pa-info-icon" />
        );
      case COLOR_VARIANT.DANGER:
        return <MdCancel className="mt-1 text-xl text-pa-danger-icon" />;
      case COLOR_VARIANT.SUCCESS:
        return <MdCheckCircle className="mt-1 text-xl text-pa-success-icon" />;
      case COLOR_VARIANT.WARNING:
        return <MdInfo className="mt-1 text-xl text-pa-warning-icon" />;
      default:
        return null;
    }
  }

  return (
    <div>
      <div
        className={classNames(
          "rounded-lg border p-5 font-medium md:p-8",
          getVariantStyle(variant)
        )}
      >
        <div className="flex gap-4">
          {renderIcon()}
          <div>{title}</div>
        </div>
        {children ?? null}
      </div>
    </div>
  );
}

function getVariantStyle(variant: COLOR_VARIANT) {
  switch (variant) {
    case COLOR_VARIANT.INFO:
      return "border-pa-info-bg bg-pa-info-bg text-pa-info-text";
    case COLOR_VARIANT.DANGER:
      return "border-pa-danger-bg bg-pa-danger-bg text-pa-danger-text";
    case COLOR_VARIANT.SUCCESS:
      return "border-pa-success-bg bg-pa-success-bg text-pa-success-text";
    case COLOR_VARIANT.WARNING:
      return "border-pa-warning-bg bg-pa-warning-bg text-pa-warning-text";
    default:
      return "";
  }
}
