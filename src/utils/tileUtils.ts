const parseTimeToMinutes = (input: string): number => {
  const match = input.match(/(\d{1,2})[.:](\d{2})\s*(am|pm)/i);

  if (!match) {
    throw new Error("Invalid time format. Expected '9.00 am' or '1.00 pm'");
  }

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toLowerCase();

  let totalMinutes = (period === "pm" ? (hours % 12) + 12 : hours % 12) * 60 + minutes;

  return totalMinutes;
};

const TimeUtils = {
  parseTimeToMinutes,
};

export default TimeUtils;
