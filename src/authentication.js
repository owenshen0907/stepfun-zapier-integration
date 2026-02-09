'use strict';

const { normalizeApiKey } = require('./utils/apiKey');

/**
 * Authentication module for Stepfun.ai API Key.
 *
 * Type: API Key (sent as Bearer token in Authorization header)
 * Label: Stepfun.ai API Key
 * Help Text: Your Stepfun.ai API Key. You can find your API Key at
 *            https://platform.stepfun.ai/interface-key
 */

const testAuth = async (z, bundle) => {
  const apiKey = normalizeApiKey(bundle.authData.apiKey);

  // Use a lightweight endpoint to verify the API key is valid.
  const response = await z.request({
    method: 'GET',
    url: 'https://api.stepfun.ai/v1/audio/system_voices',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    params: {
      model: 'step-tts-2',
    },
  });

  if (response.status === 401) {
    throw new z.errors.Error(
      'The API Key you supplied is invalid. Please check your Stepfun.ai API Key.',
      'AuthenticationError',
      response.status
    );
  }

  return { apiKey };
};

module.exports = {
  type: 'custom',
  test: testAuth,
  fields: [
    {
      computed: false,
      key: 'apiKey',
      required: true,
      label: 'Stepfun.ai API Key',
      type: 'password',
      helpText:
        'Paste your Stepfun.ai API Key only (do not include "Bearer "). You can find your API Key at [https://platform.stepfun.ai/interface-key](https://platform.stepfun.ai/interface-key)',
    },
  ],
  connectionLabel: 'Stepfun.ai Account',
};
