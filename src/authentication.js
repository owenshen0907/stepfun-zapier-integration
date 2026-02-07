'use strict';

const testAuth = async (z, bundle) => {
  const response = await z.request({
    method: 'POST',
    url: 'https://api.stepfun.com/v1/audio/speech',
    headers: {
      Authorization: `Bearer ${bundle.authData.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: {
      model: 'step-tts-2',
      input: 'test',
      voice: 'cove',
      response_format: 'mp3',
    },
  });

  if (response.status === 401) {
    throw new z.errors.Error(
      'The API Key you supplied is invalid. Please check your Stepfun.ai API Key.',
      'AuthenticationError',
      response.status
    );
  }

  return { apiKey: bundle.authData.apiKey };
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
        'Your Stepfun.ai API Key. You can find your API Key at [https://platform.stepfun.ai/interface-key](https://platform.stepfun.ai/interface-key)',
    },
  ],
  connectionLabel: 'Stepfun.ai ({{apiKey}})',
};
