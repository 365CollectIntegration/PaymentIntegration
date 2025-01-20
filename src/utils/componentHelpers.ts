export function getButtonVariantClassNames(
  variant: "primary" | "secondary" | "button-light" | "button-dark",
) {
  switch (variant) {
    case "secondary":
      return "bg-white text-pa-normal border border-pa-border hover:bg-gray-100";
    case "button-light":
      return "bg-pa-button-light hover:bg-blue-800 focus:ring-blue-300";
    case "button-dark":
      return "bg-pa-button-dark hover:bg-blue-800 focus:ring-blue-300";
    // dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700
    default:
      return "bg-pa-primary hover:bg-blue-800 focus:ring-blue-300";
    // dark:bg-blue-600 dark:hover:bg-pa-primary dark:focus:ring-blue-800
  }
}

export const CLASS_LINK = "text-pa-primary font-medium";

export enum COLOR_VARIANT {
  INFO = "INFO",
  DANGER = "DANGER",
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
}

export enum FIELD_TYPE {
  NUMBER = "NUMBER",
  AMOUNT = "AMOUNT",
}
