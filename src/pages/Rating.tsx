import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Star, User, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Rating = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");
  const partnerName = searchParams.get("partner") || "شريك الجلسة";
  const partnerRole = searchParams.get("partnerRole") || "معلّم";

  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!profile || !sessionId || rating === 0) return;
    setLoading(true);

    // Get session to find partner's profile id
    const { data: session } = await supabase
      .from("sessions")
      .select("teacher_id, student_id")
      .eq("id", sessionId)
      .maybeSingle();

    if (session) {
      const ratedUserId = session.teacher_id === profile.id ? session.student_id : session.teacher_id;
      await supabase.from("ratings").insert({
        session_id: sessionId,
        rated_by: profile.id,
        rated_user_id: ratedUserId,
        score: rating,
        comment: comment || null,
      });
      toast({ title: "شكراً لتقييمك!" });
    }

    setLoading(false);
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background islamic-pattern p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-bold mb-2">انتهت الجلسة</h1>
          <p className="text-muted-foreground">كيف كانت تجربتك؟</p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full bg-card ornamental-border flex items-center justify-center">
            <User className="w-10 h-10 text-accent" />
          </div>
          <p className="font-semibold text-lg">{partnerName}</p>
          <p className="text-sm text-muted-foreground">{partnerRole}</p>
        </div>

        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <motion.button key={s} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onMouseEnter={() => setHoveredStar(s)} onMouseLeave={() => setHoveredStar(0)} onClick={() => setRating(s)} className="p-1">
              <Star className={`w-10 h-10 transition-all ${s <= (hoveredStar || rating) ? "star-active fill-current" : "text-muted"}`} />
            </motion.button>
          ))}
        </div>

        {rating > 0 && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-accent font-semibold">
            {rating === 5 ? "ممتاز! ⭐" : rating === 4 ? "جيد جداً" : rating === 3 ? "جيد" : rating === 2 ? "مقبول" : "ضعيف"}
          </motion.p>
        )}

        <Textarea placeholder="أضف تعليقاً (اختياري)..." value={comment} onChange={(e) => setComment(e.target.value)} className="text-right ornamental-border" rows={3} />

        <div className="space-y-3">
          <Button className="w-full h-12 gold-gradient text-primary font-bold" disabled={rating === 0 || loading} onClick={handleSubmit}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "إرسال التقييم"}
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 ornamental-border" onClick={() => navigate("/matchmaking?type=correction")}>جلسة جديدة</Button>
            <Button variant="outline" className="flex-1" onClick={() => navigate("/home")}>الرئيسية</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Rating;
