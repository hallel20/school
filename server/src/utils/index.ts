export const padToTenThousands = (num: number) => {
  return num.toString().padStart(5, "0");
};
