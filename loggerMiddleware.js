export const logAction = (message, payload = {}) => {
  const log = {
    time: new Date().toISOString(),
    message,
    ...payload
  };
  console.table(log);
};

