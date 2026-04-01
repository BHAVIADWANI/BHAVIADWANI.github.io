import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { FlaskConical, Home, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-20 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto">
            <FlaskConical className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-6xl font-bold mb-2">404</h1>
            <p className="text-xl text-muted-foreground">
              This page doesn't exist in our database.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Link to="/">
              <Button variant="hero" className="gap-2">
                <Home className="h-4 w-4" />
                Return Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
