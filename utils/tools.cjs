const dayjs = require("dayjs");
const { randomUUID } = require("crypto");

const uuid = () => randomUUID();

const dateValue = () => {
  return dayjs().format("YYYY-MM-DD-HH:mm:ss");
};

module.exports = {
  uuid,
  dateValue,
};
