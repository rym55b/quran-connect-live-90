import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Star, User, Clock, Check, X, ArrowRight, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Invitations = () => {
  const navigate = useNavigate();

  // Mock data
  const availableTeachers = [
    { id: 1, name: "شيخ أحمد", rating: 4.8, sessions: 150, available: true },
    { id: 2, name: "أستاذ محمد", rating: 4.5, sessions: 89, available: true },
    { id: 3, name: "شيخ عبد الرحمن", rating: 4.9, sessions: 230, available: false },
  ];

  const receivedInvitations = [
    { id: 1, from: "خالد أحمد", type: "correction", time: "بعد 30 دقيقة", status: "pending" },
    { id: 2, from: "سعيد محمد", type: "memorization", time: "غداً 10:00 ص", status: "pending" },
  ];

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
            <TabsTrigger value="received" className="flex-1">الواردة</TabsTrigger>
            <TabsTrigger value="browse" className="flex-1">تصفّح المعلمين</TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-3">
            {receivedInvitations.map((inv, i) => (
              <motion.div
                key={inv.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="ornamental-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold">{inv.from}</p>
                          <p className="text-xs text-muted-foreground">
                            {inv.type === "correction" ? "تصحيح تلاوة" : "تسميع حفظ"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {inv.time}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 gap-1">
                        <Check className="w-4 h-4" />
                        قبول
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 gap-1">
                        <X className="w-4 h-4" />
                        رفض
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="browse" className="space-y-3">
            {availableTeachers.map((teacher, i) => (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
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
                              {teacher.rating}
                            </div>
                            <span>•</span>
                            <span>{teacher.sessions} جلسة</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        disabled={!teacher.available}
                        className={teacher.available ? "gold-gradient text-primary" : ""}
                      >
                        <Send className="w-4 h-4 ml-1" />
                        {teacher.available ? "دعوة" : "غير متاح"}
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
