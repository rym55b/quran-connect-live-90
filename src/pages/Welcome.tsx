import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BookOpen, Star, Mic } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background islamic-pattern relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-2 border-gold/20 animate-spin-slow" />
      <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full border-2 border-gold/10 animate-spin-slow" style={{ animationDirection: "reverse" }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center px-6 max-w-md w-full"
      >
        {/* Islamic ornament top */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="mb-6"
        >
          <div className="w-24 h-24 mx-auto rounded-full gold-gradient flex items-center justify-center shadow-lg">
            <BookOpen className="w-12 h-12 text-primary" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-serif font-bold text-foreground mb-3"
        >
          تلاوتي
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-lg text-muted-foreground mb-2"
        >
          تعلّم وصحّح تلاوة القرآن الكريم
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-muted-foreground mb-10"
        >
          تواصل مباشر بالصوت بين المعلّم والطالب
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex justify-center gap-8 mb-10"
        >
          {[
            { icon: Mic, label: "تصحيح مباشر" },
            { icon: BookOpen, label: "تسميع الحفظ" },
            { icon: Star, label: "تقييم المعلمين" },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-card ornamental-border flex items-center justify-center">
                <item.icon className="w-5 h-5 text-accent" />
              </div>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="space-y-3"
        >
          <Button
            onClick={() => navigate("/auth")}
            className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90"
            size="lg"
          >
            تسجيل الدخول
          </Button>
          <Button
            onClick={() => navigate("/auth?mode=signup")}
            variant="outline"
            className="w-full h-12 text-lg ornamental-border"
            size="lg"
          >
            إنشاء حساب جديد
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8 text-xs text-muted-foreground"
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Welcome;
