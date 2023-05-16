import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main className={"flex min-h-screen flex-col items-center justify-center p-24 " + inter.className}>
      <div className="relative flex flex-col gap-16 place-items-center before:absolute">
        {/* https://codepen.io/giana/pen/XmjOBG */}
        <div className="base">
          <div className="lens">
            <div className="reflections"></div>
          </div>
          <div className="animation"></div>
        </div>
        <h1 className="relative text-xl">HAL9000</h1>
        <span className="relative text-xl">
          Connects Slack commands to large language models, ChatGPT or GPT-4 and Google Vertex AI chat-bard.
        </span>
        <span className="relative text-xl">
          <a href="https://github.com/huksley/hal9000">https://github.com/huksley/hal9000</a>
        </span>
      </div>
    </main>
  );
}
