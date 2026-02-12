import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { BookOpen, Mic, Star, Bell, User, LogOut } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  // Mock data - will be replaced with Cloud data
  const user = {
    name: "عبد الله",
    rating: 4.5,
    sessionsCount: 12,
    pendingInvitations: 2,
  };

  return (
    <div className="min-h-screen bg-background islamic-pattern">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">{user.name}</p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 star-active" />
                <span className="text-xs">{user.rating}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate("/invitations")}
            >
              <Bell className="w-5 h-5" />
              {user.pendingInvitations > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold">
                  {user.pendingInvitations}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary-foreground hover:bg-primary-foreground/10"
              onClick={() => navigate("/")}
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto p-4 space-y-6">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3"
        >
          <Card className="ornamental-border">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-serif font-bold text-accent">{user.sessionsCount}</p>
              <p className="text-sm text-muted-foreground">جلسة مكتملة</p>
            </CardContent>
          </Card>
          <Card className="ornamental-border">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${s <= Math.round(user.rating) ? "star-active fill-current" : "text-muted"}`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">تقييمك العام</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Session Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-serif font-bold text-center">ابدأ جلسة جديدة</h2>

          <Button
            onClick={() => navigate("/matchmaking?type=correction")}
            className="w-full h-20 text-lg gap-4 gold-gradient text-primary hover:opacity-90 rounded-xl"
            size="lg"
          >
            <Mic className="w-8 h-8" />
            <div className="text-right">
              <p className="font-bold">جلسة تصحيح التلاوة</p>
              <p className="text-xs opacity-80">اقرأ وسيصحّحك المعلم مباشرة</p>
            </div>
          </Button>

          <Button
            onClick={() => navigate("/matchmaking?type=memorization")}
            className="w-full h-20 text-lg gap-4 bg-primary hover:bg-primary/90 rounded-xl"
            size="lg"
          >
            <BookOpen className="w-8 h-8" />
            <div className="text-right">
              <p className="font-bold">جلسة تسميع الحفظ</p>
              <p className="text-xs opacity-80">سمّع ما حفظته للمعلم</p>
            </div>
          </Button>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3"
        >
          <Button
            variant="outline"
            className="h-14 ornamental-border"
            onClick={() => navigate("/invitations")}
          >
            <Bell className="w-4 h-4 ml-2" />
            الدعوات الخاصة
          </Button>
          <Button
            variant="outline"
            className="h-14 ornamental-border"
            onClick={() => navigate("/profile")}
          >
            <User className="w-4 h-4 ml-2" />
            الملف الشخصي
          </Button>
        </motion.div>
      </main>
    </div>
  );
};

export default Home;
