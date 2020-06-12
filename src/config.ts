import ms from "ms";

export default {
  get isProd(): boolean {
    return process.env.NODE_ENV === "production";
  },
  envDefaults: {
    postUpdateCommand: "",
    postUpdateValidationCommand: "",
    interval: ms("5s"),
    allowMajorUpdate: false,
    updateToLatestOnNonExistant: true,
    runOnce: false,
    noUpdate: false,
  },
  exitCodes: {
    allGood: 0,
    generalError: 1,
    newUpdate: 80,
    noNewUpdate: 81,
    performedRollbackOnInvalidVersion: 82,
  },
  envFileName: ".composium-env",
};
