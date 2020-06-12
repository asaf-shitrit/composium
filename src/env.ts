import Joi from "@hapi/joi";
import ms from "ms";

import config from "./config";

export interface IEnvVars {
  interval: number;
  filePath: string;
  postUpdateCommand: string;
  versionsUrl: string;
  appId: string;
  allowMajorUpdate: boolean;
  updateToLatestOnNonExistant: boolean;
  runOnce: boolean;
  noUpdate: boolean;
  postUpdateValidationCommand: string;
}

export const EnvVarsScheme = Joi.object({
  // Required
  FILE_PATH: Joi.string().min(3).required(),
  VERSIONS_URL: Joi.string().required().min(3),
  APP_ID: Joi.string().required(),

  // Optional
  INTERVAL: Joi.number().min(ms("1s")).max(ms("1d")).optional(),
  POST_UPDATE_COMMAND: Joi.string().optional(),
  ALLOW_MAJOR_UPDATE: Joi.bool().optional(),
  UPDATE_TO_LATEST_ON_NON_EXISTANT: Joi.bool().optional(),
  RUN_ONCE: Joi.bool().optional(),
  NO_UPDATE: Joi.bool().optional(),
  POST_UPDATE_VALIDATION_COMMAND: Joi.string().optional(),
});

const getEnvVars = (): IEnvVars => {
  const { value, error } = EnvVarsScheme.validate(process.env, {
    allowUnknown: true,
  });

  if (error) {
    throw error;
  }

  const { envDefaults } = config;
  const {
    FILE_PATH,
    VERSIONS_URL,
    APP_ID,
    INTERVAL = envDefaults.interval,
    POST_UPDATE_COMMAND = envDefaults.postUpdateCommand,
    POST_UPDATE_VALIDATION_COMMAND = envDefaults.postUpdateValidationCommand,
    ALLOW_MAJOR_UPDATE = envDefaults.allowMajorUpdate,
    UPDATE_TO_LATEST_ON_NON_EXISTANT = envDefaults.updateToLatestOnNonExistant,
    RUN_ONCE = envDefaults.runOnce,
    NO_UPDATE = envDefaults.noUpdate,
  } = value;

  return {
    interval: INTERVAL,
    filePath: FILE_PATH,
    postUpdateCommand: POST_UPDATE_COMMAND,
    versionsUrl: VERSIONS_URL,
    appId: APP_ID,
    postUpdateValidationCommand: POST_UPDATE_VALIDATION_COMMAND,
    allowMajorUpdate: ALLOW_MAJOR_UPDATE,
    updateToLatestOnNonExistant: UPDATE_TO_LATEST_ON_NON_EXISTANT,
    runOnce: RUN_ONCE,
    noUpdate: NO_UPDATE,
  };
};

export default {
  getEnvVars,
};
