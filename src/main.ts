import env from "./env";
import check from "./check";
import logger from "./logger";
import update, { UpdateDesc } from "./update";
import { EventEmitter } from "events";
import { exec } from "child_process";
import util from "./util";
import { promisify } from "util";
import config from "./config";
import state from "./state";
import validator from "./validator";
import { FileState } from "./model";

let filterEvents = false;

const promisifiedExec = promisify(exec);

const run = () => {
  const appEventEmitter = new EventEmitter();

  const {
    interval,
    appId,
    versionsUrl,
    filePath,
    allowMajorUpdate,
    postUpdateCommand,
    updateToLatestOnNonExistant,
    runOnce,
    noUpdate,
    postUpdateValidationCommand,
  } = env.getEnvVars();
  logger.info("loaded env vars");

  appEventEmitter.on("check", () => {
    logger.verbose("got check event");

    if (filterEvents) return;

    setImmediate(async () => {
      // perform version check
      const newVersion = await check.checkForNewVersions(
        appId,
        filePath,
        versionsUrl,
        allowMajorUpdate,
        updateToLatestOnNonExistant
      );

      // check if the service is required to run once and not update
      if (noUpdate && runOnce) {
        // in case it is exit with the relevent status codes
        process.exit(
          newVersion ? config.exitCodes.newUpdate : config.exitCodes.noNewUpdate
        );
        return;
      }

      // check if the no update override is defined
      if (noUpdate) {
        // if it is, return early
        return;
      }

      // check if the new version is not undefined
      if (newVersion === undefined) {
        // if run once was specified explicity log that no update was foun
        if (runOnce) {
          logger.info("no update was found.");
        }
        // if it is return early
        return;
      }

      // emit the new update event
      appEventEmitter.emit("update", new UpdateDesc(newVersion, filePath));
    });
  });

  appEventEmitter.on("update", (updateDesc: UpdateDesc) => {
    logger.verbose("got update event");

    setImmediate(async () => {
      let previousState: FileState;

      try {
        // get the previous state before update for rollback feature
        previousState = await state.getCurrantFileState(filePath);

        // perform the actual update
        await update.performUpdate(updateDesc);
      } catch (error) {
        logger.error(error.message);
        return;
      }

      // check if validation is provided
      if (postUpdateValidationCommand) {
        appEventEmitter.emit("validate", previousState);
        return;
      }
      appEventEmitter.emit("update-done");
    });
  });

  appEventEmitter.on("validate", (previousFileState: FileState) => {
    logger.verbose("got new validation request for update");
    setImmediate(async () => {
      // check if the new file is valid
      const isValid = await validator.validateUpdatedFileWithExternalCommand(
        filePath,
        postUpdateValidationCommand
      );

      // if the new file is not valid, rollback to old file
      if (!isValid) {
        appEventEmitter.emit("rollback", previousFileState);
        return;
      }

      // if the file is valid mark the update as done
      appEventEmitter.emit("update-done");
    });
  });

  appEventEmitter.on("rollback", (previousFileState: FileState) => {
    setImmediate(async () => {
      try {
        await update.performRollback(filePath, previousFileState);
        logger.info("performed rollback successfully");
        process.exit(config.exitCodes.performedRollbackOnInvalidVersion);
        return;
      } catch (error) {
        logger.crit(error.message);
      }
    });
  });

  appEventEmitter.on("update-done", () => {
    logger.verbose("got update done event");

    if (!postUpdateValidationCommand) {
    }

    filterEvents = false;

    if (!postUpdateCommand) {
      logger.verbose("no post update command given");
      return;
    }

    setImmediate(async () => {
      try {
        const { stdout, stderr } = await promisifiedExec(postUpdateCommand, {
          cwd: util.getFolderPath(filePath),
        });
        logger.verbose(stdout);
        logger.verbose(stderr);
      } catch (error) {
        logger.error(error.message);
      }
    });
  });

  if (runOnce) {
    appEventEmitter.emit("check");
    return;
  }

  setInterval(() => appEventEmitter.emit("check"), interval);
};

export default {
  run,
};
