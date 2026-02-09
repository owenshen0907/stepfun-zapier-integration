'use strict';

const { normalizeApiKey } = require('../utils/apiKey');

/**
 * Action: Convert Text Into Speech
 *
 * Converts text to speech using Stepfun.ai's TTS model.
 *
 * Input Fields:
 *   - text:          The text to convert to speech
 *   - voice:         English voice selection (dropdown)
 *   - model:         Model selection (currently only step-tts-2)
 *   - outputFormat:  Output audio format (MP3, AAC, FLAC, WAV, PCM, Opus)
 *
 * Output:
 *   - audioUrl:      URL to the generated audio file (valid for 1 hour)
 *   - text:          The input text
 *   - voice:         The voice used
 *   - model:         The model used
 */

// Supported output formats
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
  const apiKey = normalizeApiKey(bundle.authData.apiKey);
  const selectedVoice = voice || 'lively-girl';

  const response = await z.request({
    method: 'POST',
    url: 'https://api.stepfun.ai/v1/audio/speech',
    raw: true,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: {
      model: model || 'step-tts-2',
      input: text,
      voice: selectedVoice,
      response_format: outputFormat || 'mp3',
    },
  });

  const contentType =
    (typeof response.getHeader === 'function' && response.getHeader('content-type')) ||
    (response.headers && typeof response.headers.get === 'function' && response.headers.get('content-type')) ||
    '';

  // When the API returns binary audio, stash it and return a file URL for downstream Zap steps.
  if (contentType.includes('audio') || contentType.includes('octet-stream')) {
    const extension = outputFormat || 'mp3';
    const audioUrl = await z.stashFile(
      response,
      undefined,
      `speech.${extension}`,
      contentType || `audio/${extension}`
    );
    return {
      audioUrl: audioUrl,
      text: text,
      voice: selectedVoice,
      model: model || 'step-tts-2',
      outputFormat: outputFormat || 'mp3',
    };
  }

  // Fallback: some API variants return JSON containing an audio URL.
  let result = {};
  try {
    result = await response.json();
  } catch (error) {
    result = {};
  }

  if (typeof result === 'object' && (result.audio_url || result.url)) {
    return {
      audioUrl: result.audio_url || result.url,
      text: text,
      voice: selectedVoice,
      model: model || 'step-tts-2',
      outputFormat: outputFormat || 'mp3',
    };
  }

  throw new z.errors.Error(
    'Stepfun API did not return audio content or an audio URL.',
    'ApiError',
    response.status
  );
};

module.exports = {
  key: 'convertTextToSpeech',
  noun: 'Speech',

  display: {
    label: 'Convert Text Into Speech',
    description: "Convert Text Into Speech using Stepfun.ai's Model (TTS)",
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
        default: 'lively-girl',
        dynamic: 'systemVoices.id.name',
        helpText: 'Select the voice for speech generation.',
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
      { key: 'audioUrl', label: 'Audio File', type: 'file' },
      { key: 'text', label: 'Text', type: 'string' },
      { key: 'voice', label: 'Voice', type: 'string' },
      { key: 'model', label: 'Model', type: 'string' },
      { key: 'outputFormat', label: 'Output Format', type: 'string' },
    ],

    sample: {
      audioUrl: 'https://api.stepfun.ai/v1/audio/files/example.mp3',
      text: 'Hello World',
      voice: 'lively-girl',
      model: 'step-tts-2',
      outputFormat: 'mp3',
    },
  },
};
