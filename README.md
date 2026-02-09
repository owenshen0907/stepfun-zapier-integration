# Stepfun Zapier Integration

Stepfun.ai Text-to-Speech (TTS) 的 Zapier CLI Integration。

## 功能概览

- Authentication: 使用 Stepfun API Key
- Action: `Convert Text Into Speech`
- 支持声音: 通过 `GET /v1/audio/system_voices?model=step-tts-2` 动态获取
- 支持输出格式: `mp3`, `aac`, `flac`, `wav`, `pcm`, `opus`
- 返回 `audioUrl`（音频临时 URL）

## 开发与发布流程总结（TL;DR）

> 建议使用 `zapier-platform` 命令。  
> 旧命令 `zapier` 目前仍可用，但已收到 CLI deprecation 提示。

### 阶段 1：本地开发

```bash
npm install
npm test
```

- 本地先保证测试通过，再进入推送阶段。
- 如果要跑真实接口测试，需配置 `STEPFUN_API_KEY`。

### 阶段 2：推送私有版本到 Zapier（仅自己可见）

```bash
zapier-platform login --sso
zapier-platform validate
zapier-platform push
```

- 首次需要 `register`（只做一次）。
- 推送成功后，到 Zapier Editor 里创建 Zap 做端到端测试。

### 阶段 3：邀请内测用户

```bash
zapier-platform invite user@example.com 1.0.0
# 或生成邀请链接
zapier-platform invite --url
```

- 被邀请用户可使用该集成，但未公开到目录搜索。

### 阶段 4：提交公开审核

```bash
zapier-platform promote 1.0.0
```

- 首次公开会进入 Zapier 审核流程。
- 若提示条款未同意，先到 `https://zapier.com/app/developer` 接受最新开发者条款。

## 关键注意事项（发布前请逐项确认）

### 账号与权限

- 使用 Google/SSO 登录时，不需要 Zapier 密码，使用 Deploy Key 即可。
- 确认你对该 Integration 有写权限（`integrations` 列表可见）。

### 配置与环境变量

- 区分本地 `.env` 与 Zapier 云端环境变量：两边都要配。
- 推荐设置：
  - `STEPFUN_API_KEY`（Zapier 运行时调用接口）
- 推送后建议执行：
  - `zapier-platform env:get 1.0.0` 检查变量是否生效。

### 接口与字段设计

- 当前域名统一使用：`https://api.stepfun.ai`。
- `audioUrl` 在 Zapier 中应作为 `file` 类型输出，便于下游步骤直接消费文件。
- `voice` 建议走动态下拉（`system_voices`），避免硬编码失效。

### 测试与排错

- `validate` 通过不代表业务一定正确，必须在 Editor 真机测试一次完整 Zap。
- 常见问题优先检查：
  - Authentication 是否使用正确 Bearer Key。
  - Action 输入字段映射是否正确（例如 `text` 不是预期值）。
  - 上游步骤是否传入了错误样例文本。
- 常用排障命令：
  - `zapier-platform logs --type=http`
  - `zapier-platform logs --type=console`

### 发布与运营

- 发布前准备好外部文档（用户使用说明、FAQ、错误码说明）。
- 提前准备 Zap 模板，减少审核后冷启动成本。
- 先邀请内部/种子用户小范围验证，再 promote 公测更稳妥。

## App 信息

| 字段 | 值 |
|---|---|
| App Name | `Text To Speech By Stepfun.ai` |
| Noun | `Speech` |
| Key | `App236332` |
| 当前版本 | `1.0.0` |

## 1. 本地开发与测试（提交 Zapier 前）

### 前置要求

- Node.js `>=18`
- npm
- Zapier CLI: `npm install -g zapier-platform-cli`

### 安装依赖

```bash
npm install
```

### 运行测试（不需要 API Key）

```bash
npm test
```

### 运行集成测试（需要真实 Stepfun Key）

```bash
cp .env.example .env
# 编辑 .env，填入真实 KEY
STEPFUN_API_KEY=sk-xxxx npm test
```

## 2. 推送到 Zapier（私有，仅你可见）

### 2.1 登录 Zapier CLI（Google/SSO 账号）

```bash
zapier login --sso
```

CLI 会提示去以下页面生成 Deploy Key，然后粘贴回终端：

`https://developer.zapier.com/partner-settings/deploy-keys/`

### 2.2 首次注册 App（只做一次）

```bash
zapier register "Text To Speech By Stepfun.ai" \
  --desc "Convert text into natural speech with Stepfun.ai." \
  --url "https://www.stepfun.com" \
  --audience private \
  --role employee \
  --category ai-content-generation
```

### 2.3 校验 + 推送

```bash
zapier validate
zapier push
```

### 2.4 配置线上环境变量

```bash
zapier env:set 1.0.0 STEPFUN_API_KEY=sk-xxxx
zapier env:get 1.0.0
```

### 2.5 私有版本验证

1. 打开 Zapier 编辑器创建一个 Zap
2. 搜索 `Text To Speech By Stepfun.ai`
3. 配置 Authentication（填写你的 Stepfun API Key）
4. 配置 Action `Convert Text Into Speech`
5. 测试输出是否返回 `audioUrl`

## 3. 详细使用方式（Zap 内）

### Authentication

- 类型: API Key
- 字段: `apiKey`
- 校验方式: 请求 `GET https://api.stepfun.ai/v1/audio/system_voices?model=step-tts-2`

### Action: Convert Text Into Speech

输入字段：

| 字段 | 必填 | 默认值 | 说明 |
|---|---|---|---|
| `text` | 是 | 无 | 要转换的文本 |
| `voice` | 否 | `lively-girl` | 声音 |
| `model` | 否 | `step-tts-2` | 模型 |
| `outputFormat` | 否 | `mp3` | 音频格式 |

输出字段：

| 字段 | 说明 |
|---|---|
| `audioUrl` | 音频地址 |
| `text` | 输入文本 |
| `voice` | 实际使用声音 |
| `model` | 实际使用模型 |
| `outputFormat` | 实际输出格式 |

### 常见 Zap 用法

1. Trigger（例如表单提交/Notion 新记录）
2. Action: `Text To Speech By Stepfun.ai -> Convert Text Into Speech`
3. 后续 Action：发送 `audioUrl` 到 Slack、邮件、Webhook 或存储系统

## 4. 提交给 Zapier 官方审核上线（公开）

先确认：

- `zapier push` 已成功
- 核心功能在 Zapier 编辑器测试通过
- 文档可用（本 README + 外部帮助中心）
- 已上传 Logo（可使用 `assets/stepfun-logo-512.png`）
- 已准备后续模板和运营材料

### 4.1 同意开发者条款（必须）

如果 `zapier promote` 提示 `U001`，先打开并同意最新开发者条款：

`https://zapier.com/app/developer`

### 4.2 提交公开版本

```bash
zapier promote 1.0.0
```

首次公开通常会触发审核流程，CLI 可能返回需要填写的审核信息链接。

### 4.3 查看审核/任务状态

```bash
zapier jobs
zapier history
zapier versions
```

## 5. 内测分发（公开前可选）

```bash
zapier invite user@example.com 1.0.0
zapier invite --url
```

## 6. 常用命令速查

```bash
# 本地
npm install
npm test

# Zapier
zapier login --sso
zapier register "Text To Speech By Stepfun.ai"
zapier validate
zapier push
zapier env:set 1.0.0 STEPFUN_API_KEY=sk-xxxx
zapier env:get 1.0.0
zapier versions
zapier promote 1.0.0
zapier jobs
zapier logs --type=http
zapier logs --type=console
```

## 项目结构

```text
stepfun-zapier-integration/
├── index.js
├── src/
│   ├── authentication.js
│   └── creates/
│       └── convertTextToSpeech.js
├── test/
│   ├── authentication.test.js
│   └── creates.test.js
├── CHANGELOG.md
├── package.json
├── .env.example
└── README.md
```
