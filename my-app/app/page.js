import Chat from "../app/components/chat";
import MusicGenerator  from "../app/components/MusicGenerator";
import VideoGenerator  from "../app/components/VideoGenerator";
import ChatGenerator  from "../app/components/ChatGenerator";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* <Chat />
      <MusicGenerator />
      <VideoGenerator /> */}
      <ChatGenerator />
    </main>
  );
}
