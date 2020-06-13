import env, { IEnvVars } from "../src/env";

describe("test env file", () => {
  describe("getEnvVars function", () => {
    it("should return valid environment vars", () => {
      const mockEnv: IEnvVars = {
        interval: 5000,
        filePath: "/etc/cyolo",
        postUpdateCommand: "echo test",
        versionsUrl: "http://cyolo.io",
        appId: "test",
        postUpdateValidationCommand: "",
        updateToLatestOnNonExistant: true,
        allowMajorUpdate: true,
        runOnce: false,
        noUpdate: false,
      };

      process.env = {
        FILE_PATH: mockEnv.filePath,
        VERSIONS_URL: mockEnv.versionsUrl,
        APP_ID: mockEnv.appId,
        INTERVAL: mockEnv.interval.toString(),
        ALLOW_MAJOR_UPDATE: mockEnv.allowMajorUpdate.toString(),
        POST_UPDATE_COMMAND: mockEnv.postUpdateCommand,
      };

      expect(env.getEnvVars()).toStrictEqual(mockEnv);
    });
  });
});
