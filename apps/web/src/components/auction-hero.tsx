import { TrophyIcon } from "lucide-react";

import { ImageViewer } from "#/components/image-viewer";

export function AuctionHero({
  auction,
  subtitle,
}: {
  auction: { name: string; logoUrl: string | null };
  subtitle: string;
}) {
  return (
    <div className="relative w-full overflow-hidden bg-black px-4 py-16 md:px-8">
      {/* Background Watermark/Image */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-end opacity-10">
        {auction.logoUrl ? (
          <img
            src={auction.logoUrl}
            alt="Watermark"
            className="h-[200%] w-[200%] object-cover object-bottom-right opacity-50 mix-blend-screen blur-sm md:h-[150%] md:w-[150%]"
          />
        ) : (
          <TrophyIcon className="h-96 w-96 translate-x-1/4 -translate-y-1/4 text-white blur-[2px]" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl">
        {auction.logoUrl && (
          <div className="mb-6 flex h-16 w-16 items-center justify-center overflow-hidden border border-[#3c3c3c] bg-[#1a1a1a] p-2">
            <ImageViewer src={auction.logoUrl} alt="Logo" className="h-full w-full object-cover" />
          </div>
        )}
        {!auction.logoUrl && (
          <div className="mb-6 flex h-16 w-16 items-center justify-center border border-[#3c3c3c] bg-[#1a1a1a]">
            <TrophyIcon className="h-8 w-8 text-white" />
          </div>
        )}

        <h1 className="mb-4 text-4xl leading-tight font-black tracking-tight text-white uppercase md:text-display-lg md:leading-[1.05]">
          {auction.name}
        </h1>
        <p className="text-base font-light text-[#bbbbbb] md:text-body-md">{subtitle}</p>
      </div>
    </div>
  );
}
