/**
 * CSV Import/Export Utility for Money For Nothing
 */

import { Platform, Share, Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import type { AppData, Income, Bill, Savings, SavingsHistoryEntry } from '../types';
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

  // Savings History Section
  if (data.appState.savingsHistory && data.appState.savingsHistory.length > 0) {
    lines.push('=== SAVINGS HISTORY ===');
    lines.push('Month,Total');
    data.appState.savingsHistory.forEach(entry => {
      lines.push([sanitizeCSVValue(entry.month), sanitizeCSVValue(entry.total)].join(','));
    });
    lines.push('');
  }

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
 * Parse a CSV value, handling quoted values and escaped quotes
 */
function parseCSVValue(value: string): string {
  let result = value.trim();
  // Remove surrounding quotes if present
  if (result.startsWith('"') && result.endsWith('"')) {
    result = result.slice(1, -1);
  }
  // Unescape doubled quotes
  result = result.replace(/""/g, '"');
  // Remove leading single quote (used for formula injection protection)
  if (result.startsWith("'")) {
    result = result.slice(1);
  }
  return result;
}

/**
 * Parse a CSV line, handling quoted values with commas
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
        current += char;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(parseCSVValue(current));
      current = '';
    } else {
      current += char;
    }
  }
  values.push(parseCSVValue(current));
  return values;
}

/**
 * Parse CSV content into AppData
 * Returns null if parsing fails
 */
export function parseCSV(csvContent: string): AppData | null {
  try {
    const lines = csvContent.split('\n').map(line => line.trim());
    let currentSection = '';
    let headerSkipped = false;

    const income: Income[] = [];
    const bills: Bill[] = [];
    const savings: Savings[] = [];
    const savingsHistory: SavingsHistoryEntry[] = [];
    let lastSessionMonth = '';

    // Extract month from header if present (format: "Money For Nothing Export - December 2024")
    const headerMatch = lines[0]?.match(/Money For Nothing Export - (.+)/);
    if (headerMatch) {
      // Try to extract YYYY-MM from header - look for pattern in the lines
    }

    for (const line of lines) {
      if (!line) {
        headerSkipped = false;
        continue;
      }

      // Check for section headers
      if (line.startsWith('=== INCOME ===')) {
        currentSection = 'income';
        headerSkipped = false;
        continue;
      } else if (line.startsWith('=== BILLS ===')) {
        currentSection = 'bills';
        headerSkipped = false;
        continue;
      } else if (line.startsWith('=== SAVINGS HISTORY ===')) {
        currentSection = 'savingsHistory';
        headerSkipped = false;
        continue;
      } else if (line.startsWith('=== SAVINGS ===')) {
        currentSection = 'savings';
        headerSkipped = false;
        continue;
      } else if (line.startsWith('=== SUMMARY ===')) {
        currentSection = 'summary';
        headerSkipped = false;
        continue;
      } else if (line.startsWith('Money For Nothing Export')) {
        continue;
      }

      // Skip header row in each section
      if (!headerSkipped && currentSection) {
        if (
          line.startsWith('Name,') ||
          line.startsWith('Month,') ||
          line.startsWith('Total ')
        ) {
          headerSkipped = true;
          continue;
        }
      }

      // Parse data based on current section
      const values = parseCSVLine(line);

      switch (currentSection) {
        case 'income':
          if (values.length >= 3) {
            const paycheckNum = values[3] ? parseInt(values[3], 10) : undefined;
            income.push({
              id: uuidv4(),
              name: values[0],
              defaultAmount: parseFloat(values[1]) || 0,
              currentAmount: parseFloat(values[2]) || 0,
              paycheckNumber: paycheckNum === 1 || paycheckNum === 2 ? paycheckNum : undefined,
            });
          }
          break;

        case 'bills':
          if (values.length >= 3) {
            bills.push({
              id: uuidv4(),
              name: values[0],
              amount: parseFloat(values[1]) || 0,
              paid: values[2].toLowerCase() === 'yes',
            });
          }
          break;

        case 'savings':
          if (values.length >= 2) {
            savings.push({
              id: uuidv4(),
              name: values[0],
              amount: parseFloat(values[1]) || 0,
            });
          }
          break;

        case 'savingsHistory':
          if (values.length >= 2) {
            const month = values[0];
            // Validate month format (YYYY-MM)
            if (/^\d{4}-\d{2}$/.test(month)) {
              savingsHistory.push({
                month,
                total: parseFloat(values[1]) || 0,
              });
              // Use the most recent month as lastSessionMonth
              if (!lastSessionMonth || month > lastSessionMonth) {
                lastSessionMonth = month;
              }
            }
          }
          break;

        case 'summary':
          // Summary section is informational, we don't parse it
          break;
      }
    }

    // Validate we have at least some data
    if (income.length === 0 && bills.length === 0 && savings.length === 0) {
      return null;
    }

    // If no lastSessionMonth found, use current month
    if (!lastSessionMonth) {
      const now = new Date();
      lastSessionMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    // Generate a new version string for imported data
    const num = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    const letter = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    const versionString = `v0.${num}.${letter}`;

    return {
      income,
      bills,
      savings,
      appState: {
        lastSessionMonth,
        versionString,
        hasCompletedSetup: true,
        savingsHistory,
      },
    };
  } catch (error) {
    console.error('CSV parse error:', error);
    return null;
  }
}

/**
 * Import CSV from file picker
 * Returns parsed AppData or null if cancelled/failed
 */
export async function selectAndParseCSV(): Promise<AppData | null> {
  if (Platform.OS === 'web') {
    // Web: Use file input
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv,text/csv';

      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve(null);
          return;
        }

        try {
          const content = await file.text();
          const data = parseCSV(content);
          resolve(data);
        } catch (error) {
          console.error('File read error:', error);
          resolve(null);
        }
      };

      input.oncancel = () => resolve(null);
      input.click();
    });
  } else {
    // Native: Use expo-document-picker
    try {
      const DocumentPicker = await import('expo-document-picker');
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/csv'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const LegacyFileSystem = await import('expo-file-system/legacy');
      const content = await LegacyFileSystem.readAsStringAsync(result.assets[0].uri);
      return parseCSV(content);
    } catch (error) {
      console.error('Document picker error:', error);
      return null;
    }
  }
}

/**
 * Generate a timestamp string for filenames
 */
function getTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

/**
 * Export data to CSV file
 * - Web: Downloads as file
 * - Native: Saves to Downloads folder using Storage Access Framework
 */
export async function exportToCSV(data: AppData): Promise<void> {
  const csvContent = generateCSV(data);
  const filename = `money4nothing_${getTimestamp()}.csv`;

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
    // Native: Save to Downloads folder using Storage Access Framework
    try {
      const LegacyFileSystem = await import('expo-file-system/legacy');
      const { StorageAccessFramework, EncodingType, writeAsStringAsync } = LegacyFileSystem;

      // Request permission to access Downloads folder
      const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (!permissions.granted) {
        Alert.alert('Permission Denied', 'Cannot save file without storage permission.');
        return;
      }

      // Create the file in the selected directory
      const fileUri = await StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        filename,
        'text/csv'
      );

      // Write content to the file
      await writeAsStringAsync(fileUri, csvContent, {
        encoding: EncodingType.UTF8,
      });

      Alert.alert('Export Successful', `Saved ${filename} to selected folder`);
    } catch (error) {
      console.error('CSV export error:', error);
      Alert.alert('Export Failed', 'Could not save the CSV file.');
    }
  }
}
