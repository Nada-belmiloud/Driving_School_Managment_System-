// utils/utils.ts

/**
 * Formats a number into DZD currency string.
 * @param amount The amount to format.
 * @returns A string in the format "X,XXX DZD".
 */
export const formatDZD = (amount: number): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '0 DZD';
  }
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }) + ' DZD';
};

/**
 * Gets a descriptive color/style for a payment balance status.
 * @param percentage The percentage of the fee paid.
 * @returns An object with text color and background color classes.
 */
export const getStatusStyle = (percentage: number) => {
  if (percentage >= 100) {
    return {
      textColor: 'text-green-600',
      bgColor: 'bg-green-200',
      barColor: 'bg-green-500',
      label: 'Paid',
    };
  }
  if (percentage >= 60) {
    return {
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-200',
      barColor: 'bg-yellow-500',
      label: 'Partial',
    };
  }
  return {
    textColor: 'text-red-600',
    bgColor: 'bg-red-200',
    barColor: 'bg-red-500',
    label: 'Outstanding',
  };
};