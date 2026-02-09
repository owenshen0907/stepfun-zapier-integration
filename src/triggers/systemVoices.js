'use strict';

const { normalizeApiKey } = require('../utils/apiKey');

const perform = async (z, bundle) => {
  const apiKey = normalizeApiKey(bundle.authData.apiKey);

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

  const voices = response.json?.voices || [];
  return voices.map((voice) => ({
    id: voice,
    name: voice,
  }));
};

module.exports = {
  key: 'systemVoices',
  noun: 'Voice',
  display: {
    label: 'List System Voices',
    description: 'Internal trigger for loading voice options.',
    hidden: true,
  },
  operation: {
    perform,
    outputFields: [
      { key: 'id', label: 'Voice ID' },
      { key: 'name', label: 'Voice Name' },
    ],
    sample: {
      id: 'lively-girl',
      name: 'lively-girl',
    },
  },
};
