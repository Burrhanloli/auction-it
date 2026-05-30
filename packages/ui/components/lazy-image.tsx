import React, { useState, useEffect, useRef } from "react";

export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  fallbackText?: string;
  priority?: boolean;
  threshold?: number;
  rootMargin?: string;
}

export function LazyImage({
  src,
  alt = "Image",
  fallbackText,
  priority = false,
  threshold = 0,
  rootMargin = "200px",
  className = "",
  style,
  ...props
}: LazyImageProps) {
  const [inView, setInView] = useState(priority);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setLoaded(false);
    setError(false);
    setInView(priority);
  }

  useEffect(() => {
    if (priority) {
      return;
    }

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      const timer = setTimeout(() => setInView(true), 0);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.disconnect();
          }
        });
      },
      { threshold, rootMargin },
    );

    const currentImg = imgRef.current;
    if (currentImg) {
      observer.observe(currentImg);
    }

    return () => {
      observer.disconnect();
    };
  }, [src, priority, threshold, rootMargin]);

  // Handle cached images immediately
  useEffect(() => {
    if (inView && imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    }
  }, [inView, src]);

  // Handle fallback initials
  const initials = React.useMemo(() => {
    const text = fallbackText || alt;
    if (!text) return "";
    const cleanText = text.replace(/[^a-zA-Z0-9\s]/g, "").trim();
    if (!cleanText) return "";
    const parts = cleanText.split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }, [fallbackText, alt]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setLoaded(true);
    if (props.onLoad) {
      props.onLoad(e);
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setError(true);
    if (props.onError) {
      props.onError(e);
    }
  };

  if (!src || error) {
    return (
      <div
        className={`relative flex items-center justify-center border border-[#3c3c3c] bg-linear-to-b from-neutral-900 to-black select-none ${className}`}
        style={style}
      >
        {initials ? (
          <span className="font-extrabold tracking-tight text-white uppercase">{initials}</span>
        ) : (
          <span className="text-[10px] text-neutral-500">👤</span>
        )}
      </div>
    );
  }

  // 1x1 transparent placeholder GIF before intersecting
  const placeholderSrc =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  const currentSrc = inView ? src : placeholderSrc;

  // Pulse skeleton background when not loaded yet
  const loadingClasses = !loaded
    ? "animate-pulse bg-neutral-900 border border-[#3c3c3c]"
    : "transition-opacity duration-300 opacity-100";

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      onLoad={handleLoad}
      onError={handleError}
      className={`${loadingClasses} ${className}`}
      style={style}
      {...props}
    />
  );
}
