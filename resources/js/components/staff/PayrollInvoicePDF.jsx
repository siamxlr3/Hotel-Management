import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Standard fonts
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
  col1: { flex: 2 },
  col2: { flex: 1, textAlign: 'center' },
  col3: { flex: 1, textAlign: 'right' },
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

const PayrollInvoicePDF = ({ payroll, hotelInfo }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  const netPay = parseFloat(payroll.net_salary) + parseFloat(payroll.bonus || 0) - parseFloat(payroll.deduction || 0);

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
            <Text style={styles.titleText}>PAYROLL SLIP</Text>
            <Text style={styles.invoiceNo}>Month: {payroll.month} {payroll.year}</Text>
            <Text style={styles.invoiceNo}>Date: {new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Staff Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STAFF INFORMATION</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{payroll.staff?.name}</Text>
            <Text style={styles.label}>Staff Code:</Text>
            <Text style={styles.value}>{payroll.staff?.staff_code}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Role:</Text>
            <Text style={styles.value}>{payroll.staff?.role?.name || 'N/A'}</Text>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{payroll.staff?.phone || 'N/A'}</Text>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAYMENT DETAILS</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Description</Text>
              <Text style={styles.col3}>Amount</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.col1}>Basic Net Salary</Text>
              <Text style={styles.col3}>{formatCurrency(payroll.net_salary)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.col1}>Bonus</Text>
              <Text style={styles.col3}>{formatCurrency(payroll.bonus)}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.col1}>Deductions</Text>
              <Text style={styles.col3}>- {formatCurrency(payroll.deduction)}</Text>
            </View>
          </View>
        </View>

        {/* Summary Box */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={{color: '#666'}}>Subtotal Earnings:</Text>
              <Text>{formatCurrency(parseFloat(payroll.net_salary) + parseFloat(payroll.bonus || 0))}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{color: '#666'}}>Total Deductions:</Text>
              <Text>{formatCurrency(payroll.deduction)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>NET PAYABLE:</Text>
              <Text style={styles.totalValue}>{formatCurrency(netPay)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>This is a computer-generated payroll slip. No signature is required.</Text>
          <Text>Status: {payroll.status} | Paid At: {payroll.paid_at ? new Date(payroll.paid_at).toLocaleString() : 'N/A'}</Text>
          <Text style={{ marginTop: 10 }}>© {new Date().getFullYear()} {hotelInfo?.hotel_name}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PayrollInvoicePDF;
