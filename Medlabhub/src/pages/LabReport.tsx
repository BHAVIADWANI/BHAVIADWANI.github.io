import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportTemplateSelector } from "@/components/lab-report/ReportTemplateSelector";
import { ReportEditor } from "@/components/lab-report/ReportEditor";
import { ReportUploader } from "@/components/lab-report/ReportUploader";
import { ReportTemplate } from "@/lib/labReportTemplates";
import { FileText, Upload, ClipboardList } from "lucide-react";

export default function LabReport() {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ClipboardList className="h-8 w-8 text-primary" />
            Lab Report
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Create, interpret, and analyze laboratory reports with AI-powered clinical interpretation and learning mode.
          </p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList>
            <TabsTrigger value="create" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" /> Create Report
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-1.5">
              <Upload className="h-3.5 w-3.5" /> Upload & Interpret
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            {selectedTemplate ? (
              <ReportEditor
                template={selectedTemplate}
                onBack={() => setSelectedTemplate(null)}
              />
            ) : (
              <>
                <h2 className="text-lg font-semibold">Select Report Template</h2>
                <ReportTemplateSelector onSelect={setSelectedTemplate} />
              </>
            )}
          </TabsContent>

          <TabsContent value="upload">
            <ReportUploader />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
