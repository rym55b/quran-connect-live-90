import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Star, User, ArrowRight, BookOpen, Clock, Settings, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      const { data } = await supabase
        .from("sessions")
        .select("*, teacher:profiles!sessions_teacher_id_fkey(name), student:profiles!sessions_student_id_fkey(name)")
        .or(`teacher_id.eq.${profile.id},student_id.eq.${profile.id}`)
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(10);
      setRecentSessions(data || []);
      setLoading(false);
    };
    load();
  }, [profile]);

  if (!profile) return null;

  const roleLabel = profile.role === "teacher" ? "معلّم" : profile.role === "student" ? "طالب" : "معلّم وطالب";

  return (
    <div className="min-h-screen bg-background islamic-pattern">
      <header className="bg-primary text-primary-foreground p-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground" onClick={() => navigate("/home")}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-serif font-bold">الملف الشخصي</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="ornamental-border">
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-serif font-bold">{profile.name}</h2>
              <p className="text-sm text-muted-foreground mb-3">{roleLabel}</p>
              <div className="flex items-center justify-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-5 h-5 ${s <= Math.round(Number(profile.rating)) ? "star-active fill-current" : "text-muted"}`} />
                ))}
                <span className="text-sm text-muted-foreground mr-2">{Number(profile.rating).toFixed(1)}</span>
              </div>
              <div className="flex justify-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">{profile.sessions_count}</p>
                  <p className="text-muted-foreground">جلسة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="text-lg font-serif font-bold mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent" />
            الجلسات الأخيرة
          </h3>
          {loading ? (
            <div className="text-center py-4"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
          ) : recentSessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">لا توجد جلسات سابقة</p>
          ) : (
            <div className="space-y-2">
              {recentSessions.map((session) => {
                const partnerName = session.teacher_id === profile.id ? session.student?.name : session.teacher?.name;
                return (
                  <Card key={session.id} className="ornamental-border">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{partnerName || "مستخدم"}</p>
                          <p className="text-xs text-muted-foreground">
                            {session.session_type === "correction" ? "تصحيح" : "تسميع"} • {new Date(session.created_at).toLocaleDateString("ar")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Button variant="outline" className="w-full h-12 ornamental-border gap-2 text-destructive" onClick={async () => { await signOut(); navigate("/"); }}>
            تسجيل الخروج
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
