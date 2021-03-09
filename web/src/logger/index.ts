import Rollbar from 'rollbar';

export const Logger = (() => {
  const RollbarObj = new Rollbar({
    accessToken: process.env.REACT_APP_ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
  });

  const info = (msg) => {
    RollbarObj.info(msg);
  };

  const warn = (msg) => {
    RollbarObj.warn(msg);
  };

  const error = (msg) => {
    throw new Error(msg);
  };

  return { info, error, warn };
})();

export default Logger;
