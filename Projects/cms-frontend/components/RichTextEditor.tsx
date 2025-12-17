'use client';

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';

// Dynamically import TinyMCE to avoid SSR issues
const TinyMCEEditor = dynamic(() => import('./TinyMCEEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-[300px] rounded-lg border border-input bg-background p-4 flex items-center justify-center text-muted-foreground">
      <div className="flex items-center gap-2">
        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        Loading editor...
      </div>
    </div>
  ),
});

export interface RichTextEditorProps {
  value?: string;
  onChange?: (data: string) => void;
  placeholder?: string;
  id?: string;
}

export default function RichTextEditor({ value, onChange, placeholder, id }: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full min-h-[300px] rounded-lg border border-input bg-background p-4 flex items-center justify-center text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          Loading editor...
        </div>
      </div>
    );
  }

  return <TinyMCEEditor value={value} onChange={onChange} placeholder={placeholder} id={id} />;
}


