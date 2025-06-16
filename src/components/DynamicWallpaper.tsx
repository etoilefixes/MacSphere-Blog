
'use client';

import React, { useEffect, useState } from 'react';

export function DynamicWallpaper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Mark as mounted on client
  }, []);

  if (!mounted) { // Render nothing until mounted on client
    return null;
  }

  // Once mounted on the client, render the static gradient wallpaper div
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-700 to-slate-800"
      data-ai-hint="abstract gradient"
    />
  );
}

