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
  lines.push('--- INCOME ---');
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
  lines.push('--- BILLS ---');
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
  lines.push('--- SAVINGS ---');
  lines.push('Name,Amount');
  data.savings.forEach(sav => {
    lines.push([sanitizeCSVValue(sav.name), sanitizeCSVValue(sav.amount)].join(','));
  });
  lines.push('');

  // Savings History Section
  if (data.appState.savingsHistory && data.appState.savingsHistory.length > 0) {
    lines.push('--- SAVINGS HISTORY ---');
    lines.push('Month,Total');
    data.appState.savingsHistory.forEach(entry => {
      lines.push([sanitizeCSVValue(entry.month), sanitizeCSVValue(entry.total)].join(','));
    });
  }

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
    // Normalize line endings (handle CRLF, CR, LF)
    const normalizedContent = csvContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalizedContent.split('\n').map(line => line.trim());

    let currentSection = '';
    let headerSkipped = false;

    const income: Income[] = [];
    const bills: Bill[] = [];
    const savings: Savings[] = [];
    const savingsHistory: SavingsHistoryEntry[] = [];
    let lastSessionMonth = '';

    for (const line of lines) {
      if (!line) {
        continue;
      }

      const lineLower = line.toLowerCase();

      // Check for section headers (case-insensitive)
      // Must contain === or --- delimiter to be a section header
      // This prevents data lines like "Savings,1000,Yes" from triggering section switches
      const isSectionHeader = line.includes('===') || line.includes('---');
      if (isSectionHeader) {
        if (lineLower.includes('savings history')) {
          currentSection = 'savingsHistory';
          headerSkipped = false;
          continue;
        } else if (lineLower.includes('income')) {
          currentSection = 'income';
          headerSkipped = false;
          continue;
        } else if (lineLower.includes('bills')) {
          currentSection = 'bills';
          headerSkipped = false;
          continue;
        } else if (lineLower.includes('savings')) {
          currentSection = 'savings';
          headerSkipped = false;
          continue;
        } else if (lineLower.includes('summary')) {
          currentSection = 'summary';
          headerSkipped = false;
          continue;
        }
      } else if (lineLower.includes('money for nothing') || lineLower.includes('export')) {
        continue;
      }

      // Skip header row in each section (flexible matching)
      if (!headerSkipped && currentSection) {
        if (
          lineLower.startsWith('name') ||
          lineLower.startsWith('month') ||
          lineLower.startsWith('total ')
        ) {
          headerSkipped = true;
          continue;
        }
        // Also skip if it looks like a header (contains multiple column-like words)
        if (currentSection === 'income' && lineLower.includes('default') && lineLower.includes('amount')) {
          headerSkipped = true;
          continue;
        }
        if (currentSection === 'bills' && lineLower.includes('paid')) {
          headerSkipped = true;
          continue;
        }
      }

      // Parse data based on current section
      const values = parseCSVLine(line);

      // Skip empty rows or rows that don't have enough data
      if (values.length === 0 || (values.length === 1 && !values[0])) {
        continue;
      }

      switch (currentSection) {
        case 'income':
          // Need at least name and one amount
          if (values.length >= 2 && values[0]) {
            const paycheckNum = values[3] ? parseInt(values[3], 10) : undefined;
            const defaultAmt = parseFloat(values[1]) || 0;
            const currentAmt = values.length >= 3 ? (parseFloat(values[2]) || defaultAmt) : defaultAmt;
            income.push({
              id: uuidv4(),
              name: values[0],
              defaultAmount: defaultAmt,
              currentAmount: currentAmt,
              paycheckNumber: paycheckNum === 1 || paycheckNum === 2 ? paycheckNum : undefined,
            });
          }
          break;

        case 'bills':
          // Need at least name and amount
          if (values.length >= 2 && values[0]) {
            const paidValue = values[2]?.toLowerCase() || '';
            bills.push({
              id: uuidv4(),
              name: values[0],
              amount: parseFloat(values[1]) || 0,
              paid: paidValue === 'yes' || paidValue === 'true' || paidValue === '1' || paidValue === 'x',
            });
          }
          break;

        case 'savings':
          // Need at least name and amount
          if (values.length >= 2 && values[0]) {
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

    // If no lastSessionMonth found, use current month
    if (!lastSessionMonth) {
      const now = new Date();
      lastSessionMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    // Generate a new version string for imported data
    const num = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
    const letter = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    const versionString = `v0.${num}.${letter}`;

    // Create default income entries if none found
    if (income.length === 0) {
      income.push({
        id: uuidv4(),
        name: 'Paycheck 1',
        defaultAmount: 0,
        currentAmount: 0,
        paycheckNumber: 1,
      });
      income.push({
        id: uuidv4(),
        name: 'Paycheck 2',
        defaultAmount: 0,
        currentAmount: 0,
        paycheckNumber: 2,
      });
    }

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
 * Result of CSV import attempt
 */
export interface ImportResult {
  success: boolean;
  data: AppData | null;
  error?: string;
  cancelled?: boolean;
}

/**
 * Import CSV from file picker
 * Returns result with parsed data or error information
 */
export async function selectAndParseCSV(): Promise<ImportResult> {
  if (Platform.OS === 'web') {
    // Web: Use file input
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv,text/csv';

      input.onchange = async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve({ success: false, data: null, cancelled: true });
          return;
        }

        try {
          const content = await file.text();
          const data = parseCSV(content);
          if (data) {
            resolve({ success: true, data });
          } else {
            resolve({ success: false, data: null, error: 'Could not parse CSV file. Make sure it was exported from this app.' });
          }
        } catch (error) {
          console.error('File read error:', error);
          resolve({ success: false, data: null, error: 'Could not read file.' });
        }
      };

      input.oncancel = () => resolve({ success: false, data: null, cancelled: true });
      input.click();
    });
  } else {
    // Native: Use expo-document-picker
    try {
      const DocumentPicker = await import('expo-document-picker');
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Accept all files, filter by extension in name
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { success: false, data: null, cancelled: true };
      }

      const asset = result.assets[0];

      // Check file extension
      if (!asset.name.toLowerCase().endsWith('.csv')) {
        return { success: false, data: null, error: 'Please select a CSV file.' };
      }

      const LegacyFileSystem = await import('expo-file-system/legacy');
      const content = await LegacyFileSystem.readAsStringAsync(asset.uri);

      if (!content || content.trim().length === 0) {
        return { success: false, data: null, error: 'File is empty.' };
      }

      const data = parseCSV(content);
      if (data) {
        return { success: true, data };
      } else {
        return { success: false, data: null, error: 'Could not parse CSV file. Make sure it was exported from this app.' };
      }
    } catch (error) {
      console.error('Document picker error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, data: null, error: `Import failed: ${errorMessage}` };
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
