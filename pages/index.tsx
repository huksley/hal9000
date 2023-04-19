import Image from "next/image";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main className={"flex min-h-screen flex-col items-center justify-center p-24 " + inter.className}>
      <div className="relative flex place-items-center before:absolute">
        <span className="relative text-xl">HAL9000 - Connects Slack commands to large language models, ChatGPT or GPT-4</span>
      </div>
    </main>
  );
}
