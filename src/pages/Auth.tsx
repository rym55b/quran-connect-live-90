import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Mail, User, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isSignup, setIsSignup] = useState(searchParams.get("mode") === "signup");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [role, setRole] = useState("");

  // Redirect if already logged in
  if (user) {
    navigate("/home", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignup && step === 1) {
      setStep(2);
      return;
    }

    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await signUp(email, password, { name, gender, role });
        if (error) {
          toast({ title: "خطأ في التسجيل", description: error.message, variant: "destructive" });
        } else {
          toast({ title: "تم التسجيل بنجاح", description: "تحقق من بريدك الإلكتروني لتأكيد الحساب" });
          navigate("/home");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({ title: "خطأ في تسجيل الدخول", description: error.message, variant: "destructive" });
        } else {
          navigate("/home");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background islamic-pattern p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="ornamental-border bg-card/80 backdrop-blur">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full gold-gradient flex items-center justify-center mb-3">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-serif">
              {isSignup ? (step === 1 ? "إنشاء حساب" : "أكمل ملفك الشخصي") : "تسجيل الدخول"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  {isSignup && (
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم الكامل</Label>
                      <div className="relative">
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="أدخل اسمك" className="pr-10 text-right" required />
                        <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" className="pr-10" dir="ltr" required />
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" dir="ltr" required minLength={6} />
                  </div>
                </motion.div>
              )}

              {step === 2 && isSignup && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">الجنس</Label>
                    <RadioGroup value={gender} onValueChange={setGender} className="flex gap-4" required>
                      <div className="flex-1">
                        <label className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${gender === "male" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                          <RadioGroupItem value="male" className="sr-only" />
                          <span className="text-3xl">👳‍♂️</span>
                          <span className="font-medium">رجل</span>
                        </label>
                      </div>
                      <div className="flex-1">
                        <label className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${gender === "female" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                          <RadioGroupItem value="female" className="sr-only" />
                          <span className="text-3xl">🧕</span>
                          <span className="font-medium">امرأة</span>
                        </label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">الدور</Label>
                    <RadioGroup value={role} onValueChange={setRole} className="space-y-2" required>
                      {[
                        { value: "teacher", label: "معلّم", desc: "أستمع وأصحّح التلاوة" },
                        { value: "student", label: "طالب", desc: "أتلو وأحتاج تصحيحاً" },
                        { value: "both", label: "كلاهما", desc: "معلّم وطالب حسب الحاجة" },
                      ].map((item) => (
                        <label key={item.value} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${role === item.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                          <RadioGroupItem value={item.value} />
                          <div>
                            <p className="font-medium">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>
                  </div>
                </motion.div>
              )}

              <Button type="submit" className="w-full h-11" disabled={loading || (isSignup && step === 2 && (!gender || !role))}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isSignup ? (step === 1 ? "التالي" : "إنشاء الحساب") : "دخول"}
              </Button>

              {step === 1 && (
                <p className="text-center text-sm text-muted-foreground">
                  {isSignup ? "لديك حساب؟" : "ليس لديك حساب؟"}{" "}
                  <button type="button" onClick={() => { setIsSignup(!isSignup); setStep(1); }} className="text-accent font-semibold hover:underline">
                    {isSignup ? "سجّل دخولك" : "أنشئ حساباً"}
                  </button>
                </p>
              )}

              {step === 2 && (
                <Button type="button" variant="ghost" className="w-full" onClick={() => setStep(1)}>رجوع</Button>
              )}
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
