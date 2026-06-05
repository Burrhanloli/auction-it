import { LazyImage } from "@repo/ui/components/lazy-image";
import { XIcon, ZoomInIcon } from "lucide-react";
import { useState, useEffect } from "react";

export interface ImageViewerProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  triggerClassName?: string;
  hideOverlay?: boolean;
}

export function ImageViewer({
  src,
  alt = "Image",
  className,
  triggerClassName,
  hideOverlay = false,
  ...props
}: ImageViewerProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!src) return null;

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        className={`group relative block cursor-pointer appearance-none border-none bg-transparent p-0 text-left ${triggerClassName || ""}`}
        onClick={() => setIsOpen(true)}
      >
        <LazyImage src={src} alt={alt} className={className} {...props} />
        {!hideOverlay && (
          <div className="absolute inset-0 flex items-center justify-center rounded-none bg-neutral-950/40 opacity-0 transition-opacity group-hover:opacity-100">
            <ZoomInIcon className="size-4 text-white md:h-6 md:w-6" />
          </div>
        )}
      </button>

      {/* Lightbox Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/90 p-4 backdrop-blur-sm md:p-8"
          onClick={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
              setIsOpen(false);
            }
          }}
          tabIndex={-1}
          role="presentation"
        >
          <button
            type="button"
            className="absolute top-4 right-4 cursor-pointer border border-[#3c3c3c] bg-neutral-950/50 p-2 text-[#bbbbbb] transition-colors hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <XIcon className="size-6" />
          </button>

          <LazyImage
            src={src}
            alt={alt}
            priority
            className="max-h-[90vh] max-w-full cursor-zoom-out border border-[#3c3c3c] bg-[#1a1a1a] object-contain"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
        </div>
      )}
    </>
  );
}
