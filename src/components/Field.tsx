import { ReactNode } from "react";
import numeral from "numeral";

import { FIELD_TYPE } from "@/utils/componentHelpers";
import { CURRENCY } from "@/utils/common";

type FieldProps = {
  label: string;
  value: string | ReactNode | number;
  type?: FIELD_TYPE;
  withoutBorder?: boolean;
};

type FieldsContainerProps = {
  children: ReactNode;
  className?: string;
};

export function FieldsContainer({
  className = "pt-1",
  children,
}: FieldsContainerProps) {
  return <div className={`flex flex-col gap-3 ${className}`}>{children}</div>;
}

export function FormTitle({ text }: { text: string }) {
  return (
    <div className="text-pa-normal mb-3 text-center text-xl font-bold">
      {text}
    </div>
  );
}

export function FieldSectionLabel({ text }: { text: string }) {
  return (
    <div className="text-pa-normal mt-6 text-lg font-semibold">{text}</div>
  );
}

export function Field({
  label = "",
  value = "",
  type,
  withoutBorder,
}: FieldProps) {
  function renderValue() {
    switch (type) {
      case FIELD_TYPE.AMOUNT:
      case FIELD_TYPE.NUMBER: {
        const format = FIELD_TYPE.NUMBER ? "0,0" : undefined;
        return (
          <div>
            {type === FIELD_TYPE.AMOUNT ? CURRENCY : ""}
            {typeof value === "string" || typeof value === "number"
              ? getFormattedNumber(value, format)
              : null}
          </div>
        );
      }
      default:
        return null;
    }
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className="text-sm uppercase text-pa-form-label">{label}:</div>
      <div
        className={`${
          withoutBorder ? "" : "border-b pb-1"
        } text-pa-base font-medium`}
      >
        {!type ? value ?? "N/A" : renderValue()}
      </div>
    </div>
  );
}

function getFormattedNumber(value: string | number, format: string = "0,0.00") {
  const actualValue = Number(value);

  return isNaN(actualValue) ? "-" : numeral(actualValue).format(format);
}
