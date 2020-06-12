class FileState {
  fileContent?: string;
  baseFileContent?: string;

  constructor(fileContent?: string, baseFileContent?: string) {
    this.fileContent = fileContent;
    this.baseFileContent = baseFileContent;
  }
}

export default FileState;
