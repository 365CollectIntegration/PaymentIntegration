import { useEffect, useRef } from "react";

export function useExternalScript({
  url,
  onLoad,
}: {
  url: string;
  onLoad?: () => void;
}) {
  const onLoadRef = useRef<() => void>(undefined);

  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  useEffect(() => {
    const head = document.querySelector("head");
    const script = document.createElement("script");

    script.setAttribute("data-init", "false");
    script.setAttribute("src", url);
    script.setAttribute("defer", "");

    const handleScript = () => {
      onLoadRef.current?.();
    };

    head?.appendChild?.(script);
    script?.addEventListener?.("load", handleScript);

    return () => {
      script?.removeEventListener?.("load", handleScript);
      head?.removeChild?.(script);
    };
  }, [url]);
}
