const EnvFileLineRegex = /^[A-Za-z0-9_-]*=.*$/

const validateEnvFile = (fileContent: string) : boolean => {
    return fileContent.split('\n').every(line => line.match(EnvFileLineRegex) !== null)
}

export default {
    validateEnvFile
}