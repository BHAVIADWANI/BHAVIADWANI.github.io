import { Menu, Microscope, BookOpen, BrainCircuit, Database, BarChart3, GitCompare, Layers, FlaskConical, LogIn, LogOut, Library, Calculator, Atom } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Identify", href: "/identify", icon: Microscope },
  { label: "Database", href: "/database", icon: BookOpen },
  { label: "Compare", href: "/compare", icon: GitCompare },
  { label: "Quiz", href: "/quiz", icon: BrainCircuit },
  { label: "Flashcards", href: "/flashcards", icon: Layers },
  { label: "Records", href: "/records", icon: Database },
  { label: "AST Analysis", href: "/ast", icon: BarChart3 },
  { label: "Virtual Lab", href: "/molecular", icon: FlaskConical },
  { label: "AI Tutor", href: "/ai-tutor", icon: BrainCircuit },
  { label: "Reference Library", href: "/reference-library", icon: Library },
  { label: "Lab Calculator", href: "/lab-calculator", icon: Calculator },
  { label: "Molecular Docking", href: "/molecular-docking", icon: Atom },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate("/");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <div className="p-6 border-b">
          <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Microscope className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Micro<span className="text-primary">ID</span>
            </span>
          </Link>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link key={item.href} to={item.href} onClick={() => setOpen(false)}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t mt-auto">
          {user ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground truncate px-2">{user.email}</p>
              <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Link to="/auth" onClick={() => setOpen(false)}>
              <Button variant="default" className="w-full justify-start gap-3">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
