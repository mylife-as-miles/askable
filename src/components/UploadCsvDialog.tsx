"use client";
import React, { useCallback } from "react";
import Dropzone from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn, EXAMPLE_FILE_URL } from "@/lib/utils";
import { FileSpreadsheet, UploadCloud, ShieldCheck, Gauge } from "lucide-react";

interface UploadCsvDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileSelected: (file: File | null) => void;
}

export function UploadCsvDialog({ open, onOpenChange, onFileSelected }: UploadCsvDialogProps) {
  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles?.[0];
    if (!file) {
      toast.warning("Please select a CSV file");
      return;
    }
    if (file.type !== "text/csv") {
      toast.warning("Only .csv files are supported");
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      toast.warning("File size must be less than 30MB");
      return;
    }
    onFileSelected(file);
    onOpenChange(false);
  }, [onFileSelected, onOpenChange]);

  const onUseExample = useCallback(async () => {
    try {
      const response = await fetch(EXAMPLE_FILE_URL);
      const blob = await response.blob();
      const file = new File([blob], "products.csv", { type: "text/csv" });
      onFileSelected(file);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to load example CSV");
    }
  }, [onFileSelected, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[920px] p-0 overflow-hidden border-none shadow-2xl">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white p-6">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl tracking-tight">Upload your CSV</DialogTitle>
            <DialogDescription className="text-white/80">
              Drag and drop a CSV up to 30MB. We’ll parse headers and sample rows to kickstart your analysis.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
            {/* Features column */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="size-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Private by default</p>
                  <p className="text-xs text-slate-500">Your file is only used to answer your questions.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Gauge className="size-5 text-indigo-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Fast preview</p>
                  <p className="text-xs text-slate-500">We analyze headers and a small sample, not the entire file.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileSpreadsheet className="size-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">CSV only</p>
                  <p className="text-xs text-slate-500">Support for XLSX coming soon.</p>
                </div>
              </div>

              <div className="mt-2">
                <Button variant="outline" onClick={onUseExample} className="gap-2 w-full md:w-auto">
                  Try example CSV
                </Button>
              </div>
            </div>

            {/* Dropzone column */}
            <div className="md:col-span-3">
              <Dropzone multiple={false} accept={{ "text/csv": [".csv"] }} onDrop={handleDrop}>
                {({ getRootProps, getInputProps, isDragActive }) => (
                  <div
                    {...getRootProps()}
                    className={cn(
                      "rounded-xl border-2 border-dashed p-6 md:p-8 bg-white transition shadow-sm cursor-pointer",
                      isDragActive ? "border-blue-600 bg-blue-50" : "border-slate-200"
                    )}
                    style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}
                  >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className={cn("rounded-full size-12 flex items-center justify-center",
                        isDragActive ? "bg-blue-600/10" : "bg-slate-100")}
                      >
                        <UploadCloud className={cn("size-6", isDragActive ? "text-blue-700" : "text-slate-500")} />
                      </div>
                      <p className="text-sm md:text-base text-slate-900 font-medium">
                        {isDragActive ? "Drop your CSV here" : "Drag & drop your CSV or click to browse"}
                      </p>
                      <p className="text-xs text-slate-500">Max 30MB • .csv only</p>
                    </div>
                  </div>
                )}
              </Dropzone>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
