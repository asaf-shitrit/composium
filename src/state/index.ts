import { FileState } from "../model";
import baseFs from "fs";
import util from "../util";
const fs = baseFs.promises;

const getCurrantFileState = async (filePath: string): Promise<FileState> => {
  if (!(await util.checkIfFileExists(filePath))) {
    return new FileState();
  }

  const fileContent = (await fs.readFile(filePath)).toString();

  const baseFilePath = util.createBaseFilePath(filePath);
  let baseFileContent = undefined;
  if (await util.checkIfFileExists(baseFilePath)) {
    baseFileContent = (await fs.readFile(baseFilePath)).toString();
  }

  return new FileState(fileContent, baseFileContent);
};

export default {
  getCurrantFileState,
};
