import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { DockingDashboard } from "@/components/docking/DockingDashboard";
import { Atom } from "lucide-react";

export default function MolecularDocking() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Atom className="h-8 w-8 text-primary" />
            Molecular Docking Suite
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Perform protein–ligand docking simulations, search PDB &amp; PubChem databases, visualize binding poses in 3D, and interpret results with AI — all within MicroID.
          </p>
        </div>
        <DockingDashboard />
      </main>
      <Footer />
    </div>
  );
}
