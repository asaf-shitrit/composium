import _ from 'lodash'
import baseFs from "fs";
const fs = baseFs.promises;

const getFolderPath = (filePath: string) => {
    return filePath.split('/').slice(0, -1).join('/') || '.'
}

const getFileNameFromPath = (filePath: string) => {
    return filePath.split('/').slice(-1)[0]
}

const createBaseFilePath = (versionFilePath: string) => {

    // get the version file name and folder path
    const folderPath = getFolderPath(versionFilePath)
    const versionFileName = getFileNameFromPath(versionFilePath)

    // split the version file name to its bare name and suffix
    const [name, suffix] = versionFileName.split('.')

    // create a base file name while ensuring all parts
    // of it are not undefined
    const isNotUndefined = (val: string) => val !== undefined
    const baseFileName = [name, 'base', suffix].filter(isNotUndefined).join('.')
    return `${folderPath}/${baseFileName}`
}

const checkIfFileExists = async (filePath: string) => {
    try {
        await fs.access(filePath);
        return true;
      } catch (error) {
        return false;
      }
}

export default {
    getFolderPath,
    getFileNameFromPath,
    createBaseFilePath,
    checkIfFileExists
}