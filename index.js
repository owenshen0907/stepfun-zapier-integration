const authentication = require('./src/authentication');
const systemVoices = require('./src/triggers/systemVoices');
const convertTextToSpeech = require('./src/creates/convertTextToSpeech');

// Custom HTTP middleware to add Stepfun-Zapier User-Agent header
const addCustomUserAgent = (request, z, bundle) => {
  request.headers['User-Agent'] = 'StepfunZapierIntegration/1.0.0';
  request.headers['X-Source'] = 'zapier';
  return request;
};

// Handle API error responses
const handleHTTPError = (response, z) => {
  if (response.status >= 400) {
    const errorBody = response.json || {};
    const message = errorBody.error?.message || errorBody.message || `API request failed with status ${response.status}`;
    throw new z.errors.Error(
      message,
      'ApiError',
      response.status
    );
  }
  return response;
};

module.exports = {
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication,

  beforeRequest: [addCustomUserAgent],
  afterResponse: [handleHTTPError],

  triggers: {
    [systemVoices.key]: systemVoices,
  },

  searches: {},

  creates: {
    [convertTextToSpeech.key]: convertTextToSpeech,
  },

  resources: {},
};
