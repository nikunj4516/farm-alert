import "dotenv/config";
import { runNewsFetch } from "../cron/newsCron.js";

await runNewsFetch();
