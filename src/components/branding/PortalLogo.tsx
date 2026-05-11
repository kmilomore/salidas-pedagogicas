import Image from "next/image";

interface PortalLogoProps {
  size?: "sm" | "md" | "lg";
  priority?: boolean;
  showText?: boolean;
  textClassName?: string;
}

const imageSizeByVariant = {
  sm: 44,
  md: 56,
  lg: 88,
} as const;

export default function PortalLogo({ size = "md", priority = false, showText = true, textClassName = "text-slate-950" }: PortalLogoProps) {
  const imageSize = imageSizeByVariant[size];

  return (
    <div className="flex items-center gap-3">
      <Image
        src="/SLEPCOLCHAGUA.webp"
        alt="SLEP Colchagua"
        width={imageSize}
        height={imageSize}
        priority={priority}
        className="h-auto w-auto object-contain"
      />
      {showText ? (
        <div className="min-w-0">
          <p className={`font-display text-lg font-semibold leading-tight ${textClassName}`}>SLEP Colchagua</p>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">Salidas pedagogicas</p>
        </div>
      ) : null}
    </div>
  );
}