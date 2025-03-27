export const reject = <T>(array: T[], predicate: T): T[] => {
  return array.filter((item) => item !== predicate);
};
