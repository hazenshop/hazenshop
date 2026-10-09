"use client";

import React, { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import { setPixelTestCode } from "@/lib/pixel";

function PixelTracker({ pixelId, testEventCode }: { pixelId?: string; testEventCode?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedUrl = useRef<string | null>(null);

  useEffect(() => {
    if (testEventCode) {
      setPixelTestCode(testEventCode);
    }
  }, [testEventCode]);

  useEffect(() => {
    if (!pixelId) return;

    const queryString = searchParams?.toString();
    const currentUrl = `${pathname}${queryString ? `?${queryString}` : ""}`;

    // On initial mount: the inline script already tracked PageView for this initial URL
    if (lastTrackedUrl.current === null) {
      lastTrackedUrl.current = currentUrl;
      return;
    }

    // Only track if the URL has actually changed (client-side route navigation)
    if (lastTrackedUrl.current !== currentUrl) {
      lastTrackedUrl.current = currentUrl;
      if (typeof window !== "undefined" && typeof (window as any).fbq === "function") {
        const extra = testEventCode ? { test_event_code: testEventCode } : undefined;
        (window as any).fbq("track", "PageView", extra);
      }
    }
  }, [pathname, searchParams, pixelId, testEventCode]);

  return null;
}

export default function FacebookPixel({
  pixelId,
  testEventCode,
}: {
  pixelId?: string;
  testEventCode?: string;
}) {
  const activePixelId = pixelId?.trim();
  if (!activePixelId) {
    return null;
  }

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            if (!window._fbq_initialized) {
              window._fbq_initialized = true;
              fbq('init', '${activePixelId}');
              fbq('track', 'PageView'${testEventCode?.trim() ? `, { test_event_code: '${testEventCode.trim()}' }` : ""});
            }
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${activePixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <Suspense fallback={null}>
        <PixelTracker pixelId={activePixelId} testEventCode={testEventCode?.trim()} />
      </Suspense>
    </>
  );
}
