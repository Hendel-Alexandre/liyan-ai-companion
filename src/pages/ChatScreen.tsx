import { useState, useRef } from "react";
import { Mic, Keyboard, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChatScreen = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      setReply("");
      // Web Speech API
      if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SR();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-US";
        recognition.onresult = (e: any) => {
          const result = Array.from(e.results)
            .map((r: any) => r[0].transcript)
            .join("");
          setTranscript(result);
        };
        recognition.onend = () => {
          setIsListening(false);
        };
        recognition.start();
        recognitionRef.current = recognition;
      } else {
        setTranscript("What are the top trending collaborating interface design tools 2023");
        setTimeout(() => setIsListening(false), 3000);
      }
    }
  };

  const handleClose = () => {
    setTranscript("");
    setReply("");
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return (
    <div className="topo-pattern flex flex-col items-center min-h-screen bg-background px-5 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
      {/* Top pill */}
      <div className="mt-4 flex flex-col items-center gap-1">
        <div className="rounded-full bg-card px-4 py-1.5">
          <span className="text-[13px] font-outfit font-semibold text-lime">Liyan AI</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-lime" />
          <span className="text-[12px] font-outfit text-muted-foreground">Online</span>
        </div>
      </div>

      {/* Orb */}
      <div className="mt-12 mb-8 flex items-center justify-center">
        <div
          className={`relative h-[220px] w-[220px] rounded-full ${isListening ? "orb-listening" : "orb-idle"}`}
          style={{
            background:
              "radial-gradient(circle at 30% 30%, #a78bfa, #60a5fa, #818cf8, #c084fc, #94a3b8, rgba(204,255,0,0.15))",
            boxShadow:
              "0 0 60px rgba(167,139,250,0.3), 0 0 120px rgba(96,165,250,0.15), inset 0 0 60px rgba(255,255,255,0.1)",
          }}
        >
          <div
            className="absolute inset-2 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 60% 40%, rgba(255,255,255,0.2), transparent 60%)",
            }}
          />
        </div>
      </div>

      {/* Transcription */}
      <AnimatePresence mode="wait">
        {transcript && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-[18px] font-outfit text-foreground leading-relaxed max-w-[300px] mb-6 line-clamp-3"
          >
            {transcript.split(" ").map((word, i) => (
              <span key={i} className={i > transcript.split(" ").length - 4 ? "text-muted-foreground" : ""}>
                {word}{" "}
              </span>
            ))}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Reply card */}
      <AnimatePresence>
        {reply && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full rounded-[16px] bg-card p-4 mb-6"
          >
            <p className="text-[14px] font-outfit text-foreground leading-relaxed">{reply}</p>
            <span className="mt-2 block text-[12px] font-outfit text-muted-foreground">
              Liyan AI Response
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {isLoading && (
        <div className="flex gap-1 mb-6">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              className="h-2 w-2 rounded-full bg-lime"
            />
          ))}
        </div>
      )}

      {/* Bottom dock */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-4 rounded-full bg-card px-4 py-3">
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border">
          <Keyboard size={18} strokeWidth={1.5} className="text-foreground" />
        </button>

        <button
          onClick={toggleListening}
          className="relative flex h-16 w-16 items-center justify-center rounded-full bg-lime"
        >
          {isListening && (
            <>
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  className="absolute inset-0 rounded-full border-2 border-lime"
                  initial={{ scale: 1, opacity: 0.2 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    delay: ring * 0.3,
                    ease: "easeOut",
                  }}
                />
              ))}
            </>
          )}
          <Mic size={24} strokeWidth={1.5} className="text-primary-foreground relative z-10" />
        </button>

        <button onClick={handleClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-card border border-border">
          <X size={18} strokeWidth={1.5} className="text-foreground" />
        </button>
      </div>
    </div>
  );
};

export default ChatScreen;
