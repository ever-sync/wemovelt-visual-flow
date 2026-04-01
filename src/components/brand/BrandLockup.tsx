import { cn } from "@/lib/utils";

interface BrandLockupProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  titleClassName?: string;
  kickerClassName?: string;
  title?: string;
  kicker?: string;
  compact?: boolean;
}

const BrandLockup = ({
  className,
  iconClassName,
  textClassName,
  titleClassName,
  kickerClassName,
  title = "WEMOVELT",
  kicker = "Outdoor fitness",
  compact = false,
}: BrandLockupProps) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src="/logo-mark.png"
        alt="WEMOVELT"
        className={cn(
          "h-10 w-10 select-none object-contain drop-shadow-[0_10px_24px_rgba(255,102,0,0.28)]",
          compact && "h-8 w-8",
          iconClassName,
        )}
        draggable={false}
      />
      <div className={cn("flex flex-col justify-center", textClassName)}>
        <p
          className={cn(
            "mb-1 text-[0.64rem] uppercase tracking-[0.32em] text-primary/80",
            compact && "mb-0.5 text-[0.58rem]",
            kickerClassName,
          )}
        >
          {kicker}
        </p>
        <p
          className={cn(
            "text-[1.02rem] font-bold leading-none tracking-[-0.05em] text-foreground",
            compact && "text-sm",
            titleClassName,
          )}
        >
          {title}
        </p>
      </div>
    </div>
  );
};

export default BrandLockup;
