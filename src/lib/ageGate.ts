export const MINIMUM_ACCOUNT_AGE = 18;
export const MINIMUM_BIRTH_YEAR = 1900;

const padDatePart = (value: number) => String(value).padStart(2, "0");

export const toDateInputValue = (date: Date) =>
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;

export const getAdultBirthDateLimit = (referenceDate = new Date()) => {
  const limit = new Date(referenceDate);
  limit.setFullYear(limit.getFullYear() - MINIMUM_ACCOUNT_AGE);
  return toDateInputValue(limit);
};

export const getMinimumBirthDate = () => `${MINIMUM_BIRTH_YEAR}-01-01`;

export const isAdultBirthDate = (birthDate: string, referenceDate = new Date()) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return false;
  }

  const parsedDate = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) {
    return false;
  }

  const year = parsedDate.getFullYear();
  if (year < MINIMUM_BIRTH_YEAR) {
    return false;
  }

  return birthDate <= getAdultBirthDateLimit(referenceDate);
};
