'use strict';

const zapier = require('zapier-platform-core');
const App = require('../index');

const appTester = zapier.createAppTester(App);

// ============================================================
// 1. 纯本地单元测试（不需要 API Key，任何时候都能跑）
// ============================================================
describe('Authentication - Unit Tests (no API needed)', () => {

  it('should include custom User-Agent header in requests', () => {
    const request = { headers: {} };
    const modifiedRequest = App.beforeRequest[0](request, {}, {});

    expect(modifiedRequest.headers['User-Agent']).toBe('StepfunZapierIntegration/1.0.0');
    expect(modifiedRequest.headers['X-Source']).toBe('zapier');
  });

  it('should have correct authentication field config', () => {
    expect(App.authentication.type).toBe('custom');
    expect(App.authentication.fields).toHaveLength(1);

    const apiKeyField = App.authentication.fields[0];
    expect(apiKeyField.key).toBe('apiKey');
    expect(apiKeyField.required).toBe(true);
    expect(apiKeyField.type).toBe('password');
    expect(apiKeyField.label).toBe('Stepfun.ai API Key');
    expect(apiKeyField.helpText).toContain('https://platform.stepfun.ai/interface-key');
  });

  it('should handle HTTP errors via afterResponse middleware', () => {
    const mockZ = {
      errors: {
        Error: class extends Error {
          constructor(message, code, status) {
            super(message);
            this.code = code;
            this.status = status;
          }
        },
      },
    };

    // 正常 200 响应应该直接返回
    const okResponse = { status: 200, json: {} };
    expect(App.afterResponse[0](okResponse, mockZ)).toBe(okResponse);

    // 401 响应应该抛异常
    const errorResponse = {
      status: 401,
      json: { error: { message: 'Invalid API key' } },
    };
    expect(() => App.afterResponse[0](errorResponse, mockZ)).toThrow('Invalid API key');

    // 没有 error.message 时的 fallback
    const genericError = { status: 500, json: {} };
    expect(() => App.afterResponse[0](genericError, mockZ)).toThrow('API request failed with status 500');
  });
});

// ============================================================
// 2. 集成测试（需要真实 API Key，用 .env 文件配置）
//    运行方式: STEPFUN_API_KEY=sk-xxx npm test
//    如果没有 API Key，这些测试会自动跳过
// ============================================================
describe('Authentication - Integration Tests (requires real API key)', () => {
  zapier.tools.env.inject();

  const apiKey = process.env.STEPFUN_API_KEY;

  beforeAll(() => {
    if (!apiKey) {
      console.log('⚠️  Skipping integration tests: STEPFUN_API_KEY not set');
    }
  });

  const skipIfNoKey = apiKey ? it : it.skip;

  skipIfNoKey('should authenticate with valid API key', async () => {
    const bundle = {
      authData: { apiKey },
    };

    const result = await appTester(App.authentication.test, bundle);
    expect(result).toBeDefined();
    expect(result.apiKey).toBe(apiKey);
  });
});
