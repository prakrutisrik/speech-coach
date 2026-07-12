import { SpeechCoachHome } from "@/components/SpeechCoachHome";
import { getRandomPrompt } from "@/data/prompts";

export default function Home() {
  return <SpeechCoachHome initialPrompt={getRandomPrompt()} />;
}
