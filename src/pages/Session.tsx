import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Mic, MicOff, PhoneOff, Clock, User, Volume2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Session = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("id");
  const partnerName = searchParams.get("partner") || "شريك الجلسة";
  const partnerRole = searchParams.get("partnerRole") || "معلّم";

  const [muted, setMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [speakerActive, setSpeakerActive] = useState(false);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate voice activity
  useEffect(() => {
    const interval = setInterval(() => setSpeakerActive(Math.random() > 0.5), 1500);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleEndSession = async () => {
    if (sessionId) {
      await supabase
        .from("sessions")
        .update({ status: "completed" as const, ended_at: new Date().toISOString(), duration_seconds: seconds })
        .eq("id", sessionId);
    }
    navigate(`/rating?session=${sessionId}&partner=${partnerName}&partnerRole=${partnerRole}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-primary text-primary-foreground">
      <div className="text-center pt-8 pb-4">
        <div className="flex items-center justify-center gap-2 text-primary-foreground/70">
          <Clock className="w-4 h-4" />
          <span className="font-mono text-lg">{formatTime(seconds)}</span>
        </div>
        <p className="text-sm text-primary-foreground/50 mt-1">جلسة تصحيح التلاوة</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-12 px-4">
        <motion.div animate={{ scale: speakerActive ? 1.05 : 1 }} className="text-center">
          <div className="relative">
            <div className={`w-28 h-28 mx-auto rounded-full bg-primary-foreground/10 flex items-center justify-center border-4 transition-colors ${speakerActive ? "border-accent" : "border-primary-foreground/20"}`}>
              <User className="w-14 h-14 text-primary-foreground/60" />
            </div>
            {speakerActive && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1.3, opacity: 0 }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 rounded-full border-4 border-accent/40" />
            )}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-1 bg-accent text-accent-foreground px-2 py-0.5 rounded-full text-xs font-bold">
                <Volume2 className="w-3 h-3" />
                {partnerRole}
              </div>
            </div>
          </div>
          <p className="mt-4 text-lg font-semibold">{partnerName}</p>
        </motion.div>

        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary-foreground/10 flex items-center justify-center border-2 border-primary-foreground/20">
            <User className="w-10 h-10 text-primary-foreground/40" />
          </div>
          <p className="mt-2 text-sm text-primary-foreground/60">أنت</p>
        </div>
      </div>

      <div className="p-6 pb-10">
        <div className="flex items-center justify-center gap-6">
          <Button variant="outline" size="icon" className={`w-16 h-16 rounded-full border-2 ${muted ? "bg-destructive/20 border-destructive text-destructive" : "border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"}`} onClick={() => setMuted(!muted)}>
            {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
          <Button size="icon" className="w-20 h-20 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={handleEndSession}>
            <PhoneOff className="w-8 h-8" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Session;
