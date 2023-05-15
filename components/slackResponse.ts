import { NextApiResponse } from "next";
import { init } from "next/dist/compiled/@vercel/og/satori";

type SlackReply = string | unknown[];

export const slackResponse = (
  res: NextApiResponse,
  command: { response_url?: string },
  initialMessage?: SlackReply,
  defaultUrl?: string
) => {
  const url = command.response_url ?? defaultUrl;

  console.info("Sending initial response", initialMessage);
  res.status(200).json({
    blocks: Array.isArray(initialMessage)
      ? initialMessage
      : [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: initialMessage ?? "Processing, please wait...",
            },
          },
        ],
  });

  return (text?: SlackReply) => {
    if (!url) {
      console.warn("No response_url or defaultUrl provided, not sending slack response", text);
      return res;
    }

    return fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        response_type: "in_channel",
        replace_original: false,
        blocks: Array.isArray(initialMessage)
          ? initialMessage
          : [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: text ?? "Empty response",
                },
              },
            ],
      }),
    });
  };
};
