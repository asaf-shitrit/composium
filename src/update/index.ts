import { IVersion } from "../version";
import config from "../config";
import scheme from "./scheme";
import parse, { EnvFile } from "./parse";
import axios from "axios";
import _ from "lodash";
import baseFs from "fs";
import util from "../util";
import logger from "../logger";
import { FileState } from "../model";
const fs = baseFs.promises;

export class UpdateDesc {
  version: IVersion;
  filePath: string;

  constructor(version: IVersion, filePath: string) {
    this.version = version;
    this.filePath = filePath;
  }
}

const loadEnvFile = async (filePath: string): Promise<EnvFile> => {
  const folderPath = util.getFolderPath(filePath); // parse out folder path
  const envFilePath = `${folderPath}/${config.envFileName}`;

  if (!(await util.checkIfFileExists(envFilePath))) {
    throw new Error(`composium env file doesn't exist`);
  }
  const fileContent = (await fs.readFile(envFilePath)).toString().trim();

  // check if env file is valid
  if (!scheme.validateEnvFile(fileContent)) {
    throw new Error("env file is not valid");
  }

  const envFile = parse.parseOutEnvFile(fileContent);

  return envFile;
};

const performUpdate = async ({ version, filePath }: UpdateDesc) => {
  // get new version file content
  const { url } = version;

  // try to download to version file from the given url
  let versionFileContent: string;
  try {
    versionFileContent = (await axios.get(url)).data;
  } catch (error) {
    throw new Error("failed to download version file from url");
  }

  // freeze the version file content so it will not change
  Object.freeze(versionFileContent);

  // a mutable version file content meant to change
  // if any env params are needed/found
  let mutableVersionFileContent = _.cloneDeep(versionFileContent);

  // check if any params are required in the new file
  const requiredParams: string[] = parse.parseOutNeededVersionFileParams(
    versionFileContent
  );

  logger.verbose(`needed args are - ${JSON.stringify(requiredParams)}`);

  // check if any params are required
  if (requiredParams.length > 0) {
    logger.verbose(`${requiredParams.length} env args needed for this version`);

    // all the env args that can be used to resolve requirements
    let availableEnvArgs = {};

    // create the env file path and check if it exists
    try {
      const envFile = await loadEnvFile(filePath);

      // add all found env files to the available env args
      availableEnvArgs = { ...availableEnvArgs, ...envFile };
    } catch (error) {
      logger.warn(error.message);
    }

    // add the currant process env args
    availableEnvArgs = { ...availableEnvArgs, ...process.env };

    logger.info("parsed out all available env args");

    const envArgKeys = Object.keys(availableEnvArgs);
    const areAllArgsCovered = requiredParams.every((param) =>
      envArgKeys.includes(param)
    );

    // if any param is not covered throw
    if (!areAllArgsCovered) {
      throw new Error("some of the required version params are not supplied");
    }

    logger.info("all needed env args have been supplied");

    // replace all the params in the version file
    // TODO: can increase performance by iterating only on needed env args
    Object.entries(availableEnvArgs).forEach(([key, val]) => {
      mutableVersionFileContent = mutableVersionFileContent.replace(
        `<${key}>`,
        val as string
      );
    });
  }

  // check if a base file is needed to be written or deleted
  const baseFilePath = util.createBaseFilePath(filePath);
  if (requiredParams.length > 0) {
    // create a base file if one is needed
    await fs.writeFile(baseFilePath, versionFileContent);
  } else {
    if (await util.checkIfFileExists(baseFilePath)) {
      // delete existing base file if one is not needed
      await fs.unlink(baseFilePath);
    }
  }

  // replace the old version file with the new version file
  await fs.writeFile(filePath, mutableVersionFileContent);
  logger.info(`update file to ${version.version} version`);
};

const performRollback = async (filePath: string, previousState: FileState) => {
  const baseFilePath = util.createBaseFilePath(filePath);

  // previous state was empty, so we need to delete the currant files
  // in the rollback
  if (previousState.fileContent === undefined) {
    try {
      await fs.unlink(filePath);
      await fs.unlink(baseFilePath);
    } catch (error) {
      logger.warn(error.message);
    }
    return;
  }

  if (previousState.baseFileContent) {
    await fs.writeFile(baseFilePath, previousState.baseFileContent);
  }

  await fs.writeFile(filePath, previousState.fileContent);
};

export default {
  performUpdate,
  performRollback,
};
