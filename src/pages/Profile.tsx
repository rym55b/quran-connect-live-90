import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Star, User, ArrowRight, BookOpen, Clock, Settings } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();

  const user = {
    name: "عبد الله أحمد",
    email: "abdullah@email.com",
    role: "معلّم وطالب",
    gender: "رجل",
    rating: 4.5,
    sessionsCount: 12,
    joinDate: "2025-01-15",
  };

  const recentSessions = [
    { id: 1, partner: "أحمد محمد", type: "تصحيح", date: "اليوم", rating: 5 },
    { id: 2, partner: "خالد سعيد", type: "تسميع", date: "أمس", rating: 4 },
    { id: 3, partner: "محمد علي", type: "تصحيح", date: "قبل 3 أيام", rating: 5 },
  ];

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
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="ornamental-border">
            <CardContent className="p-6 text-center">
              <div className="w-24 h-24 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-serif font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground mb-3">{user.role}</p>
              <div className="flex items-center justify-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${s <= Math.round(user.rating) ? "star-active fill-current" : "text-muted"}`}
                  />
                ))}
                <span className="text-sm text-muted-foreground mr-2">{user.rating}</span>
              </div>
              <div className="flex justify-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">{user.sessionsCount}</p>
                  <p className="text-muted-foreground">جلسة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="text-lg font-serif font-bold mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent" />
            الجلسات الأخيرة
          </h3>
          <div className="space-y-2">
            {recentSessions.map((session) => (
              <Card key={session.id} className="ornamental-border">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{session.partner}</p>
                      <p className="text-xs text-muted-foreground">{session.type} • {session.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${s <= session.rating ? "star-active fill-current" : "text-muted"}`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Button variant="outline" className="w-full h-12 ornamental-border gap-2">
            <Settings className="w-5 h-5" />
            إعدادات الحساب
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
