"use client";

import React, { Suspense, useEffect } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { setPixelTestCode } from "@/lib/pixel";

function PixelTracker({ pixelId, testEventCode }: { pixelId?: string; testEventCode?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (testEventCode) {
      setPixelTestCode(testEventCode);
    }
  }, [testEventCode]);

  useEffect(() => {
    const activeId = pixelId || "2242388576616945";
    if (typeof window !== "undefined" && (window as any).fbq) {
      const extra = testEventCode ? { test_event_code: testEventCode } : undefined;
      (window as any).fbq("track", "PageView", extra);
    }
  }, [pathname, searchParams, pixelId, testEventCode]);

  return null;
}

export default function FacebookPixel({
  pixelId = "2242388576616945",
  testEventCode = "TEST82490",
}: {
  pixelId?: string;
  testEventCode?: string;
}) {
  const activePixelId = pixelId || "2242388576616945";

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
            fbq('init', '${activePixelId}');
            fbq('track', 'PageView'${testEventCode ? `, { test_event_code: '${testEventCode}' }` : ""});
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
        <PixelTracker pixelId={activePixelId} testEventCode={testEventCode} />
      </Suspense>
    </>
  );
}
