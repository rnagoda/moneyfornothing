/**
 * CSV Export Utility for Money For Nothing
 */

import { Platform, Share, Alert } from 'react-native';
import type { AppData } from '../types';
import { formatMonth } from './formatters';

/**
 * Sanitize a value for CSV to prevent injection attacks
 * Prefixes values starting with =, +, -, @ with a single quote
 */
function sanitizeCSVValue(value: string | number | boolean): string {
  const stringValue = String(value);
  // Escape double quotes by doubling them
  const escaped = stringValue.replace(/"/g, '""');
  // Check for formula injection characters
  if (/^[=+\-@]/.test(escaped)) {
    return `"'${escaped}"`;
  }
  // Wrap in quotes if contains comma, newline, or quotes
  if (/[,"\n\r]/.test(escaped)) {
    return `"${escaped}"`;
  }
  return escaped;
}

/**
 * Generate CSV content from app data
 */
export function generateCSV(data: AppData): string {
  const lines: string[] = [];
  const month = formatMonth(data.appState.lastSessionMonth);

  // Header
  lines.push(`Money For Nothing Export - ${month}`);
  lines.push('');

  // Income Section
  lines.push('=== INCOME ===');
  lines.push('Name,Default Amount,Current Amount,Paycheck Number');
  data.income.forEach(inc => {
    lines.push(
      [
        sanitizeCSVValue(inc.name),
        sanitizeCSVValue(inc.defaultAmount),
        sanitizeCSVValue(inc.currentAmount),
        sanitizeCSVValue(inc.paycheckNumber ?? ''),
      ].join(',')
    );
  });
  lines.push('');

  // Bills Section
  lines.push('=== BILLS ===');
  lines.push('Name,Amount,Paid');
  data.bills.forEach(bill => {
    lines.push(
      [
        sanitizeCSVValue(bill.name),
        sanitizeCSVValue(bill.amount),
        sanitizeCSVValue(bill.paid ? 'Yes' : 'No'),
      ].join(',')
    );
  });
  lines.push('');

  // Savings Section
  lines.push('=== SAVINGS ===');
  lines.push('Name,Amount');
  data.savings.forEach(sav => {
    lines.push([sanitizeCSVValue(sav.name), sanitizeCSVValue(sav.amount)].join(','));
  });
  lines.push('');

  // Summary Section
  const incomeTotal = data.income.reduce((sum, inc) => sum + inc.currentAmount, 0);
  const billsTotal = data.bills.reduce((sum, bill) => sum + bill.amount, 0);
  const billsPaid = data.bills.filter(b => b.paid).reduce((sum, bill) => sum + bill.amount, 0);
  const savingsTotal = data.savings.reduce((sum, sav) => sum + sav.amount, 0);

  lines.push('=== SUMMARY ===');
  lines.push(`Total Income,${incomeTotal}`);
  lines.push(`Total Bills,${billsTotal}`);
  lines.push(`Bills Paid,${billsPaid}`);
  lines.push(`Bills Remaining,${billsTotal - billsPaid}`);
  lines.push(`Total Savings,${savingsTotal}`);
  lines.push(`Tus Últimos Pesos,${incomeTotal - (billsTotal - billsPaid)}`);

  return lines.join('\n');
}

/**
 * Export data to CSV file
 * - Web: Downloads as file
 * - Native: Opens share dialog
 */
export async function exportToCSV(data: AppData): Promise<void> {
  const csvContent = generateCSV(data);
  const filename = `moneyfornothing-${data.appState.lastSessionMonth}.csv`;

  if (Platform.OS === 'web') {
    // Web: Create blob and download
    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      Alert.alert('Export Successful', `Downloaded ${filename}`);
    } catch (error) {
      console.error('CSV export error:', error);
      Alert.alert('Export Failed', 'Could not download the CSV file.');
    }
  } else {
    // Native: Use share dialog
    try {
      await Share.share({
        message: csvContent,
        title: filename,
      });
    } catch (error) {
      console.error('CSV export error:', error);
      Alert.alert('Export Failed', 'Could not share the CSV file.');
    }
  }
}
