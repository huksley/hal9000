// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { slackResponse } from "@/components/slackResponse";
import { cacheImage } from "@/components/cacheFile";
import type { NextApiRequest, NextApiResponse } from "next";

import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { makeGaxiosClient } from "@/components/makeGaxiosClient";
const slackifyMarkdown = require("slackify-markdown");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const body: { response_url?: string; text?: string; command: string } =
    typeof req.body === "string" && req.body?.startsWith("{")
      ? JSON.parse(req.body)
      : req.headers["content-type"] === "application/x-www-form-urlencoded"
      ? Object.fromEntries(new URLSearchParams(req.body))
      : req.query;
  console.info("Request", body);

  if (body?.text && body?.command === "/image") {
    const reply = slackResponse(res, body, "Generating image for your prompt " + body.text, process.env.SLACK_URL);
    openai
      .createImage({
        prompt: body.text,
        n: 1,
        size: "512x512",
      })
      .then(async (response) => {
        const url = response.data.data[0].url;
        console.info("Got OpenAI response", response.data);
        if (!url) {
          reply("No image URL in OpenAI response");
          console.error("No image URL in response", response.data);
          return;
        }

        const cachedUrl = await cacheImage(url, "openai/image");
        reply([
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `You asked for an image of *${body.text}* and here it is!`,
            },
          },
          {
            type: "image",
            title: {
              type: "plain_text",
              text: "OpenAPI GPT-4 generated image",
            },
            block_id: "image4",
            image_url: cachedUrl,
            alt_text: body.text,
          },
        ]);
      })
      .catch((e) => {
        console.error("OpenAI error", e);
      });
  } else if (body?.text && (body?.command === "/ask" || body?.command === "/ask4")) {
    const start = Date.now();
    const model = body?.command === "/ask4" ? "gpt-4" : process.env.CHAT_MODEL ?? "gpt-3.5-turbo";
    const reply = slackResponse(res, body, 'Asking GPT "' + body.text + '". Model: ' + model, process.env.SLACK_URL);
    openai
      .createChatCompletion({
        model,
        temperature: 0.6,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 1024,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Current date: " + new Date().toISOString() },
          { role: "user", content: body.text },
        ] satisfies ChatCompletionRequestMessage[],
      })
      .then((response) => {
        console.info(
          "Got OpenAI response in " + Math.round((Date.now() - start) / 1000) + "s",
          JSON.stringify(response.data, null, 2)
        );
        const text = response?.data?.choices[0]?.message?.content;
        reply(text);
      });
  } else if (body?.text && body?.command === "/bard") {
    // https://console.cloud.google.com/vertex-ai/generative/language/create/chat?project=
    const start = Date.now();
    const region = process.env.GAPI_REGION ?? "us-central1";
    const model = process.env.GAPI_MODEL ?? "chat-bison";
    const projectId = process.env.GAPI_PROJECT_ID;
    const email = process.env.GAPI_SERVICE_ACCOUNT_EMAIL;
    const key = process.env.GAPI_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, "\n");
    if (email && key && projectId) {
      const reply = slackResponse(res, body, "Asking Google Vertex API " + model);
      const client = makeGaxiosClient(email, key);
      client
        .request({
          url: `https://${region}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${region}/publishers/google/models/${model}:predict`,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            instances: [
              {
                context: "You are my personal assistant.",
                examples: [],
                messages: [{ author: "user", content: body.text }],
              },
            ],
            parameters: {
              temperature: 0.2,
              maxOutputTokens: 2048,
              topP: 0.8,
              topK: 40,
            },
          }),
        })
        .then((r) => {
          const response = r.data as any;
          console.info(
            "Got Google response in " + Math.round((Date.now() - start) / 1000) + "s",
            JSON.stringify(response, null, 2)
          );

          const text = slackifyMarkdown(response.predictions[0].candidates[0].content);
          console.info("Sending reply", text);
          reply(text);
        });
    } else {
      slackResponse(res, body, "Missing GAPI credentials");
    }
  } else {
    console.log("Unknown command", typeof body.text, "'" + body.command + "'");

    res.status(200).json({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Invalid command: " + body.command + " " + body.text,
          },
        },
      ],
    });
  }
}
