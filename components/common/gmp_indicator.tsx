import { getGMPColorClass, formatPercentage } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface GMPIndicatorProps {
  percentage: number;
  price?: number;
  showPrice?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function GMPIndicator({ 
  percentage, 
  price, 
  showPrice = true, 
  size = "md",
  className 
}: GMPIndicatorProps) {
  const colorClass = getGMPColorClass(percentage);
  
  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };

  return (
    <div className={cn("flex flex-col", className)}>
      <span 
        className={cn(
          "font-bold",
          colorClass,
          sizeClasses[size]
        )}
      >
        {percentage >= 0 ? "+" : ""}{formatPercentage(percentage)}
      </span>
      {showPrice && price && (
        <span className="text-xs text-muted-foreground">
          ₹{price}
        </span>
      )}
    </div>
  );
}