import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, X, Star, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Matchmaking = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const type = (searchParams.get("type") || "correction") as "correction" | "memorization";
  const [searching, setSearching] = useState(true);
  const [found, setFound] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [matchedUser, setMatchedUser] = useState<{ id: string; name: string; rating: number; role: string } | null>(null);
  const [queueId, setQueueId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile || !searching) return;

    // Join the queue
    const joinQueue = async () => {
      // Determine what role we're seeking
      const roleSeeking = profile.role === "teacher" ? "student" : profile.role === "student" ? "teacher" : "both";

      // Check for existing match first
      const { data: existingMatch } = await supabase
        .from("matchmaking_queue")
        .select("*, profiles(*)")
        .eq("gender", profile.gender)
        .eq("session_type", type)
        .neq("profile_id", profile.id)
        .limit(1)
        .maybeSingle();

      if (existingMatch && existingMatch.profiles) {
        // Found a match! Remove their queue entry
        await supabase.from("matchmaking_queue").delete().eq("id", existingMatch.id);
        const p = existingMatch.profiles as any;
        setMatchedUser({ id: p.id, name: p.name, rating: Number(p.rating), role: p.role === "teacher" ? "معلّم" : "طالب" });
        setSearching(false);
        setFound(true);
        return;
      }

      // No match, add ourselves to queue
      const { data: entry } = await supabase
        .from("matchmaking_queue")
        .insert({
          profile_id: profile.id,
          gender: profile.gender,
          role_seeking: roleSeeking,
          session_type: type,
        })
        .select()
        .single();

      if (entry) setQueueId(entry.id);
    };

    joinQueue();

    // Listen for someone matching with us (they delete our queue entry)
    const channel = supabase
      .channel("matchmaking")
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "matchmaking_queue" }, async (payload) => {
        if (payload.old && (payload.old as any).profile_id === profile.id) {
          // Someone matched with us - but we need to find who
          // For now, show a generic match
          setSearching(false);
          setFound(true);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, searching]);

  // Timer
  useEffect(() => {
    if (!searching) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [searching]);

  const handleCancel = async () => {
    if (queueId) {
      await supabase.from("matchmaking_queue").delete().eq("id", queueId);
    }
    navigate("/home");
  };

  const handleStartSession = async () => {
    if (!profile || !matchedUser) return;
    // Create a session
    const isTeacher = profile.role === "teacher" || profile.role === "both";
    const { data: session, error } = await supabase
      .from("sessions")
      .insert({
        teacher_id: isTeacher ? profile.id : matchedUser.id,
        student_id: isTeacher ? matchedUser.id : profile.id,
        session_type: type,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "خطأ", description: "تعذر إنشاء الجلسة", variant: "destructive" });
      return;
    }

    navigate(`/session?id=${session.id}&partner=${matchedUser.name}&partnerRole=${matchedUser.role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background islamic-pattern p-4">
      <div className="w-full max-w-md text-center">
        {searching && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="relative w-32 h-32 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-gold/30 animate-pulse-ring" />
              <div className="absolute inset-2 rounded-full border-4 border-gold/20 animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
              <div className="absolute inset-4 rounded-full border-4 border-gold/10 animate-pulse-ring" style={{ animationDelay: "1s" }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center">
                  <Search className="w-8 h-8 text-primary" />
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold mb-2">
                جارٍ البحث عن {type === "correction" ? "معلّم لتصحيح التلاوة" : "معلّم للتسميع"}
              </h2>
              <p className="text-muted-foreground">{Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, "0")}</p>
            </div>
            <Button variant="outline" className="ornamental-border" onClick={handleCancel}>
              <X className="w-4 h-4 ml-2" />
              إلغاء البحث
            </Button>
          </motion.div>
        )}

        {found && matchedUser && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="w-24 h-24 mx-auto rounded-full bg-card ornamental-border flex items-center justify-center">
              <User className="w-12 h-12 text-accent" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold mb-1">تم العثور على شريك!</h2>
              <p className="text-lg font-semibold text-foreground">{matchedUser.name}</p>
              <p className="text-sm text-muted-foreground">{matchedUser.role}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-5 h-5 ${s <= Math.round(matchedUser.rating) ? "star-active fill-current" : "text-muted"}`} />
                ))}
                <span className="text-sm text-muted-foreground mr-1">{matchedUser.rating.toFixed(1)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <Button className="w-full h-12 gold-gradient text-primary font-bold" onClick={handleStartSession}>ابدأ الجلسة</Button>
              <Button variant="outline" className="w-full" onClick={() => { setFound(false); setSearching(true); setSeconds(0); setMatchedUser(null); }}>
                بحث عن شريك آخر
              </Button>
            </div>
          </motion.div>
        )}

        {found && !matchedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-2xl font-serif font-bold">تم إيجاد مطابقة!</h2>
            <p className="text-muted-foreground">جارٍ تحضير الجلسة...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Matchmaking;
