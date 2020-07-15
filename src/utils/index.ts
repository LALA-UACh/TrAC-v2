export const stringListToBooleanMap = (
  list: string[]
): Record<string, boolean> => {
  return list.reduce((ac, v) => ({ ...ac, [v]: true }), {});
};

export const trimEveryLine = (str: string) =>
  str
    .split("\n")
    .map((v) => v.trim())
    .join("\n")
    .trim();
