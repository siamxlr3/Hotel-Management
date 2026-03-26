import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 20,
  },
  hotelInfo: {
    flexDirection: 'column',
  },
  hotelName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af', // blue-800
    marginBottom: 5,
  },
  hotelSub: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  invoiceTitle: {
    textAlign: 'right',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
  },
  invoiceNo: {
    marginTop: 5,
    fontSize: 10,
    color: '#666',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    width: 100,
    fontWeight: 'bold',
    color: '#666',
  },
  value: {
    flex: 1,
    color: '#111',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  colDescription: { flex: 3 },
  colCategory: { flex: 1, textAlign: 'center' },
  colQty: { flex: 1, textAlign: 'center' },
  colPrice: { flex: 1, textAlign: 'right' },
  colTotal: { flex: 1, textAlign: 'right' },
  footer: {
    marginTop: 50,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
    textAlign: 'center',
    color: '#999',
    fontSize: 8,
  },
  summarySection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  summaryBox: {
    width: 200,
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  totalValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
  }
});

const ExpenseInvoicePDF = ({ expense, hotelInfo }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.hotelInfo}>
            <Text style={styles.hotelName}>{hotelInfo?.hotel_name || 'HOTEL MANAGEMENT'}</Text>
            <Text style={styles.hotelSub}>{hotelInfo?.address || 'Hotel Address'}</Text>
            <Text style={styles.hotelSub}>Phone: {hotelInfo?.phone || 'N/A'}</Text>
            <Text style={styles.hotelSub}>Email: {hotelInfo?.email || 'N/A'}</Text>
          </View>
          <View style={styles.invoiceTitle}>
            <Text style={styles.titleText}>EXPENSE INVOICE</Text>
            <Text style={styles.invoiceNo}>TXN ID: {expense.transaction_id}</Text>
            <Text style={styles.invoiceNo}>Date: {formatDate(expense.date)}</Text>
          </View>
        </View>

        {/* Supplier Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPLIER INFORMATION</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Supplier Name:</Text>
            <Text style={styles.value}>{expense.supplier_name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Contact Person:</Text>
            <Text style={styles.value}>{expense.contact_person || 'N/A'}</Text>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{expense.phone || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{expense.address || 'N/A'}</Text>
          </View>
        </View>

        {/* Expense Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXPENSE ITEMS</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colDescription}>Items / Description</Text>
              <Text style={styles.colCategory}>Category</Text>
              <Text style={styles.colQty}>Qty</Text>
              <Text style={styles.colPrice}>Unit Price</Text>
              <Text style={styles.colTotal}>Total</Text>
            </View>
            {(expense.line_items || []).map((item, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.colDescription}>{item.items}</Text>
                <Text style={styles.colCategory}>{item.category}</Text>
                <Text style={styles.colQty}>{item.qty}</Text>
                <Text style={styles.colPrice}>{formatCurrency(item.price)}</Text>
                <Text style={[styles.colTotal, {fontWeight: 'bold'}]}>
                  {formatCurrency(item.total)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Summary Box */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={{color: '#666'}}>Subtotal:</Text>
              <Text>{formatCurrency(expense.grand_total)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL AMOUNT:</Text>
              <Text style={styles.totalValue}>{formatCurrency(expense.grand_total)}</Text>
            </View>
          </View>
        </View>

        {/* Status Badge */}
        <View style={{ marginTop: 20 }}>
            <Text style={{ 
                fontSize: 10, 
                fontWeight: 'bold', 
                color: expense.status === 'Paid' ? '#16a34a' : '#dc2626',
                textAlign: 'right'
            }}>
                Status: {expense.status?.toUpperCase()}
            </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This is a computer-generated expense invoice. No signature is required.</Text>
          <Text style={{ marginTop: 10 }}>© {new Date().getFullYear()} {hotelInfo?.hotel_name}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ExpenseInvoicePDF;
