import main from "../src/main";
import env, { IEnvVars } from "../src/env";
import check from "../src/check";
import update from "../src/update";
import { IVersion } from "../src/version";
import config from "../src/config";
import ms from "ms";

jest.setTimeout(ms("20s"));

const delay = (ms: number) =>
  new Promise((res) => {
    setTimeout(() => {
      res();
    }, ms);
  });

const mockValidVersion: IVersion = {
  hash: "test-hash",
  version: "1.0.0",
  url: "http://test-url",
};

const createMockExitError = (code: number) =>
  new Error(`process.exit() was called with code ${code}`);

describe("testing main.ts file", () => {
  describe("testing run function", () => {
    it("should run only once when given the run once env var", async () => {
      const testInterval = ms("1s");

      const mockGetEnvVars = jest.fn();
      const mockEnvVars: IEnvVars = {
        interval: testInterval,
        filePath: "/tmp/test.yml",
        postUpdateCommand: "",
        postUpdateValidationCommand: "",
        versionsUrl: "/tmp/versions.json",
        appId: "test",
        allowMajorUpdate: false,
        updateToLatestOnNonExistant: false,
        noUpdate: false,
        runOnce: true,
      };
      mockGetEnvVars.mockReturnValueOnce(mockEnvVars);

      env.getEnvVars = mockGetEnvVars;

      const mockCheckForNewVersions = jest.fn();

      mockCheckForNewVersions.mockReturnValueOnce(Promise.resolve(undefined));
      check.checkForNewVersions = mockCheckForNewVersions;

      main.run();

      await delay(testInterval * 3);

      expect(mockGetEnvVars).toBeCalledTimes(1);
      expect(mockCheckForNewVersions).toBeCalledTimes(1);
    });
    it("should run and not perform update if no update env var is true", async () => {
      const testInterval = ms("1s");

      const mockGetEnvVars = jest.fn();
      const mockEnvVars: IEnvVars = {
        interval: testInterval,
        filePath: "/tmp/test.yml",
        postUpdateCommand: "",
        postUpdateValidationCommand: "",
        versionsUrl: "/tmp/versions.json",
        appId: "test",
        allowMajorUpdate: false,
        updateToLatestOnNonExistant: false,
        noUpdate: true,
        runOnce: true,
      };
      mockGetEnvVars.mockReturnValueOnce(mockEnvVars);

      env.getEnvVars = mockGetEnvVars;

      const mockCheckForNewVersions = jest.fn();

      mockCheckForNewVersions.mockReturnValueOnce(
        Promise.resolve(mockValidVersion)
      );
      check.checkForNewVersions = mockCheckForNewVersions;

      const performUpdateMock = jest.fn();
      performUpdateMock.mockReturnValueOnce(Promise.resolve());
      update.performUpdate = performUpdateMock;

      const mockProcessExit = jest
        .spyOn(process, "exit") //@ts-ignore
        .mockImplementation(() => {});

      main.run();

      await delay(testInterval * 3);

      expect(mockProcessExit).toBeCalledTimes(1);
      expect(mockProcessExit).toBeCalledWith(config.exitCodes.newUpdate);
      expect(mockGetEnvVars).toBeCalledTimes(1);
      expect(mockCheckForNewVersions).toBeCalledTimes(1);
      expect(update.performUpdate).not.toBeCalled();
    });
  });
});
