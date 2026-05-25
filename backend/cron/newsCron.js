import "dotenv/config";
import cron from "node-cron";
import { RssFetcherService } from "../services/rssFetcherService.js";
import { logger } from "../utils/logger.js";

let running = false;

export const runNewsFetch = async () => {
  if (running) {
    logger.warn("News fetch skipped because a previous run is still active.");
    return [];
  }

  running = true;
  try {
    logger.info("Starting agriculture news fetch.");
    const results = await RssFetcherService.fetchAll();
    logger.info("Agriculture news fetch completed.", { results });
    return results;
  } catch (error) {
    logger.error("Agriculture news fetch crashed.", { error: error.message });
    throw error;
  } finally {
    running = false;
  }
};

const schedule = process.env.NEWS_FETCH_CRON || "*/30 * * * *";

if (process.argv[1]?.endsWith("newsCron.js")) {
  if (process.env.NEWS_FETCH_ON_START === "true") {
    await runNewsFetch();
  }

  cron.schedule(schedule, runNewsFetch, {
    timezone: "Asia/Kolkata",
  });

  logger.info("Agriculture news cron scheduled.", { schedule });
}
