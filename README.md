# HAL9000

Connects OpenAI GPT and other generative models to Slack.

### Supported commands

Every command should be added to Slack app. SLACK_URL is the incoming webhook to return responses.

`/image => /api/slack`

Generates images from a given prompt.

`/ask => /api/slack`

Generates text from a given prompt. Uses gpt-3.5-turbo or any model you have in set env var `CHAT_MODEL`.

`/ask4 => /api/slack`

Generates text from a given prompt. Uses gpt-4 model.

`/bard => /api/slack`

Generates text using [Vertex AI](https://cloud.google.com/vertex-ai) and [chat-bison model i.e. Bard](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/models)
