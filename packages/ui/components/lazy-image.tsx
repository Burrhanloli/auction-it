import React, { useReducer, useEffect, useRef } from "react";

export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  fallbackText?: string;
  priority?: boolean;
  threshold?: number;
  rootMargin?: string;
}

type State = { loaded: boolean; error: boolean; hasIntersected: boolean };
type Action = { type: "RESET" } | { type: "INTERSECT" } | { type: "LOAD" } | { type: "ERROR" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "RESET":
      return { loaded: false, error: false, hasIntersected: false };
    case "INTERSECT":
      return { ...state, hasIntersected: true };
    case "LOAD":
      return { ...state, loaded: true };
    case "ERROR":
      return { ...state, error: true };
    default:
      return state;
  }
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
  const [state, dispatch] = useReducer(reducer, {
    loaded: false,
    error: false,
    hasIntersected: false,
  });
  const prevSrcRef = useRef(src);
  const imgRef = useRef<HTMLImageElement | null>(null);

  if (src !== prevSrcRef.current) {
    prevSrcRef.current = src;
    dispatch({ type: "RESET" });
  }

  const currentInView = priority || state.hasIntersected;

  useEffect(() => {
    if (priority) {
      return;
    }

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      const timer = setTimeout(() => dispatch({ type: "INTERSECT" }), 0);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            dispatch({ type: "INTERSECT" });
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

  const setImgRef = React.useCallback((node: HTMLImageElement | null) => {
    imgRef.current = node;
    if (node?.complete && !node.src.startsWith("data:image/gif")) {
      dispatch({ type: "LOAD" });
    }
  }, []);

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
    if (e.currentTarget.src.startsWith("data:image/gif")) return;
    dispatch({ type: "LOAD" });
    if (props.onLoad) {
      props.onLoad(e);
    }
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    dispatch({ type: "ERROR" });
    if (props.onError) {
      props.onError(e);
    }
  };

  if (!src || state.error) {
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
  const currentSrc = currentInView ? src : placeholderSrc;

  // Pulse skeleton background when not loaded yet
  const loadingClasses = !state.loaded
    ? "animate-pulse bg-neutral-900 border border-[#3c3c3c]"
    : "transition-opacity duration-300 opacity-100";

  return (
    <img
      ref={setImgRef}
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
