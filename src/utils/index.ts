export const stringListToBooleanMap = (
  list: string[]
): Record<string, boolean> => {
  return list.reduce((ac, v) => ({ ...ac, [v]: true }), {});
};
