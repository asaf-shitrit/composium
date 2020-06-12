import { exec } from "child_process";
import { promisify } from "util";
import util from "../util";
const promisifiedExec = promisify(exec);

/**
 * gets a file path and an external command, runs the external command
 * and check if any errors are returned by the cmd
 * @param  {string} filePath
 * @param  {string} externalCommand
 * @returns Promise
 */
const validateUpdatedFileWithExternalCommand = async (
  filePath: string,
  externalCommand: string
): Promise<boolean> => {
  const fileFolder = util.getFolderPath(filePath);
  const { stderr } = await promisifiedExec(externalCommand, {
    cwd: fileFolder,
  });
  if (stderr) {
    return false;
  }
  return true;
};

export default {
  validateUpdatedFileWithExternalCommand,
};
