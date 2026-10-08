'use client';

import { useEffect, useRef, useState } from 'react';

import Script from 'next/script';

type TurnstileRenderOptions = {
  sitekey: string;
  action: string;
  callback: (token: string) => void;
  'expired-callback': () => void;
  'error-callback': () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: TurnstileRenderOptions,
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

type TurnstileWidgetProps = {
  onToken: (token: string | null) => void;
};

export default function TurnstileWidget({ onToken }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScriptReady, setIsScriptReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;

    if (!isScriptReady || !container || !window.turnstile) {
      return;
    }

    const widgetId = window.turnstile.render(container, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '',
      action: 'signin',
      callback: (token) => onToken(token),
      'expired-callback': () => onToken(null),
      'error-callback': () => onToken(null),
    });

    return () => window.turnstile?.remove(widgetId);
  }, [isScriptReady, onToken]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        onReady={() => setIsScriptReady(true)}
      />
      <div ref={containerRef} className="mt-6" />
    </>
  );
}
