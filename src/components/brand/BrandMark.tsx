import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  imageClassName?: string;
}

const BrandMark = ({ className, imageClassName }: BrandMarkProps) => {
  return (
    <div
      className={cn(
        "flex h-16 w-16 items-center justify-center rounded-[1.6rem] border border-white/10 bg-black/40 backdrop-blur-xl",
        className,
      )}
    >
      <img
        src="/logo-mark.png"
        alt="WEMOVELT"
        className={cn("h-11 w-11 select-none object-contain", imageClassName)}
        draggable={false}
      />
    </div>
  );
};

export default BrandMark;
