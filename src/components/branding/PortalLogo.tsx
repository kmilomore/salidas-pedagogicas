import Image from "next/image";

interface PortalLogoProps {
  size?: "sm" | "md" | "lg";
  priority?: boolean;
  showText?: boolean;
  textClassName?: string;
  subtitleClassName?: string;
  className?: string;
}

const imageSizeByVariant = {
  sm: 44,
  md: 56,
  lg: 88,
} as const;

export default function PortalLogo({
  size = "md",
  priority = false,
  showText = true,
  textClassName = "text-slate-950",
  subtitleClassName = "text-slate-500",
  className,
}: PortalLogoProps) {
  const imageSize = imageSizeByVariant[size];

  return (
    <div className={["flex items-center gap-3", className].filter(Boolean).join(" ")}>
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
          <p className={`text-xs font-medium uppercase tracking-[0.22em] ${subtitleClassName}`}>Salidas pedagogicas</p>
        </div>
      ) : null}
    </div>
  );
}