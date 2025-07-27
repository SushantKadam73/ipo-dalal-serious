/**
 * Indian localization utilities for IPO Dalal
 * Handles currency, numbers, and date formatting according to Indian standards
 */

/**
 * Formats currency in Indian Rupees with proper Indian numbering system
 */
export function formatIndianCurrency(amount: number, options?: {
  showDecimals?: boolean;
  showCrores?: boolean;
  compact?: boolean;
}): string {
  const { showDecimals = false, showCrores = true, compact = false } = options || {};

  if (amount === 0) return "₹0";

  // Convert to crores if amount is large enough and showCrores is true
  if (showCrores && amount >= 10000000) { // 1 crore = 10,000,000
    const crores = amount / 10000000;
    if (compact) {
      return `₹${crores.toFixed(crores >= 100 ? 0 : 1)}Cr`;
    }
    return `₹${formatIndianNumber(crores, { showDecimals: true })} Cr`;
  }

  // Convert to lakhs if amount is large enough
  if (amount >= 100000) { // 1 lakh = 100,000
    const lakhs = amount / 100000;
    if (compact) {
      return `₹${lakhs.toFixed(lakhs >= 100 ? 0 : 1)}L`;
    }
    return `₹${formatIndianNumber(lakhs, { showDecimals: true })} L`;
  }

  // Regular formatting for smaller amounts
  return `₹${formatIndianNumber(amount, { showDecimals })}`;
}

/**
 * Formats numbers according to Indian numbering system (lakhs/crores)
 */
export function formatIndianNumber(num: number, options?: {
  showDecimals?: boolean;
  decimalPlaces?: number;
}): string {
  const { showDecimals = false, decimalPlaces = 2 } = options || {};

  if (num === 0) return "0";

  // Handle negative numbers
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  // Format with proper decimal places
  const formattedNum = showDecimals 
    ? absNum.toFixed(decimalPlaces)
    : Math.round(absNum).toString();

  // Split into integer and decimal parts
  const [integerPart, decimalPart] = formattedNum.split('.');

  // Apply Indian numbering system
  const indianFormatted = formatWithIndianCommas(integerPart);

  // Combine with decimal part if needed
  const result = decimalPart ? `${indianFormatted}.${decimalPart}` : indianFormatted;

  return isNegative ? `-${result}` : result;
}

/**
 * Applies Indian comma formatting (xx,xx,xxx pattern)
 */
function formatWithIndianCommas(numStr: string): string {
  // Reverse the string for easier processing
  const reversed = numStr.split('').reverse().join('');
  
  let formatted = '';
  for (let i = 0; i < reversed.length; i++) {
    if (i === 3) {
      formatted += ',';
    } else if (i > 3 && (i - 3) % 2 === 0) {
      formatted += ',';
    }
    formatted += reversed[i];
  }
  
  // Reverse back to original order
  return formatted.split('').reverse().join('');
}

/**
 * Formats percentage with proper Indian standards
 */
export function formatPercentage(value: number, decimalPlaces: number = 1): string {
  if (value === 0) return "0%";
  return `${value.toFixed(decimalPlaces)}%`;
}

/**
 * Formats subscription times (e.g., "2.5x", "150x")
 */
export function formatSubscriptionTimes(times: number): string {
  if (times === 0) return "0x";
  if (times < 1) return `${times.toFixed(2)}x`;
  if (times < 10) return `${times.toFixed(1)}x`;
  return `${Math.round(times)}x`;
}

/**
 * Formats dates according to Indian standards (DD-MMM-YYYY)
 */
export function formatIndianDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${day}-${month}-${year}`;
}

/**
 * Formats time in 12-hour format with AM/PM
 */
export function formatIndianTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
}

/**
 * Formats date and time together in Indian format
 */
export function formatIndianDateTime(date: Date | string): string {
  return `${formatIndianDate(date)} ${formatIndianTime(date)}`;
}

/**
 * Calculates and formats countdown to a date
 */
export function formatCountdown(targetDate: Date | string): string {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const now = new Date();
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return "Closed";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Determines GMP color class based on percentage
 */
export function getGMPColorClass(gmpPercentage: number): string {
  if (gmpPercentage >= 50) return "gmp-very-high";
  if (gmpPercentage >= 30) return "gmp-high";
  if (gmpPercentage >= 15) return "gmp-medium";
  return "gmp-low";
}

/**
 * Formats lot size with proper formatting
 */
export function formatLotSize(shares: number, pricePerShare: number): string {
  return `${formatIndianNumber(shares)} @ ₹${formatIndianNumber(pricePerShare)}`;
}

/**
 * Calculates and formats estimated profit for different categories
 */
export function formatEstimatedProfit(
  lotSize: number,
  ipoPrice: number,
  gmpPrice: number,
  category: 'retail' | 'shni' = 'retail'
): string {
  const lots = category === 'retail' ? 1 : 1; // Can be adjusted based on category
  const totalInvestment = lotSize * ipoPrice * lots;
  const expectedValue = lotSize * (ipoPrice + gmpPrice) * lots;
  const profit = expectedValue - totalInvestment;

  return formatIndianCurrency(profit, { compact: true });
}