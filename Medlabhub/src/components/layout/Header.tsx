import { Microscope, FlaskConical, Database, BarChart3, BookOpen, BrainCircuit, GitCompare, Layers, LogIn, LogOut, User, ScanEye, Library, Crown, ShieldCheck, Calculator, Atom, Search, X, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { MobileNav } from "./MobileNav";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Badge } from "@/components/ui/badge";
import { GlobalSearch } from "@/components/home/GlobalSearch";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Identify", href: "/identify", icon: Microscope },
  { label: "Database", href: "/database", icon: BookOpen },
  { label: "Compare", href: "/compare", icon: GitCompare },
  { label: "Quiz", href: "/quiz", icon: BrainCircuit },
  { label: "Flashcards", href: "/flashcards", icon: Layers },
  { label: "Records", href: "/records", icon: Database },
  { label: "AST", href: "/ast", icon: BarChart3 },
  { label: "Virtual Lab", href: "/molecular", icon: FlaskConical },
  { label: "AI Tutor", href: "/ai-tutor", icon: BrainCircuit },
  { label: "Image AI", href: "/image-recognition", icon: ScanEye },
  { label: "Reference", href: "/reference-library", icon: Library },
  { label: "Lab Calc", href: "/lab-calculator", icon: Calculator },
  { label: "Docking", href: "/molecular-docking", icon: Atom },
  { label: "Lab Report", href: "/lab-report", icon: ClipboardList },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { plan, isAdmin } = useSubscription();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Close search on navigation
  useEffect(() => { setSearchOpen(false); }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <MobileNav />
          <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FlaskConical className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Micro<span className="text-primary">ID</span>
            </span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-1.5 text-xs"
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchOpen(true)}
            className="gap-1.5 text-xs"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search</span>
          </Button>
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-1">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Admin</span>
                  </Button>
                </Link>
              )}
              <Link to="/subscription">
                <Badge variant={plan === "premium" ? "default" : plan === "standard" ? "secondary" : "outline"} className="cursor-pointer capitalize text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  {plan}
                </Badge>
              </Link>
              <span className="hidden sm:inline text-xs text-muted-foreground truncate max-w-[120px]">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5 text-xs">
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="default" size="sm" className="gap-1.5 text-xs">
                <LogIn className="h-3.5 w-3.5" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="container pt-20" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <GlobalSearch autoFocus onNavigate={() => setSearchOpen(false)} />
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-12 right-0"
                onClick={() => setSearchOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
