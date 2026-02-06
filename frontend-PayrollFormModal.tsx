/**
 * Payroll Form Modal
 * React + React Native compatible
 * Includes country-specific tax calculations
 */

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Picker } from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Kenya PAYE Tax Brackets
const calculatePAYE_Kenya = (grossSalary: number): number => {
  if (grossSalary <= 24000) return grossSalary * 0.10;
  if (grossSalary <= 32333) return 2400 + (grossSalary - 24000) * 0.25;
  return 2400 + 2083.25 + (grossSalary - 32333) * 0.30;
};

// Kenya NHIF (tiered)
const calculateNHIF_Kenya = (grossSalary: number): number => {
  if (grossSalary <= 5999) return 150;
  if (grossSalary <= 7999) return 300;
  if (grossSalary <= 11999) return 400;
  if (grossSalary <= 14999) return 500;
  if (grossSalary <= 19999) return 600;
  if (grossSalary <= 24999) return 750;
  if (grossSalary <= 29999) return 850;
  if (grossSalary <= 34999) return 900;
  if (grossSalary <= 39999) return 950;
  if (grossSalary <= 44999) return 1000;
  if (grossSalary <= 49999) return 1100;
  if (grossSalary <= 59999) return 1200;
  if (grossSalary <= 69999) return 1300;
  if (grossSalary <= 79999) return 1400;
  if (grossSalary <= 89999) return 1500;
  if (grossSalary <= 99999) return 1600;
  return 1700;
};

// Kenya NSSF
const calculateNSSF_Kenya = (grossSalary: number): number => {
  const rate = 0.06;
  const max = 18000;
  return Math.min(grossSalary * rate, max);
};

export const PayrollFormModal: React.FC<Props> = ({ visible, onClose, onSuccess }) => {
  const [employeeName, setEmployeeName] = useState('');
  const [grossSalary, setGrossSalary] = useState('');
  const [country, setCountry] = useState('KE'); // Default Kenya
  const [loading, setLoading] = useState(false);

  const calculateDeductions = () => {
    const gross = parseFloat(grossSalary) || 0;
    let paye = 0;
    let nhif = 0;
    let nssf = 0;

    if (country === 'KE') {
      paye = calculatePAYE_Kenya(gross);
      nhif = calculateNHIF_Kenya(gross);
      nssf = calculateNSSF_Kenya(gross);
    } else if (country === 'UG') {
      // Uganda PAYE (simplified)
      if (gross > 235000) paye = (gross - 235000) * 0.30;
      nssf = Math.min(gross * 0.10, gross); // 10% NSSF
    } else if (country === 'TZ') {
      // Tanzania PAYE (simplified)
      if (gross > 270000) paye = (gross - 270000) * 0.25;
      nssf = Math.min(gross * 0.10, gross);
    }

    const totalDeductions = paye + nhif + nssf;
    const netSalary = gross - totalDeductions;

    return {
      gross,
      paye: Math.round(paye),
      nhif: Math.round(nhif),
      nssf: Math.round(nssf),
      totalDeductions: Math.round(totalDeductions),
      netSalary: Math.round(netSalary)
    };
  };

  const deductions = calculateDeductions();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      
      const payroll = {
        employeeName,
        grossSalary: deductions.gross,
        paye: deductions.paye,
        nhif: deductions.nhif,
        nssf: deductions.nssf,
        netSalary: deductions.netSalary,
        country,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      };

      const response = await fetch(`${API_URL}/api/v1/payroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payroll)
      });

      if (!response.ok) {
        throw new Error('Failed to process payroll');
      }

      // Save to offline queue
      if (typeof localStorage !== 'undefined') {
        const queue = JSON.parse(localStorage.getItem('payroll_queue') || '[]');
        queue.push(payroll);
        localStorage.setItem('payroll_queue', JSON.stringify(queue));
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Payroll error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Process Payroll</Text>

      {/* Employee Name */}
      <Text style={styles.label}>Employee Name *</Text>
      <TextInput
        style={styles.input}
        value={employeeName}
        onChangeText={setEmployeeName}
        placeholder="Enter employee name"
      />

      {/* Country */}
      <Text style={styles.label}>Country *</Text>
      <Picker
        selectedValue={country}
        onValueChange={setCountry}
        style={styles.picker}
      >
        <Picker.Item label="🇰🇪 Kenya" value="KE" />
        <Picker.Item label="🇺🇬 Uganda" value="UG" />
        <Picker.Item label="🇹🇿 Tanzania" value="TZ" />
        <Picker.Item label="🇷🇼 Rwanda" value="RW" />
      </Picker>

      {/* Gross Salary */}
      <Text style={styles.label}>Gross Salary *</Text>
      <TextInput
        style={styles.input}
        value={grossSalary}
        onChangeText={setGrossSalary}
        keyboardType="numeric"
        placeholder="Enter gross salary"
      />

      {/* Deductions Breakdown */}
      {deductions.gross > 0 && (
        <View style={styles.breakdown}>
          <Text style={styles.breakdownTitle}>Deductions Breakdown</Text>
          
          <View style={styles.row}>
            <Text>Gross Salary:</Text>
            <Text style={styles.amount}>{deductions.gross.toLocaleString()}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <Text>PAYE Tax:</Text>
            <Text style={styles.deduction}>-{deductions.paye.toLocaleString()}</Text>
          </View>

          {country === 'KE' && (
            <View style={styles.row}>
              <Text>NHIF:</Text>
              <Text style={styles.deduction}>-{deductions.nhif.toLocaleString()}</Text>
            </View>
          )}

          <View style={styles.row}>
            <Text>NSSF:</Text>
            <Text style={styles.deduction}>-{deductions.nssf.toLocaleString()}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.row}>
            <Text>Total Deductions:</Text>
            <Text style={styles.deduction}>-{deductions.totalDeductions.toLocaleString()}</Text>
          </View>

          <View style={[styles.row, styles.netRow]}>
            <Text style={styles.bold}>Net Salary:</Text>
            <Text style={[styles.bold, styles.netAmount]}>
              {deductions.netSalary.toLocaleString()}
            </Text>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Button title="Cancel" onPress={onClose} color="gray" />
        <Button
          title={loading ? "Processing..." : "Process Payroll"}
          onPress={handleSubmit}
          disabled={loading || !employeeName || !grossSalary}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 10
  },
  breakdown: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 4
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10
  },
  amount: {
    fontWeight: '500'
  },
  deduction: {
    color: '#d32f2f'
  },
  netRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#333'
  },
  bold: {
    fontWeight: 'bold',
    fontSize: 16
  },
  netAmount: {
    color: '#2e7d32',
    fontSize: 18
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  }
});
