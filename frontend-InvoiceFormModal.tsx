/**
 * Invoice Form Modal
 * React + React Native compatible
 */

import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InvoiceFormModal: React.FC<Props> = ({ visible, onClose, onSuccess }) => {
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }
  ]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, lineTotal: 0 }
    ]);
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.lineTotal = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.lineTotal, 0);
  };

  const calculateVAT = () => {
    const subtotal = calculateSubtotal();
    return Math.round(subtotal * 0.16 * 100) / 100; // 16% VAT for Kenya
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      
      const invoice = {
        customerName,
        items: items.map(({ id, ...item }) => item),
        currency: 'KES',
        notes
      };

      // Create invoice
      const response = await fetch(`${API_URL}/api/v1/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice)
      });

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      const createdInvoice = await response.json();

      // Issue invoice (post to ledger and queue for tax sync)
      await fetch(`${API_URL}/api/v1/invoices/${createdInvoice.id}/issue`, {
        method: 'POST'
      });

      // Save to offline queue (fallback)
      if (typeof localStorage !== 'undefined') {
        const queue = JSON.parse(localStorage.getItem('invoice_queue') || '[]');
        queue.push(invoice);
        localStorage.setItem('invoice_queue', JSON.stringify(queue));
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Invoice creation error:', error);
      // Save to offline queue on failure
      if (typeof localStorage !== 'undefined') {
        const queue = JSON.parse(localStorage.getItem('invoice_queue') || '[]');
        queue.push({ customerName, items, notes, status: 'pending' });
        localStorage.setItem('invoice_queue', JSON.stringify(queue));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>New Invoice</Text>

      {/* Customer Name */}
      <Text style={styles.label}>Customer Name *</Text>
      <TextInput
        style={styles.input}
        value={customerName}
        onChangeText={setCustomerName}
        placeholder="Enter customer name"
      />

      {/* Invoice Items */}
      <Text style={styles.sectionTitle}>Items</Text>
      {items.map((item, index) => (
        <View key={item.id} style={styles.itemRow}>
          <TextInput
            style={[styles.input, styles.flex2]}
            value={item.description}
            onChangeText={(text) => updateItem(item.id, 'description', text)}
            placeholder="Description"
          />
          <TextInput
            style={[styles.input, styles.flex1]}
            value={item.quantity.toString()}
            onChangeText={(text) => updateItem(item.id, 'quantity', parseFloat(text) || 0)}
            keyboardType="numeric"
            placeholder="Qty"
          />
          <TextInput
            style={[styles.input, styles.flex1]}
            value={item.unitPrice.toString()}
            onChangeText={(text) => updateItem(item.id, 'unitPrice', parseFloat(text) || 0)}
            keyboardType="numeric"
            placeholder="Price"
          />
          <Text style={styles.lineTotal}>{item.lineTotal.toFixed(2)}</Text>
          {items.length > 1 && (
            <Button title="×" onPress={() => removeItem(item.id)} color="red" />
          )}
        </View>
      ))}

      <Button title="+ Add Item" onPress={addItem} />

      {/* Totals */}
      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text>Subtotal:</Text>
          <Text>{calculateSubtotal().toFixed(2)}</Text>
        </View>
        <View style={styles.totalRow}>
          <Text>VAT (16%):</Text>
          <Text>{calculateVAT().toFixed(2)}</Text>
        </View>
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={styles.bold}>Total:</Text>
          <Text style={styles.bold}>{calculateTotal().toFixed(2)}</Text>
        </View>
      </View>

      {/* Notes */}
      <Text style={styles.label}>Notes (Optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Add notes..."
        multiline
        numberOfLines={3}
      />

      {/* Actions */}
      <View style={styles.actions}>
        <Button title="Cancel" onPress={onClose} color="gray" />
        <Button 
          title={loading ? "Creating..." : "Create & Issue Invoice"}
          onPress={handleSubmit}
          disabled={loading || !customerName || items.some(i => !i.description)}
        />
      </View>
    </ScrollView>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10
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
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10
  },
  flex1: {
    flex: 1
  },
  flex2: {
    flex: 2
  },
  lineTotal: {
    width: 80,
    textAlign: 'right',
    fontWeight: '600'
  },
  totals: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 4
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  grandTotal: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#333'
  },
  bold: {
    fontWeight: 'bold',
    fontSize: 16
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 40
  }
});
