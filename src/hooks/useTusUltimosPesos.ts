/**
 * useTusUltimosPesos Hook
 * Calculates the remaining money after unpaid bills
 * "Tus Últimos Pesos" = Your Last Pesos (remaining funds)
 */

import { useAppContext } from '../context/AppContext';

interface UseTusUltimosPesosReturn {
  // The calculated value: Total Income - Unpaid Bills Amount
  amount: number;

  // Breakdown for display purposes
  totalIncome: number;
  unpaidBillsAmount: number;

  // Formatted string (can be used directly in UI)
  isNegative: boolean;
}

export function useTusUltimosPesos(): UseTusUltimosPesosReturn {
  const { tusUltimosPesos, incomeSummary, billsSummary } = useAppContext();

  return {
    amount: tusUltimosPesos,
    totalIncome: incomeSummary.total,
    unpaidBillsAmount: billsSummary.totalRemaining,
    isNegative: tusUltimosPesos < 0,
  };
}
