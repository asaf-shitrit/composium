import { v4 as uuid } from 'uuid'
import winston, { format } from 'winston'
const { timestamp, combine, json, prettyPrint } = format;
import config from './config';

const globalId = uuid()

const serverId = format((info) => {
  info.serverId = globalId
  return info
})

const sessionId = format((info) => {
  info.sessionId = uuid()
  return info;
});

let formats = [prettyPrint(),json()]
if(config.isProd){
  formats = [serverId(),sessionId(),timestamp(),prettyPrint(),json()]
}


const logger = winston.createLogger({
  level: config.isProd ? 'info' : 'verbose',
  format: combine(...formats),
  defaultMeta: { service: 'composium' },
});

logger.add(new winston.transports.Console({
  format: winston.format.simple(),
}));

export default logger;