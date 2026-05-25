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
      <div
        className={`group relative cursor-pointer ${triggerClassName || ""}`}
        onClick={() => setIsOpen(true)}
      >
        <img src={src} alt={alt} className={className} {...props} />
        {!hideOverlay && (
          <div className="absolute inset-0 flex items-center justify-center rounded-none bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <ZoomInIcon className="h-4 w-4 text-white md:h-6 md:w-6" />
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm md:p-8"
          onClick={() => setIsOpen(false)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 cursor-pointer border border-[#3c3c3c] bg-black/50 p-2 text-[#bbbbbb] transition-colors hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <XIcon className="h-6 w-6" />
          </button>

          <img
            src={src}
            alt={alt}
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
