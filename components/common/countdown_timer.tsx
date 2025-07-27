"use client";

import { useState, useEffect } from "react";
import { formatCountdown } from "@/lib/formatters";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  targetDate: Date | string;
  className?: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function CountdownTimer({ 
  targetDate, 
  className, 
  showIcon = true,
  size = "md"
}: CountdownTimerProps) {
  const [countdown, setCountdown] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
      const now = new Date();
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown("Closed");
        setIsExpired(true);
      } else {
        setCountdown(formatCountdown(target));
        setIsExpired(false);
      }
    };

    // Update immediately
    updateCountdown();

    // Update every minute
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm", 
    lg: "text-base"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  return (
    <div className={cn(
      "flex items-center gap-1",
      isExpired ? "text-destructive" : "text-warning",
      sizeClasses[size],
      className
    )}>
      {showIcon && (
        <Clock className={cn(iconSizes[size])} />
      )}
      <span className="font-medium">{countdown}</span>
    </div>
  );
}