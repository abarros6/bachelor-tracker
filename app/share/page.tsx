'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function SharePage() {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.origin);
  }, []);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for devices without clipboard API
    }
  }

  async function nativeShare() {
    if (!navigator.share) return;
    await navigator.share({
      title: "Alex's Bach Party",
      text: "Track the Muskoka bachelor party — costs, itinerary, and ideas.",
      url,
    });
  }

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="max-w-sm mx-auto px-4 pt-8 pb-10 pr-12">

      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-amber-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">Share the app</p>
        <h1 className="font-bebas text-5xl text-hi tracking-wide leading-none mb-2">
          Pass It Around
        </h1>
        <p className="text-mid text-sm">
          Scan the QR code or share the link. No download required — it installs straight from the browser.
        </p>
      </div>

      {/* QR Code */}
      <div className="bg-card rounded-3xl border border-line card-shadow p-6 mb-6 flex flex-col items-center">
        {url ? (
          <>
            <div className="bg-white rounded-2xl p-4 mb-4">
              <QRCodeSVG
                value={url}
                size={200}
                bgColor="#ffffff"
                fgColor="#09090b"
                level="M"
              />
            </div>
            <p className="text-lo text-xs text-center font-mono break-all">{url}</p>
          </>
        ) : (
          <div className="w-[232px] h-[232px] bg-raised rounded-2xl animate-pulse" />
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={copyLink}
          className="flex-1 bg-raised border border-line text-hi font-semibold text-sm py-3 rounded-xl active:scale-95 transition-all hover:border-amber-500/40"
        >
          {copied ? '✓ Copied!' : 'Copy Link'}
        </button>
        {canNativeShare && (
          <button
            onClick={nativeShare}
            className="flex-1 bg-amber-500 text-[#09090b] font-bold text-sm py-3 rounded-xl active:scale-95 transition-transform"
          >
            Share 📲
          </button>
        )}
      </div>

      {/* Install instructions */}
      <div className="space-y-4">
        <p className="text-lo text-xs font-semibold uppercase tracking-wide">How to install</p>

        {/* iOS */}
        <div className="bg-card rounded-2xl border border-line card-shadow p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🍎</span>
            <span className="text-hi font-semibold text-sm">iPhone / iPad (Safari)</span>
          </div>
          <ol className="space-y-2">
            {[
              'Open the link in Safari (not Chrome)',
              'Tap the Share button at the bottom of the screen',
              'Scroll down and tap "Add to Home Screen"',
              'Tap "Add" in the top-right corner',
            ].map((step, i) => (
              <li key={i} className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-500 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-mid text-xs leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Android */}
        <div className="bg-card rounded-2xl border border-line card-shadow p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🤖</span>
            <span className="text-hi font-semibold text-sm">Android (Chrome)</span>
          </div>
          <ol className="space-y-2">
            {[
              'Open the link in Chrome',
              'Tap the three-dot menu (⋮) in the top-right',
              'Tap "Add to Home screen" or "Install app"',
              'Tap "Install" to confirm',
            ].map((step, i) => (
              <li key={i} className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-500 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-mid text-xs leading-relaxed">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="text-lo text-xs text-center pb-2">
          Once installed it works offline and feels like a native app.
        </p>
      </div>
    </div>
  );
}
