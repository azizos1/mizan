"use client";

import { useState, useEffect } from "react";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string | null;
  currentAmount: number;
  percentage: number;
  dailyNeeded: number | null;
  daysLeft: number | null;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // بيانات الدخل والمصروفات
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [lifeBalance, setLifeBalance] = useState(0);
  const [fixedExpenses, setFixedExpenses] = useState(0);
  const [availableForGoals, setAvailableForGoals] = useState(0);

  // المصروفات الضرورية الشهرية
  const [showExpenses, setShowExpenses] = useState(false);
  const [rent, setRent] = useState("");
  const [bills, setBills] = useState("");
  const [food, setFood] = useState("");
  const [transport, setTransport] = useState("");
  const [other, setOther] = useState("");

  async function fetchGoals() {
    try {
      const res = await fetch("/api/goals");
      const data = await res.json();
      if (res.ok) setGoals(data.goals);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function fetchAvailableAmount() {
    try {
      const res = await fetch("/api/goals/available");
      const data = await res.json();
      if (res.ok) {
        setMonthlyIncome(data.monthlyIncome);
        setMonthlyExpenses(data.monthlyExpenses);
        setLifeBalance(data.lifeBalance);
        // تحميل المصروفات المحفوظة
        const saved = localStorage.getItem("mizan_fixed_expenses");
        if (saved) {
          const parsed = JSON.parse(saved);
          setRent(parsed.rent || "");
          setBills(parsed.bills || "");
          setFood(parsed.food || "");
          setTransport(parsed.transport || "");
          setOther(parsed.other || "");
          const total = (parseFloat(parsed.rent) || 0) + (parseFloat(parsed.bills) || 0) + (parseFloat(parsed.food) || 0) + (parseFloat(parsed.transport) || 0) + (parseFloat(parsed.other) || 0);
          setFixedExpenses(total);
          setAvailableForGoals(data.lifeBalance - total);
        } else {
          setAvailableForGoals(data.lifeBalance);
        }
      }
    } catch (err) { console.error(err); }
  }

  function saveFixedExpenses() {
    const total = (parseFloat(rent) || 0) + (parseFloat(bills) || 0) + (parseFloat(food) || 0) + (parseFloat(transport) || 0) + (parseFloat(other) || 0);
    setFixedExpenses(total);
    setAvailableForGoals(lifeBalance - total);
    localStorage.setItem("mizan_fixed_expenses", JSON.stringify({ rent, bills, food, transport, other }));
    setShowExpenses(false);
  }

  useEffect(() => {
    fetchGoals();
    fetchAvailableAmount();
  }, []);

  async function handleCreateGoal(e: React.FormEvent) {
    e.preventDefault(); setSubmitting(true); setError(""); setSuccess("");
    if (!name || !targetAmount || parseFloat(targetAmount) <= 0) {
      setError("الرجاء إدخال اسم وهدف صحيح"); setSubmitting(false); return;
    }
    try {
      const url = editingGoal ? "/api/goals" : "/api/goals";
      const method = editingGoal ? "PATCH" : "POST";
      const body = editingGoal
        ? JSON.stringify({ goalId: editingGoal, name, targetAmount: parseFloat(targetAmount), targetDate: targetDate || null })
        : JSON.stringify({ name, targetAmount: parseFloat(targetAmount), targetDate: targetDate || null });

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "حدث خطأ"); setSubmitting(false); return; }
      setSuccess(editingGoal ? "تم التحديث!" : "تم الإنشاء!");
      setName(""); setTargetAmount(""); setTargetDate(""); setShowForm(false); setEditingGoal(null);
      await fetchGoals();
      await fetchAvailableAmount();
    } catch { setError("حدث خطأ في الاتصال"); } finally { setSubmitting(false); }
  }

  async function deleteGoal(goalId: string) {
    if (!confirm("هل أنت متأكد من حذف هذا الهدف؟")) return;
    try {
      const res = await fetch("/api/goals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId }),
      });
      if (res.ok) { fetchGoals(); fetchAvailableAmount(); }
    } catch { alert("خطأ"); }
  }

  function startEdit(goal: Goal) {
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setTargetDate(goal.targetDate || "");
    setEditingGoal(goal.id);
    setShowForm(true);
    setError("");
    setSuccess("");
  }

  function estimateMonths(targetAmount: number, currentAmount: number, monthlyAvailable: number): string {
    if (monthlyAvailable <= 0) return "لا يوجد فائض";
    const remaining = targetAmount - currentAmount;
    if (remaining <= 0) return "تم! 🎉";
    const months = Math.ceil(remaining / monthlyAvailable);
    if (months <= 1) return "شهر";
    if (months <= 12) return `${months} شهر`;
    const years = Math.floor(months / 12);
    const rm = months % 12;
    return `${years} سنة${rm > 0 ? ` و ${rm} شهر` : ""}`;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ color: "#0f172a", fontSize: "24px", fontWeight: 800, margin: 0 }}>🎯 أهدافي</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingGoal(null); setName(""); setTargetAmount(""); setTargetDate(""); setError(""); setSuccess(""); }}
          style={{ backgroundColor: showForm ? "#f1f5f9" : "#4f46e5", color: showForm ? "#64748b" : "white", border: "none", padding: "10px 20px", borderRadius: "14px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
          {showForm ? "✕ إلغاء" : "+ هدف جديد"}
        </button>
      </div>

      {/* كرت: المبلغ المتاح */}
      <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ color: "#0f172a", fontSize: "18px", fontWeight: 800, margin: 0 }}>💡 تحليل الميزانية</h2>
          <button onClick={() => setShowExpenses(!showExpenses)}
            style={{ backgroundColor: "#f1f5f9", color: "#64748b", border: "none", padding: "8px 14px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
            ⚙️ المصروفات الثابتة
          </button>
        </div>

        {/* المصروفات الثابتة */}
        {showExpenses && (
          <div style={{ backgroundColor: "#f8fafc", borderRadius: "14px", padding: "16px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <p style={{ color: "#64748b", fontSize: "12px", fontWeight: 600, margin: "0 0 4px 0" }}>المصروفات الضرورية الشهرية</p>
            {[
              { label: "🏠 سكن/إيجار", value: rent, set: setRent },
              { label: "📄 فواتير", value: bills, set: setBills },
              { label: "🍔 أكل", value: food, set: setFood },
              { label: "🚗 تنقل", value: transport, set: setTransport },
              { label: "📦 أخرى", value: other, set: setOther },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#64748b", fontSize: "13px", minWidth: "90px" }}>{item.label}</span>
                <input type="number" value={item.value} onChange={(e) => item.set(e.target.value)}
                  style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: "10px", padding: "8px 12px", fontSize: "13px", outline: "none" }} placeholder="0" />
                <span style={{ color: "#94a3b8", fontSize: "12px" }}>د.ت</span>
              </div>
            ))}
            <button onClick={saveFixedExpenses}
              style={{ backgroundColor: "#4f46e5", color: "white", border: "none", padding: "10px", borderRadius: "12px", fontSize: "13px", fontWeight: 700, cursor: "pointer", marginTop: "4px" }}>
              💾 حفظ المصروفات
            </button>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <div style={{ backgroundColor: "#ecfdf5", borderRadius: "14px", padding: "14px", textAlign: "center" }}>
            <p style={{ color: "#059669", fontSize: "11px", margin: "0 0 4px 0" }}>الدخل الشهري</p>
            <p style={{ color: "#0f172a", fontSize: "16px", fontWeight: 800, margin: 0 }}>{monthlyIncome.toLocaleString("ar-TN")}</p>
          </div>
          <div style={{ backgroundColor: "#fff1f2", borderRadius: "14px", padding: "14px", textAlign: "center" }}>
            <p style={{ color: "#dc2626", fontSize: "11px", margin: "0 0 4px 0" }}>المصروفات الثابتة</p>
            <p style={{ color: "#0f172a", fontSize: "16px", fontWeight: 800, margin: 0 }}>{fixedExpenses.toLocaleString("ar-TN")}</p>
          </div>
          <div style={{ backgroundColor: "#eef2ff", borderRadius: "14px", padding: "14px", textAlign: "center" }}>
            <p style={{ color: "#4f46e5", fontSize: "11px", margin: "0 0 4px 0" }}>متاح للأهداف</p>
            <p style={{ color: "#0f172a", fontSize: "16px", fontWeight: 800, margin: 0 }}>{availableForGoals.toLocaleString("ar-TN")}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", display: "flex", flexDirection: "column", gap: "14px" }}>
          <h3 style={{ color: "#0f172a", fontSize: "16px", fontWeight: 700, margin: 0 }}>
            {editingGoal ? "✏️ تعديل الهدف" : "🎯 هدف جديد"}
          </h3>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "14px", fontSize: "16px", color: "#0f172a", outline: "none" }} placeholder="اسم الهدف" />
          <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)}
            style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "14px", fontSize: "16px", color: "#0f172a", outline: "none" }} placeholder="المبلغ (د.ت)" />
          <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)}
            style={{ width: "100%", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "14px", fontSize: "16px", color: "#0f172a", outline: "none" }} />
          {error && <p style={{ color: "#dc2626", fontSize: "13px", margin: 0, textAlign: "center" }}>{error}</p>}
          {success && <p style={{ color: "#059669", fontSize: "13px", margin: 0, textAlign: "center" }}>{success}</p>}
          <button onClick={handleCreateGoal} disabled={submitting}
            style={{ padding: "16px", backgroundColor: submitting ? "#94a3b8" : "#4f46e5", color: "white", border: "none", borderRadius: "16px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>
            {submitting ? "⏳" : editingGoal ? "💾 تحديث" : "✅ إنشاء"}
          </button>
        </div>
      )}

      {/* Goals List */}
      {loading ? (
        <p style={{ textAlign: "center", color: "#94a3b8", padding: "40px" }}>جاري التحميل...</p>
      ) : goals.length === 0 ? (
        <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "50px 20px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
          <p style={{ fontSize: "56px", margin: "0 0 16px 0" }}>🎯</p>
          <p style={{ color: "#94a3b8", fontSize: "18px", margin: 0 }}>لا توجد أهداف</p>
        </div>
      ) : (
        goals.map((goal) => {
          const remaining = goal.targetAmount - goal.currentAmount;
          const estimatedTime = estimateMonths(goal.targetAmount, goal.currentAmount, availableForGoals);
          return (
            <div key={goal.id} style={{ backgroundColor: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <h3 style={{ color: "#0f172a", fontSize: "20px", fontWeight: 800, margin: 0 }}>{goal.name}</h3>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => startEdit(goal)} style={{ backgroundColor: "#eef2ff", color: "#4f46e5", border: "none", padding: "6px 12px", borderRadius: "10px", fontSize: "12px", cursor: "pointer" }}>✏️</button>
                  <button onClick={() => deleteGoal(goal.id)} style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "none", padding: "6px 12px", borderRadius: "10px", fontSize: "12px", cursor: "pointer" }}>🗑️</button>
                </div>
              </div>
              {goal.targetDate && <p style={{ color: "#94a3b8", fontSize: "13px", margin: "0 0 12px 0" }}>📅 {new Date(goal.targetDate).toLocaleDateString("ar-TN")}</p>}
              <div style={{ height: "12px", backgroundColor: "#f1f5f9", borderRadius: "12px", overflow: "hidden", marginBottom: "12px" }}>
                <div style={{ height: "100%", width: `${Math.min(goal.percentage, 100)}%`, background: "linear-gradient(90deg, #4f46e5, #7c3aed)", borderRadius: "12px" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px", color: "#64748b" }}>
                <span>تم: <b style={{ color: "#059669" }}>{goal.currentAmount.toLocaleString("ar-TN")}</b></span>
                <span>الهدف: <b style={{ color: "#0f172a" }}>{goal.targetAmount.toLocaleString("ar-TN")}</b></span>
              </div>
              <div style={{ backgroundColor: "#fef2f2", borderRadius: "14px", padding: "12px", marginBottom: "12px" }}>
                <p style={{ color: "#dc2626", fontSize: "14px", fontWeight: 600, margin: 0 }}>المتبقي: {remaining.toLocaleString("ar-TN")} د.ت</p>
              </div>
              <div style={{ backgroundColor: "#eef2ff", borderRadius: "14px", padding: "12px", marginBottom: "12px" }}>
                <p style={{ color: "#4f46e5", fontSize: "13px", fontWeight: 700, margin: "0 0 6px 0" }}>🤖 تحليل ذكي</p>
                <p style={{ color: "#0f172a", fontSize: "13px", margin: "0 0 2px 0" }}>💰 المتاح شهرياً: <b>{availableForGoals.toLocaleString("ar-TN")} د.ت</b></p>
                <p style={{ color: "#0f172a", fontSize: "13px", margin: 0 }}>⏱ الوقت المتوقع: <b>{estimatedTime}</b></p>
              </div>
                            {goal.dailyNeeded && goal.dailyNeeded > 0 && goal.daysLeft && (
                <div style={{ backgroundColor: "#fffbeb", borderRadius: "14px", padding: "12px", marginBottom: "12px" }}>
                  <p style={{ color: "#d97706", fontSize: "12px", fontWeight: 700, margin: "0 0 6px 0" }}>⚠️ للوصول في التاريخ:</p>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ color: "#64748b", fontSize: "12px" }}>📅 المدة المتبقية</span>
                    <span style={{ color: "#0f172a", fontSize: "13px", fontWeight: 700 }}>{goal.daysLeft} يوم</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ color: "#64748b", fontSize: "12px" }}>💰 المطلوب يومياً</span>
                    <span style={{ color: "#0f172a", fontSize: "13px", fontWeight: 700 }}>{goal.dailyNeeded.toLocaleString("ar-TN")} د.ت</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b", fontSize: "12px" }}>💰 المطلوب أسبوعياً</span>
                    <span style={{ color: "#0f172a", fontSize: "13px", fontWeight: 700 }}>{(goal.dailyNeeded * 7).toLocaleString("ar-TN")} د.ت</span>
                  </div>
                </div>
              )}
              {remaining > 0 && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <input type="number" step="0.01" placeholder="المبلغ" id={`fund-${goal.id}`}
                    style={{ flex: 1, border: "1px solid #e2e8f0", borderRadius: "12px", padding: "10px", fontSize: "14px", outline: "none" }} />
                  <button onClick={async () => {
                    const input = document.getElementById(`fund-${goal.id}`) as HTMLInputElement;
                    const val = parseFloat(input?.value || "0");
                    if (!val || val <= 0) return alert("المبلغ غير صحيح");
                    try {
                      const res = await fetch("/api/goals", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ goalId: goal.id, amount: val }) });
                      const data = await res.json();
                      if (res.ok) { alert("✅ تم!"); fetchGoals(); fetchAvailableAmount(); }
                      else alert(data.error);
                    } catch { alert("خطأ"); }
                  }} style={{ backgroundColor: "#4f46e5", color: "white", border: "none", padding: "10px 16px", borderRadius: "12px", fontSize: "14px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                    💰 تمويل
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}