'use strict';

const zapier = require('zapier-platform-core');
const App = require('../index');

const appTester = zapier.createAppTester(App);

// ============================================================
// 1. 纯本地单元测试（不需要 API Key）
// ============================================================
describe('Convert Text to Speech - Unit Tests (no API needed)', () => {

  it('should be registered as a create action', () => {
    expect(App.creates.convertTextToSpeech).toBeDefined();
    expect(App.creates.convertTextToSpeech.key).toBe('convertTextToSpeech');
    expect(App.creates.convertTextToSpeech.noun).toBe('Speech');
  });

  it('should have correct display properties', () => {
    const { display } = App.creates.convertTextToSpeech;
    expect(display.label).toBe('Convert Text Into Speech');
    expect(display.description).toContain('Stepfun.ai');
  });

  it('should define all required input fields', () => {
    const { inputFields } = App.creates.convertTextToSpeech.operation;

    // 应该有 4 个输入字段
    expect(inputFields).toHaveLength(4);

    // text 字段 — 必填
    const textField = inputFields.find((f) => f.key === 'text');
    expect(textField).toBeDefined();
    expect(textField.required).toBe(true);
    expect(textField.type).toBe('text');

    // voice 字段 — 下拉选择
    const voiceField = inputFields.find((f) => f.key === 'voice');
    expect(voiceField).toBeDefined();
    expect(voiceField.required).toBe(false);
    expect(voiceField.default).toBe('lively-girl');
    expect(voiceField.dynamic).toBe('systemVoices.id.name');

    // model 字段 — 当前仅 step-tts-2
    const modelField = inputFields.find((f) => f.key === 'model');
    expect(modelField).toBeDefined();
    expect(modelField.default).toBe('step-tts-2');
    expect(modelField.choices).toHaveProperty('step-tts-2');

    // outputFormat 字段 — 6 种格式
    const formatField = inputFields.find((f) => f.key === 'outputFormat');
    expect(formatField).toBeDefined();
    expect(formatField.default).toBe('mp3');
    const formats = Object.keys(formatField.choices);
    expect(formats).toEqual(expect.arrayContaining(['mp3', 'aac', 'flac', 'wav', 'pcm', 'opus']));
  });

  it('should define all required output fields', () => {
    const { outputFields } = App.creates.convertTextToSpeech.operation;

    const keys = outputFields.map((f) => f.key);
    expect(keys).toContain('audioUrl');
    expect(keys).toContain('text');
    expect(keys).toContain('voice');
    expect(keys).toContain('model');
    expect(keys).toContain('outputFormat');

    const audioField = outputFields.find((f) => f.key === 'audioUrl');
    expect(audioField.type).toBe('file');
  });

  it('should provide a valid sample output', () => {
    const { sample } = App.creates.convertTextToSpeech.operation;
    expect(sample).toBeDefined();
    expect(sample.audioUrl).toBeDefined();
    expect(sample.text).toBe('Hello World');
    expect(sample.voice).toBe('lively-girl');
    expect(sample.model).toBe('step-tts-2');
    expect(sample.outputFormat).toBe('mp3');
  });
});

// ============================================================
// 2. 集成测试（需要真实 API Key）
//    运行方式: STEPFUN_API_KEY=sk-xxx npm test
//    如果没有 API Key，这些测试会自动跳过
// ============================================================
describe('Convert Text to Speech - Integration Tests (requires real API key)', () => {
  zapier.tools.env.inject();

  const apiKey = process.env.STEPFUN_API_KEY;
  const deployKey = process.env.ZAPIER_DEPLOY_KEY;

  beforeAll(() => {
    if (!apiKey) {
      console.log('⚠️  Skipping integration tests: STEPFUN_API_KEY not set');
    }
    if (!deployKey) {
      console.log('⚠️  Skipping integration tests: ZAPIER_DEPLOY_KEY not set (required for z.stashFile)');
    }
  });

  const skipIfMissingEnv = apiKey && deployKey ? it : it.skip;

  skipIfMissingEnv('should create speech from text with all params', async () => {
    const bundle = {
      authData: { apiKey },
      inputData: {
        text: 'Hello World',
        voice: 'lively-girl',
        model: 'step-tts-2',
        outputFormat: 'mp3',
      },
    };

    const result = await appTester(
      App.creates.convertTextToSpeech.operation.perform,
      bundle
    );

    expect(result).toBeDefined();
    expect(result.text).toBe('Hello World');
    expect(result.voice).toBe('lively-girl');
    expect(result.model).toBe('step-tts-2');
    expect(result.outputFormat).toBe('mp3');
    expect(result.audioUrl).toBeDefined();
    expect(result.audioUrl.length).toBeGreaterThan(0);
  }, 30000); // TTS 接口可能较慢，设 30s 超时

  skipIfMissingEnv('should use default values when optional fields are omitted', async () => {
    const bundle = {
      authData: { apiKey },
      inputData: {
        text: 'Test with defaults',
      },
    };

    const result = await appTester(
      App.creates.convertTextToSpeech.operation.perform,
      bundle
    );

    expect(result).toBeDefined();
    expect(result.voice).toBe('lively-girl');
    expect(result.model).toBe('step-tts-2');
    expect(result.outputFormat).toBe('mp3');
  }, 30000);

  skipIfMissingEnv('should work with different output formats', async () => {
    const bundle = {
      authData: { apiKey },
      inputData: {
        text: 'Testing WAV format',
        voice: 'elegantgentle-female',
        model: 'step-tts-2',
        outputFormat: 'wav',
      },
    };

    const result = await appTester(
      App.creates.convertTextToSpeech.operation.perform,
      bundle
    );

    expect(result).toBeDefined();
    expect(result.outputFormat).toBe('wav');
    expect(result.voice).toBe('elegantgentle-female');
  }, 30000);
});
