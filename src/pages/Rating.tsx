import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { Star, User } from "lucide-react";

const Rating = () => {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");

  const partner = {
    name: "أحمد محمد",
    role: "معلّم",
  };

  const handleSubmit = () => {
    // TODO: Save rating to Cloud
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background islamic-pattern p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center space-y-6"
      >
        <div>
          <h1 className="text-2xl font-serif font-bold mb-2">انتهت الجلسة</h1>
          <p className="text-muted-foreground">كيف كانت تجربتك؟</p>
        </div>

        {/* Partner info */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-20 h-20 rounded-full bg-card ornamental-border flex items-center justify-center">
            <User className="w-10 h-10 text-accent" />
          </div>
          <p className="font-semibold text-lg">{partner.name}</p>
          <p className="text-sm text-muted-foreground">{partner.role}</p>
        </div>

        {/* Stars */}
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <motion.button
              key={s}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onMouseEnter={() => setHoveredStar(s)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setRating(s)}
              className="p-1"
            >
              <Star
                className={`w-10 h-10 transition-all ${
                  s <= (hoveredStar || rating)
                    ? "star-active fill-current"
                    : "text-muted"
                }`}
              />
            </motion.button>
          ))}
        </div>

        {rating > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-accent font-semibold"
          >
            {rating === 5 ? "ممتاز! ⭐" : rating === 4 ? "جيد جداً" : rating === 3 ? "جيد" : rating === 2 ? "مقبول" : "ضعيف"}
          </motion.p>
        )}

        {/* Comment */}
        <Textarea
          placeholder="أضف تعليقاً (اختياري)..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="text-right ornamental-border"
          rows={3}
        />

        {/* Actions */}
        <div className="space-y-3">
          <Button
            className="w-full h-12 gold-gradient text-primary font-bold"
            disabled={rating === 0}
            onClick={handleSubmit}
          >
            إرسال التقييم
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 ornamental-border"
              onClick={() => navigate("/matchmaking?type=correction")}
            >
              جلسة جديدة
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/home")}
            >
              الرئيسية
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Rating;
