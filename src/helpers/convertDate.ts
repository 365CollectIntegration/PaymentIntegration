export const convertDate = (date: string) => {
  const newDate = new Date(date);

  const formattedDate = newDate.toLocaleDateString("en-GB");
  return formattedDate;
};
