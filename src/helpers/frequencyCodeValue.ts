export const frequencyCodeValue = (value: number) => {
  switch (value) {
    case 278510002:
      return "Weekly";
    case 278510004:
      return "One of";
    case 278510000:
      return "Fortnightly";
    case 278510001:
      return "Monthly";
    default:
      return "N/A";
  }
};
