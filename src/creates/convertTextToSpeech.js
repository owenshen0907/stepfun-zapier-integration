'use strict';

const VOICE_CHOICES = {
  cove: 'Cove (Male)',
  maple: 'Maple (Female)',
  ember: 'Ember (Male)',
  bay: 'Bay (Male)',
  breeze: 'Breeze (Female)',
  juniper: 'Juniper (Female)',
  vale: 'Vale (Female)',
};

const OUTPUT_FORMAT_CHOICES = {
  mp3: 'MP3',
  aac: 'AAC',
  flac: 'FLAC',
  wav: 'WAV',
  pcm: 'PCM',
  opus: 'Opus',
};

const perform = async (z, bundle) => {
  const { text, voice, model, outputFormat } = bundle.inputData;

  const response = await z.request({
    method: 'POST',
    url: 'https://api.stepfun.com/v1/audio/speech',
    headers: {
      Authorization: `Bearer ${bundle.authData.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: {
      model: model || 'step-tts-2',
      input: text,
      voice: voice || 'cove',
      response_format: outputFormat || 'mp3',
    },
  });

  const result = response.json || response.data;

  if (typeof result === 'object' && result.audio_url) {
    return {
      audioUrl: result.audio_url,
      text: text,
      voice: voice || 'cove',
      model: model || 'step-tts-2',
      outputFormat: outputFormat || 'mp3',
    };
  }

  if (response.headers['content-type']?.includes('audio')) {
    const audioUrl = await z.stashFile(response, response.content.length, `speech.${outputFormat || 'mp3'}`);
    return {
      audioUrl: audioUrl,
      text: text,
      voice: voice || 'cove',
      model: model || 'step-tts-2',
      outputFormat: outputFormat || 'mp3',
    };
  }

  return {
    audioUrl: result?.url || result?.audio_url || '',
    text: text,
    voice: voice || 'cove',
    model: model || 'step-tts-2',
    outputFormat: outputFormat || 'mp3',
    rawResponse: result,
  };
};

module.exports = {
  key: 'convertTextToSpeech',
  noun: 'Speech',

  display: {
    label: 'Convert Text Into Speech',
    description: "Convert Text Into Speech using Stepfun.ai's Model (TTS)",
    important: true,
  },

  operation: {
    perform,

    inputFields: [
      {
        key: 'text',
        label: 'Text',
        type: 'text',
        required: true,
        helpText: 'The text you want to convert to speech.',
      },
      {
        key: 'voice',
        label: 'Voice',
        type: 'string',
        required: false,
        default: 'cove',
        choices: VOICE_CHOICES,
        helpText: 'Select the English voice for speech generation.',
      },
      {
        key: 'model',
        label: 'Model',
        type: 'string',
        required: false,
        default: 'step-tts-2',
        choices: {
          'step-tts-2': 'Step TTS 2',
        },
        helpText: 'Select the TTS model. Currently only step-tts-2 is supported.',
      },
      {
        key: 'outputFormat',
        label: 'Output Format',
        type: 'string',
        required: false,
        default: 'mp3',
        choices: OUTPUT_FORMAT_CHOICES,
        helpText: 'Select the output audio format.',
      },
    ],

    outputFields: [
      { key: 'audioUrl', label: 'Audio URL', type: 'string' },
      { key: 'text', label: 'Text', type: 'string' },
      { key: 'voice', label: 'Voice', type: 'string' },
      { key: 'model', label: 'Model', type: 'string' },
      { key: 'outputFormat', label: 'Output Format', type: 'string' },
    ],

    sample: {
      audioUrl: 'https://api.stepfun.com/v1/audio/files/example.mp3',
      text: 'Hello World',
      voice: 'cove',
      model: 'step-tts-2',
      outputFormat: 'mp3',
    },
  },
};
