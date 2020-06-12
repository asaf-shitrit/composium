import md5 from "md5";
import baseFs from "fs";
const fs = baseFs.promises;

import version, { IVersion } from "./version";
import logger from "./logger";
import util from "./util";

const checkForNewVersions = async (
  appId: string,
  filePath: string,
  versionsUrl: string,
  allowMajorUpdates: boolean,
  updateToLatestOnNonExistant: boolean
) : Promise<IVersion | undefined> => {
  //TODO: catch error
  const appVersions = await version.getVersionsFile(appId, versionsUrl);

  // try to determine if we need to hash the base file
  // or the versions file by checking if a base file exists
  let fileToHashPath: string | undefined;
  if(await util.checkIfFileExists(filePath)){
    fileToHashPath = filePath
  }

  const baseFilePath = util.createBaseFilePath(filePath)
  if (await util.checkIfFileExists(baseFilePath)) {
    fileToHashPath = baseFilePath;
  }

  if(!fileToHashPath){
    // file is non existant

    if(!updateToLatestOnNonExistant){
      // don't update to latest on non existant override
      logger.verbose("no updating to latest on non existant")
      return;
    }

    logger.warn("no file was found at given path");
    return appVersions.getLatestVersion()
  }

  // create a hash of the versions/base file
  const currantFileContent = (await fs.readFile(fileToHashPath)).toString();
  const currantFileHash = md5(currantFileContent);

  // get currant file version using the existing file hash
  const fileVersion = appVersions.getVersionByFileHash(currantFileHash);

  //TODO: refactor this nicely

  // if no file version exists update to the latest version available
  if (!fileVersion) {
    logger.warn("no file version found updating to latest version");
    return appVersions.getLatestVersion()
  }

  // check if new update is available
  if (appVersions.isThereNewUpdate(fileVersion, allowMajorUpdates)) {
    logger.info("found new file version");
    return appVersions.getLatestVersion(
      fileVersion,
      allowMajorUpdates
    );
  }

  // no updates have been found
  logger.verbose("no new updates found");
  return undefined;
};

export default {
  checkForNewVersions,
};
