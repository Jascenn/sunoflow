'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { promptExamples, getExamplesByCategory, type PromptExample } from '@/lib/prompt-examples';
import { Sparkles, X, ChevronRight, Music, Mic, AlignLeft, Type, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch'; // Ensure this exists or mock it
import { Label } from '@/components/ui/label';
import React from 'react'; // Add React import
import { toast } from 'sonner'; // Add Toast import

import { useLanguage } from '@/components/providers/language-provider';

interface GeneratorFormProps {
  onGenerate: (params: any) => Promise<void>;
  isGenerating: boolean;
}

export function GeneratorForm({ onGenerate, isGenerating }: GeneratorFormProps) {
  const { t } = useLanguage();
  // Mode State
  const [mode, setMode] = useState<'description' | 'custom'>('description');
  const fileInputRef = React.useRef<HTMLInputElement>(null); // Ref for file input

  // Form State
  const [prompt, setPrompt] = useState(''); // Used for Description Mode OR Style in Custom Mode
  const [lyrics, setLyrics] = useState(''); // Only for Custom Mode
  const [title, setTitle] = useState('');
  const [model, setModel] = useState<'V3_5' | 'V4' | 'V4_5' | 'V4_5PLUS' | 'V5'>('V3_5');
  const [instrumental, setInstrumental] = useState(false);

  // UI State
  const [showExamples, setShowExamples] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('全部');

  const handleUseExample = (example: PromptExample) => {
    setPrompt(example.prompt);
    // If example has lyrics, switch to custom mode? For now, keep simple.
    if (mode === 'custom') {
      // In custom mode, prompt examples might map to style
      setPrompt(example.tags);
    }
    setTitle(example.title);
    setShowExamples(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error("File size exceeds 10MB limit.");
        return;
      }
      toast.success(`Audio uploaded: ${file.name}`, { duration: 3000 });
      // Here you would upload the file to your backend/S3
      // setUploadedFile(file); 
    }
  };

  const handleSubmit = async () => {
    const mainInput = mode === 'description' ? prompt : lyrics; // Validation check
    if (!mainInput.trim() && !instrumental) return;

    // Construct params based on mode
    const params: any = {
      customMode: mode === 'custom',
      instrumental,
      model,
      title: title || undefined,
    };

    if (mode === 'description') {
      params.prompt = prompt;
    } else {
      params.prompt = lyrics || ''; // Empty lyrics allowed if instrumental
      params.style = prompt; // In custom mode, the 'prompt' state acts as style
    }

    await onGenerate(params);

    // Optional: clear inputs?
    // setPrompt(''); setLyrics('');
  };

  return (
    <div className="relative group max-w-2xl mx-auto">
      {/* Mode Switcher - Notion Toggle Style */}
      <div className="flex items-center justify-center mb-6">
        <div className="bg-gray-100/80 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setMode('description')}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
              mode === 'description' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <Sparkles className="w-4 h-4" />
            <span>{t('generator.mode.description')}</span>
          </button>
          <button
            onClick={() => setMode('custom')}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2",
              mode === 'custom' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <AlignLeft className="w-4 h-4" />
            <span>{t('generator.mode.custom')}</span>
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">

        {/* Instrumental Toggle (Prominent) */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-2">
            <div className={cn("p-1.5 rounded-md transition-colors", instrumental ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-400")}>
              <Music className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className={cn("text-sm font-medium", instrumental ? "text-purple-700" : "text-gray-700")}>{t('generator.instrumental')}</span>
            </div>
          </div>
          {/* Simple Toggle Switch */}
          <button
            onClick={() => setInstrumental(!instrumental)}
            className={cn(
              "w-11 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500",
              instrumental ? "bg-purple-600" : "bg-gray-200"
            )}
          >
            <span className={cn(
              "block w-4 h-4 rounded-full bg-white shadow transform transition-transform absolute top-1",
              instrumental ? "left-6" : "left-1"
            )} />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* INPUT SECTION A: Lyrics or Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {mode === 'description' ? t('generator.mode.description') : (mode === 'custom' ? t('generator.mode.custom') : 'Lyrics')}
              </Label>

              {mode === 'custom' && !instrumental && (
                <button className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {t('generator.generate_lyrics')}
                </button>
              )}
            </div>

            {mode === 'description' ? (
              <textarea
                placeholder={t('generator.placeholder.desc')}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full min-h-[100px] p-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none placeholder:text-gray-400"
              />
            ) : (
              <textarea
                placeholder={instrumental ? t('generator.instrumental.desc') : t('generator.placeholder.lyrics')}
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                disabled={instrumental}
                className={cn(
                  "w-full min-h-[160px] p-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-y font-mono",
                  instrumental ? "bg-gray-100 text-gray-400 cursor-not-allowed border-transparent" : "bg-gray-50 border-gray-200 text-gray-800"
                )}
              />
            )}
          </div>

          {/* INPUT SECTION B: Style & Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Style Input */}
            {mode === 'custom' && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('generator.style')}</Label>
                <input
                  placeholder={t('generator.placeholder.style')}
                  value={prompt} /* reusing prompt state for style in custom mode */
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            )}

            <div className={cn("space-y-1.5", mode === 'description' && "md:col-span-2")}>
              <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('generator.title')}</Label>
              <input
                placeholder={t('generator.placeholder.title')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Model & Version */}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100 mt-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Type className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium">{t('generator.model')}</span>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as any)}
                className="bg-transparent font-medium text-gray-900 outline-none cursor-pointer hover:bg-gray-100 rounded px-1"
              >
                <option value="V3_5">v3.5</option>
                <option value="V4">v4.0</option>
                <option value="V4_5PLUS">v4.5+</option>
              </select>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-t border-gray-200">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="audio/*"
            onChange={handleFileChange}
          />
          <button
            onClick={handleUploadClick}
            className="text-xs font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1.5 transition-colors group"
          >
            <div className="bg-gray-100 p-1 rounded-sm group-hover:bg-gray-200 transition-colors">
              <UploadCloud className="w-3.5 h-3.5" />
            </div>
            <span>{t('generator.upload_audio')}</span>
          </button>

          <Button
            onClick={handleSubmit}
            disabled={isGenerating || (!prompt.trim() && !instrumental && !lyrics.trim())}
            className={cn(
              "h-9 px-6 text-sm font-semibold rounded-md shadow-sm transition-all",
              isGenerating ? "opacity-70 cursor-not-allowed" : "hover:translate-y-[-1px] hover:shadow-md"
            )}
            style={{
              background: isGenerating ? '#e5e7eb' : '#37352f',
              color: isGenerating ? '#9ca3af' : 'white'
            }}
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">{t('generator.btn.generating')}</span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {t('generator.btn.generate')}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
