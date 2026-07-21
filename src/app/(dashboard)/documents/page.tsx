"use client";

import { DocumentList } from "@/components/documents/document-list";
import { UploadDocumentForm } from "@/components/documents/upload-document-form";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">Manage your documents</p>
        </div>
        <UploadDocumentForm />
      </div>
      <DocumentList />
    </div>
  );
}
