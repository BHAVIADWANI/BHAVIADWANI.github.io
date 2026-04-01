import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, Users, IndianRupee, Loader2, Search, Activity, UserCheck, RefreshCw } from "lucide-react";
import { Navigate } from "react-router-dom";

interface UserRecord {
  user_id: string;
  email: string;
  display_name: string;
  created_at: string;
  last_sign_in_at: string | null;
  plan: string;
  status: string;
  start_date: string;
  expiry_date: string;
  sub_id: string;
}

interface PaymentRecord {
  id: string;
  user_id: string;
  email: string;
  plan_type: string;
  payment_reference: string | null;
  activation_status: string;
  payment_date: string;
}

const AdminDashboard = () => {
  const { isAdmin } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  // Real-time updates
  useEffect(() => {
    if (!user || !isAdmin) return;

    const channel = supabase
      .channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "subscriptions" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "payment_records" }, () => fetchData())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => fetchData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, isAdmin]);

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  async function fetchData() {
    setLoading(true);
    try {
      const [usersRes, { data: pays }] = await Promise.all([
        supabase.functions.invoke("admin-list-users"),
        supabase.from("payment_records").select("*"),
      ]);

      if (usersRes.error) throw new Error(usersRes.error.message);
      setUsers(usersRes.data?.users || []);
      setPayments(pays || []);
    } catch (err: any) {
      console.error("Admin fetch error:", err);
      toast({ title: "Error loading data", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  }

  const handleUpdatePlan = async (userId: string, newPlan: "free" | "standard" | "premium") => {
    const expiry = newPlan === "free"
      ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from("subscriptions")
      .update({ plan: newPlan, status: "active", start_date: new Date().toISOString(), expiry_date: expiry })
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Plan updated" });
      fetchData();
    }
  };

  const handleExtend = async (userId: string) => {
    const u = users.find((s) => s.user_id === userId);
    if (!u) return;
    const newExpiry = new Date(new Date(u.expiry_date).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from("subscriptions")
      .update({ expiry_date: newExpiry, status: "active" })
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Subscription extended by 30 days" });
      fetchData();
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((s) => s.plan !== "free" && s.status === "active").length;
  const standardRevenue = payments.filter((p) => p.plan_type === "standard" && p.activation_status === "verified").length * 99;
  const premiumRevenue = payments.filter((p) => p.plan_type === "premium" && p.activation_status === "verified").length * 199;

  const filtered = users.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.display_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container py-8 space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Badge variant="outline" className="ml-auto gap-1">
            <Activity className="h-3 w-3 text-primary animate-pulse" /> Real-time
          </Badge>
          <Button variant="outline" size="sm" onClick={() => fetchData()} className="gap-1">
            <RefreshCw className="h-3 w-3" /> Refresh
          </Button>
        </div>

        <div className="grid sm:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Users</CardTitle></CardHeader>
            <CardContent><div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><span className="text-2xl font-bold">{totalUsers}</span></div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Paid</CardTitle></CardHeader>
            <CardContent><div className="flex items-center gap-2"><UserCheck className="h-5 w-5 text-primary" /><span className="text-2xl font-bold">{activeUsers}</span></div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Revenue</CardTitle></CardHeader>
            <CardContent><div className="flex items-center gap-2"><IndianRupee className="h-5 w-5 text-primary" /><span className="text-2xl font-bold">₹{standardRevenue + premiumRevenue}</span></div></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Plan Breakdown</CardTitle></CardHeader>
            <CardContent className="flex gap-2 flex-wrap">
              <Badge variant="outline">Free: {users.filter(s => s.plan === "free").length}</Badge>
              <Badge variant="secondary">Std: {users.filter(s => s.plan === "standard").length}</Badge>
              <Badge>Pro: {users.filter(s => s.plan === "premium").length}</Badge>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by email or name..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <Card>
            <CardHeader><CardTitle className="text-lg">All Users ({filtered.length})</CardTitle></CardHeader>
            <CardContent className="p-0 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Signed Up</TableHead>
                    <TableHead>Last Sign In</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((u) => (
                    <TableRow key={u.user_id}>
                      <TableCell className="text-sm font-medium">{u.display_name}</TableCell>
                      <TableCell className="font-mono text-xs">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.plan === "premium" ? "default" : u.plan === "standard" ? "secondary" : "outline"} className="capitalize">
                          {u.plan}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.status === "active" ? "default" : "destructive"} className="capitalize">
                          {u.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-xs">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "Never"}</TableCell>
                      <TableCell className="text-xs">{u.plan === "free" ? "Never" : new Date(u.expiry_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Select onValueChange={(v) => handleUpdatePlan(u.user_id, v as any)}>
                            <SelectTrigger className="h-7 text-xs w-24"><SelectValue placeholder="Set plan" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="free">Free</SelectItem>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleExtend(u.user_id)}>+30d</Button>
                          <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => handleUpdatePlan(u.user_id, "free")}>Revoke</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <h2 className="text-xl font-bold mt-8">Payment Records</h2>
        <Card>
          <CardContent className="p-0 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.email}</TableCell>
                    <TableCell className="capitalize">{p.plan_type}</TableCell>
                    <TableCell className="font-mono text-xs">{p.payment_reference || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={p.activation_status === "verified" ? "default" : "outline"} className="capitalize">
                        {p.activation_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{new Date(p.payment_date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
