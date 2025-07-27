import { Badge } from "@/components/ui/badge";
import { IPOType } from "@/types/ipo";
import { cn } from "@/lib/utils";

interface IPOBadgeProps {
  type: IPOType;
  className?: string;
}

export function IPOBadge({ type, className }: IPOBadgeProps) {
  const getVariantStyles = (type: IPOType) => {
    switch (type) {
      case "Mainboard":
        return "bg-primary/20 text-primary border-primary/30";
      case "NSE SME":
        return "bg-secondary/20 text-secondary border-secondary/30";
      case "BSE SME":
        return "bg-accent/20 text-accent border-accent/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "font-semibold text-xs px-2 py-1 rounded-md",
        getVariantStyles(type),
        className
      )}
    >
      {type}
    </Badge>
  );
}