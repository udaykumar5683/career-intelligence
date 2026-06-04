'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  File,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileUp,
  Image as ImageIcon,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
];

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.png', '.jpg', '.jpeg', '.webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ResumeUploadProps {
  onFileSelect: (file: File) => void;
  isAnalyzing: boolean;
}

function getFileExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf('.')).toLowerCase();
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileTypeInfo(filename: string): { label: string; icon: any } {
  const ext = getFileExtension(filename);
  switch (ext) {
    case '.pdf':
      return { label: 'PDF Document', icon: FileText };
    case '.docx':
      return { label: 'Word Document', icon: FileText };
    case '.txt':
      return { label: 'Text File', icon: File };
    case '.png':
    case '.jpg':
    case '.jpeg':
    case '.webp':
      return { label: 'Image Resume', icon: ImageIcon };
    default:
      return { label: 'File', icon: File };
  }
}

export function ResumeUpload({ onFileSelect, isAnalyzing }: ResumeUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    const ext = getFileExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Invalid file type. Please upload a PDF, DOCX, TXT, or Image file (PNG, JPG, WEBP).`;
    }
    if (!ALLOWED_TYPES.includes(file.type) && file.type !== '') {
      // Some browsers may not report MIME type for .txt, so check extension too
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return `Invalid file type. Please upload a PDF, DOCX, TXT, or Image file (PNG, JPG, WEBP).`;
      }
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File is too large. Maximum size is 5MB. Your file is ${formatFileSize(file.size)}.`;
    }
    if (file.size === 0) {
      return `File is empty. Please upload a valid resume.`;
    }
    return null;
  }, []);

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
    },
    [validateFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset input so same file can be selected again
      if (inputRef.current) inputRef.current.value = '';
    },
    [handleFile]
  );

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
  }, []);

  const handleAnalyze = useCallback(() => {
    console.log('[ResumeUpload] handleAnalyze clicked', { hasFile: !!selectedFile, isAnalyzing });
    if (selectedFile && !isAnalyzing) {
      onFileSelect(selectedFile);
    }
  }, [selectedFile, isAnalyzing, onFileSelect]);

  const fileInfo = selectedFile ? getFileTypeInfo(selectedFile.name) : null;
  const FileIcon = fileInfo?.icon ?? File;

  return (
    <section id="resume-upload" className="w-full max-w-2xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Section header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Upload Your Resume
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Drop your resume and let our AI agents analyze your career potential
          </p>
        </div>

        <Card className="border-0 shadow-lg shadow-teal-500/5 bg-card/80 backdrop-blur-sm">
          <CardContent className="p-6">
            {/* Drop zone */}
            <motion.div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isAnalyzing && inputRef.current?.click()}
              className={`
                relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300
                ${
                  isDragging
                    ? 'border-teal-400 bg-teal-50/50 dark:bg-teal-950/20 scale-[1.02]'
                    : selectedFile
                      ? 'border-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/10'
                      : 'border-muted-foreground/25 bg-muted/30 hover:border-teal-400/60 hover:bg-teal-50/20 dark:hover:bg-teal-950/10'
                }
                ${isAnalyzing ? 'pointer-events-none opacity-70' : ''}
              `}
              whileHover={!isAnalyzing ? { scale: 1.01 } : {}}
              whileTap={!isAnalyzing ? { scale: 0.99 } : {}}
            >
              <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                <AnimatePresence mode="wait">
                  {isDragging ? (
                    <motion.div
                      key="dragging"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="rounded-full bg-teal-100 dark:bg-teal-900/40 p-4">
                        <FileUp className="size-8 text-teal-600 dark:text-teal-400" />
                      </div>
                      <p className="text-teal-700 dark:text-teal-300 font-semibold text-lg">
                        Drop your resume here
                      </p>
                    </motion.div>
                  ) : selectedFile ? (
                    <motion.div
                      key="selected"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/40 p-4">
                        <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-emerald-700 dark:text-emerald-300 font-semibold">
                          File Ready
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Click or drop a new file to replace
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <div className="rounded-full bg-muted p-4">
                        <Upload className="size-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-foreground font-semibold text-lg">
                          Drag & drop your resume
                        </p>
                        <p className="text-muted-foreground text-sm">
                          or click to browse files
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Supports PDF, DOCX, TXT, Images — Max 5MB
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleInputChange}
              className="hidden"
              disabled={isAnalyzing}
            />

            {/* File info panel */}
            <AnimatePresence>
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex-shrink-0 rounded-lg bg-teal-100 dark:bg-teal-900/40 p-3">
                      <FileIcon className="size-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {fileInfo?.label} &middot; {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    {!isAnalyzing && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile();
                        }}
                        className="flex-shrink-0 size-8 text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                    <AlertCircle className="size-4 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Analyze button */}
            <div className="mt-6">
              <Button
                size="lg"
                className="w-full text-base font-semibold bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white shadow-md shadow-teal-500/20 hover:shadow-teal-500/30 transition-all duration-300 rounded-xl"
                disabled={!selectedFile || isAnalyzing}
                onClick={handleAnalyze}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Analyzing Resume...
                  </>
                ) : (
                  <>
                    <Upload className="size-5" />
                    Analyze My Career
                  </>
                )}
              </Button>
            </div>

            {/* Sample resume link */}
            {!selectedFile && !isAnalyzing && (
              <div className="mt-3 text-center">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const response = await fetch('/sample-resume.txt');
                      const blob = await response.blob();
                      const file = new File([blob], 'sample-resume.txt', { type: 'text/plain' });
                      handleFile(file);
                    } catch {
                      // Fallback: create inline sample resume
                      const sampleText = `JOHN SMITH\nEmail: john.smith@gmail.com | Phone: +1-555-0123 | Location: San Francisco, CA\n\nPROFESSIONAL SUMMARY\nMotivated Computer Science graduate with 2 years of experience in full-stack web development.\n\nEDUCATION\nBachelor of Science in Computer Science, UC Berkeley, 2022, GPA: 3.6/4.0\n\nSKILLS\nJavaScript, TypeScript, React, Node.js, HTML, CSS, Git, REST APIs, MongoDB, Express.js\n\nEXPERIENCE\nJunior Frontend Developer | TechStart Inc. (2022-Present)\nWeb Development Intern | Digital Solutions LLC (2022)\n\nCERTIFICATIONS\nAWS Cloud Practitioner, Meta Frontend Developer Certificate\n\nLANGUAGES\nEnglish (Native), Spanish (Intermediate)`;
                      const file = new File([sampleText], 'sample-resume.txt', { type: 'text/plain' });
                      handleFile(file);
                    }
                  }}
                  className="text-sm text-muted-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors underline underline-offset-4 decoration-dotted"
                >
                  Try with a sample resume
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
