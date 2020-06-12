require("dotenv").config();
import logger from "./logger";
import main from './main';

try {
  logger.info("starting up composium");
  main.run();
} catch (error) {
  logger.error(error.message);
  process.exit(1);
}
