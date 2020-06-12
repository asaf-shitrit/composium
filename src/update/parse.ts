export interface EnvFile {
  [key: string]: string;
}

const ParamsRegexPattern = /<.*>/g;

const parseOutNeededVersionFileParams = (fileContent: string): string[] => {
  // try to match params in the file content
  const matchArr = fileContent.match(ParamsRegexPattern) || [];

  // clean out the matches of the enclosing tags (<,>)
  const cleanParamsArr = matchArr.map((match) =>
    match.substr(1, match.length - 2)
  );

  return cleanParamsArr;
};

const parseOutEnvFile = (fileContent: string): EnvFile => {
  const splitLine = (line: string) => line.split("=");

  let envFile: EnvFile = {};
  fileContent
    .split("\n")
    .map(splitLine)
    .forEach(([key, val]) => {
      envFile[key] = val;
    });

  return envFile;
};

export default {
  parseOutEnvFile,
  parseOutNeededVersionFileParams,
};
