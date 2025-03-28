export const isEqual = <T>(value1: T, value2: T): boolean => {
  if (value1 === value2) {
    return true;
  }

  if (value1 == null || value2 == null) {
    return false;
  }

  if (typeof value1 === 'object' && typeof value2 === 'object') {
    const keys1 = Object.keys(value1);
    const keys2 = Object.keys(value2);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (!keys2.includes(key) || !isEqual(value1[key], value2[key])) {
        return false;
      }
    }

    return true;
  }

  return false;
};
