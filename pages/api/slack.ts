// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const body =
    typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.headers["content-type"] === "application/x-www-form-urlencoded"
      ? Object.fromEntries(new URLSearchParams(req.body))
      : {};
  console.info("Request", body);

  if (body?.text && body?.command === "/image") {
    const response = openai
      .createImage({
        prompt: body.text,
        n: 1,
        size: "512x512",
      })
      .then((response) => {
        const url = response.data.data[0].url;
        console.info("Got OpenAI response", response.data);
        return fetch(process.env.SLACK_URL!, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            blocks: [
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
                image_url: url,
                alt_text: body.text,
              },
            ],
          }),
        });
      });

    return res.status(200).json({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "Generating image for your prompt " + body.text,
          },
        },
      ],
    });
  } else {
    console.log("Unknown command", typeof body.text, "'" + body.command + "'");
  }

  res.status(200).json({
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "Unknown command: " + body.command + " " + body.text,
        },
      },
    ],
  });
}
