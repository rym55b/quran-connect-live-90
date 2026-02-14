import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Star, User, Clock, Check, X, ArrowRight, Send, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface InvitationRow {
  id: string;
  inviter_id: string;
  invitee_id: string;
  session_type: string;
  status: string;
  scheduled_time: string | null;
  created_at: string;
  inviter_profile?: { name: string; rating: number } | null;
  invitee_profile?: { name: string; rating: number } | null;
}

const Invitations = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [received, setReceived] = useState<InvitationRow[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingTo, setSendingTo] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;
    setLoading(true);

    // Load received invitations
    const { data: invs } = await supabase
      .from("invitations")
      .select("*, inviter_profile:profiles!invitations_inviter_id_fkey(name, rating)")
      .eq("invitee_id", profile.id)
      .eq("status", "pending");

    setReceived((invs || []) as any);

    // Load available teachers (same gender, role teacher or both)
    const { data: profs } = await supabase
      .from("profiles")
      .select("*")
      .eq("gender", profile.gender)
      .neq("id", profile.id)
      .in("role", ["teacher", "both"]);

    setTeachers(profs || []);
    setLoading(false);
  };

  const handleAccept = async (id: string) => {
    await supabase.from("invitations").update({ status: "accepted" as const }).eq("id", id);
    toast({ title: "تم قبول الدعوة" });
    loadData();
  };

  const handleReject = async (id: string) => {
    await supabase.from("invitations").update({ status: "rejected" as const }).eq("id", id);
    loadData();
  };

  const handleInvite = async (inviteeId: string) => {
    if (!profile) return;
    setSendingTo(inviteeId);
    await supabase.from("invitations").insert({
      inviter_id: profile.id,
      invitee_id: inviteeId,
      session_type: "correction" as const,
    });
    toast({ title: "تم إرسال الدعوة" });
    setSendingTo(null);
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background islamic-pattern">
      <header className="bg-primary text-primary-foreground p-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-primary-foreground" onClick={() => navigate("/home")}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-serif font-bold">الدعوات الخاصة</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4">
        <Tabs defaultValue="received" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="received" className="flex-1">الواردة ({received.length})</TabsTrigger>
            <TabsTrigger value="browse" className="flex-1">تصفّح المعلمين</TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-3">
            {loading ? (
              <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
            ) : received.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا توجد دعوات واردة</p>
            ) : received.map((inv, i) => (
              <motion.div key={inv.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="ornamental-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold">{(inv as any).inviter_profile?.name || "مستخدم"}</p>
                          <p className="text-xs text-muted-foreground">{inv.session_type === "correction" ? "تصحيح تلاوة" : "تسميع حفظ"}</p>
                        </div>
                      </div>
                      {inv.scheduled_time && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {new Date(inv.scheduled_time).toLocaleDateString("ar")}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 gap-1" onClick={() => handleAccept(inv.id)}>
                        <Check className="w-4 h-4" />قبول
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => handleReject(inv.id)}>
                        <X className="w-4 h-4" />رفض
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="browse" className="space-y-3">
            {loading ? (
              <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
            ) : teachers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">لا يوجد معلمون متاحون حالياً</p>
            ) : teachers.map((teacher, i) => (
              <motion.div key={teacher.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="ornamental-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold">{teacher.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 star-active" />
                              {Number(teacher.rating).toFixed(1)}
                            </div>
                            <span>•</span>
                            <span>{teacher.sessions_count} جلسة</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" className="gold-gradient text-primary" disabled={sendingTo === teacher.id} onClick={() => handleInvite(teacher.id)}>
                        {sendingTo === teacher.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 ml-1" />دعوة</>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Invitations;
