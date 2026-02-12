import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, X, Star, User } from "lucide-react";

const Matchmaking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "correction";
  const [searching, setSearching] = useState(true);
  const [found, setFound] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // Simulate matchmaking
  useEffect(() => {
    if (!searching) return;
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    const matchTimer = setTimeout(() => {
      setSearching(false);
      setFound(true);
    }, 5000);
    return () => {
      clearInterval(timer);
      clearTimeout(matchTimer);
    };
  }, [searching]);

  const matchedUser = {
    name: "أحمد محمد",
    rating: 4.7,
    role: "معلّم",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background islamic-pattern p-4">
      <div className="w-full max-w-md text-center">
        {searching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Animated search */}
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
              <p className="text-muted-foreground">
                {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, "0")}
              </p>
            </div>

            <Button
              variant="outline"
              className="ornamental-border"
              onClick={() => navigate("/home")}
            >
              <X className="w-4 h-4 ml-2" />
              إلغاء البحث
            </Button>
          </motion.div>
        )}

        {found && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            <div className="w-24 h-24 mx-auto rounded-full bg-card ornamental-border flex items-center justify-center">
              <User className="w-12 h-12 text-accent" />
            </div>

            <div>
              <h2 className="text-2xl font-serif font-bold mb-1">تم العثور على شريك!</h2>
              <p className="text-lg font-semibold text-foreground">{matchedUser.name}</p>
              <p className="text-sm text-muted-foreground">{matchedUser.role}</p>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${s <= Math.round(matchedUser.rating) ? "star-active fill-current" : "text-muted"}`}
                  />
                ))}
                <span className="text-sm text-muted-foreground mr-1">{matchedUser.rating}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full h-12 gold-gradient text-primary font-bold"
                onClick={() => navigate("/session")}
              >
                ابدأ الجلسة
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setFound(false);
                  setSearching(true);
                  setSeconds(0);
                }}
              >
                بحث عن شريك آخر
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Matchmaking;
