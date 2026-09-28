import { useRouter } from '@tanstack/react-router';
import { useState, useSyncExternalStore } from 'react';

// Whether the page is framed never changes, so there is nothing to subscribe
// to. The server snapshot reports "framed" so the banner stays hidden until
// the client can check, rather than flashing inside the Strapi preview iframe.
const subscribe = () => () => {};
const getIsIframe = () => window !== window.top;
const getServerIsIframe = () => true;

/**
 * Draft mode exit banner.
 *
 * Slice 1 ports the UI only — the `/api/exit-preview` endpoint that clears
 * the `draft` cookie will be wired up in slice 6 (preview/draft mode).
 * Until then this component is not mounted anywhere (see $locale.tsx).
 */
export function DraftModeBanner() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const isIframe = useSyncExternalStore(
    subscribe,
    getIsIframe,
    getServerIsIframe
  );

  const handleExitDraft = async () => {
    setIsExiting(true);
    try {
      await fetch('/api/exit-preview');
      router.invalidate();
    } catch (error) {
      console.error('Failed to exit draft mode:', error);
      setIsExiting(false);
    }
  };

  if (isIframe) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-secondary text-black px-6 py-3 rounded-lg shadow-lg flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="inline-block w-4 h-4 bg-black rounded-full animate-pulse" />
        <span className="font-semibold">Draft Mode</span>
      </div>
      <button
        onClick={handleExitDraft}
        disabled={isExiting}
        className="bg-black text-white px-4 py-1 rounded text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
      >
        {isExiting ? 'Exiting...' : 'Exit Draft'}
      </button>
    </div>
  );
}
