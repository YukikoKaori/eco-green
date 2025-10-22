import { Heart } from "lucide-react";

type Props = {
  liked: boolean;
  onToggle: () => void;
  className?: string;
  size?: number;
  outlineWidth?: number;
};

export default function LikeButton({
  liked,
  onToggle,
  className = "",
  size = 20,
  outlineWidth = 4,
}: Props) {
  const handleClick: React.MouseEventHandler<HTMLSpanElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLSpanElement> = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      onToggle();
    }
  };

  const swallow: React.EventHandler<
    React.MouseEvent | React.TouchEvent
  > = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <span
      role="button"
      tabIndex={0}
      aria-pressed={liked}
      aria-label={liked ? "Bỏ yêu thích" : "Yêu thích"}
      title={liked ? "Bỏ yêu thích" : "Yêu thích"}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseDown={swallow}
      onTouchStart={swallow}
      className={`inline-flex items-center justify-center cursor-pointer select-none focus:outline-none ${className}`}
      style={{ width: size, height: size }}
    >
      {liked ? (
        <span className="relative inline-block w-full h-full">
          <Heart
            className="absolute inset-0"
            fill="none"
            stroke="white"
            strokeWidth={outlineWidth}
            style={{ width: size, height: size }}
          />
          <Heart
            className="absolute inset-0 text-rose-600"
            fill="currentColor"
            stroke="currentColor"  
            strokeWidth={2.25}
            style={{ width: size, height: size }}
          />
        </span>
      ) : (
        <Heart
          className="drop-shadow"
          fill="none"
          stroke="white"
          strokeWidth={2.25}
          style={{ width: size, height: size }}
        />
      )}
    </span>
  );
}
