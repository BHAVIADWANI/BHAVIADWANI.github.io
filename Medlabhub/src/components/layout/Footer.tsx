import { FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";

const links = [
  { label: "Identify", href: "/identify" },
  { label: "Database", href: "/database" },
  { label: "Compare", href: "/compare" },
  { label: "Quiz", href: "/quiz" },
  { label: "Flashcards", href: "/flashcards" },
  { label: "AST", href: "/ast" },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-10">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FlaskConical className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Micro<span className="text-primary">ID</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              AI-powered microorganism identification platform for students, researchers, and lab professionals.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Tools</h4>
            <div className="grid grid-cols-2 gap-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">About</h4>
            <p className="text-sm text-muted-foreground">
              MicroID provides comprehensive microorganism data including molecular profiles, 
              antimicrobial resistance patterns, and clinical insights to support microbiology education and practice.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-xs text-muted-foreground space-y-2">
          <p>© {new Date().getFullYear()} MicroID. All rights reserved.</p>
          <p>Created & Developed by <span className="font-semibold text-foreground">Maan Patel</span></p>
          <p>Unauthorized reproduction or distribution of this application is strictly prohibited.</p>
          <p className="text-muted-foreground/70">Ramol, Gujarat, India</p>
        </div>
      </div>
    </footer>
  );
}
