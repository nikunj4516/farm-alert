const format = (level, message, meta = {}) =>
  JSON.stringify({
    level,
    message,
    ...meta,
    timestamp: new Date().toISOString(),
  });

export const logger = {
  info: (message, meta) => console.log(format("info", message, meta)),
  warn: (message, meta) => console.warn(format("warn", message, meta)),
  error: (message, meta) => console.error(format("error", message, meta)),
};
