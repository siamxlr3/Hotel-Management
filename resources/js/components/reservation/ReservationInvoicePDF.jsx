import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica', color: '#333' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 40, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 20
  },
  hotelInfo: { flexDirection: 'column' },
  hotelName: { fontSize: 20, fontWeight: 'bold', color: '#1e40af', marginBottom: 5 },
  hotelSub: { fontSize: 9, color: '#666', marginBottom: 2 },
  invoiceTitle: { textAlign: 'right' },
  titleText: { fontSize: 24, fontWeight: 'bold', color: '#111' },
  invoiceNo: { marginTop: 5, fontSize: 10, color: '#666' },
  section: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 12, fontWeight: 'bold', marginBottom: 10, color: '#111',
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 5
  },
  row: { flexDirection: 'row', marginBottom: 8 },
  label: { width: 100, fontWeight: 'bold', color: '#666' },
  value: { flex: 1, color: '#111' },
  table: { marginTop: 10 },
  tableHeader: {
    flexDirection: 'row', backgroundColor: '#f8fafc',
    borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingVertical: 8, paddingHorizontal: 10, fontWeight: 'bold'
  },
  tableRow: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
    paddingVertical: 10, paddingHorizontal: 10, alignItems: 'center'
  },
  col1: { flex: 2 },
  col3: { flex: 1, textAlign: 'right' },
  footer: {
    marginTop: 50, borderTopWidth: 1, borderTopColor: '#eee',
    paddingTop: 20, textAlign: 'center', color: '#999', fontSize: 8
  },
  summarySection: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  summaryBox: { width: 220, backgroundColor: '#f8fafc', padding: 15, borderRadius: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 10,
    paddingTop: 10, borderTopWidth: 1, borderTopColor: '#e2e8f0'
  },
  totalLabel: { fontSize: 12, fontWeight: 'bold', color: '#1e40af' },
  totalValue: { fontSize: 12, fontWeight: 'bold', color: '#1e40af' }
});

const ReservationInvoicePDF = ({ reservation, hotelInfo }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
  };

  const checkIn = new Date(reservation.check_in);
  const checkOut = new Date(reservation.check_out);
  const nights = Math.max(1, Math.ceil(Math.abs(checkOut - checkIn) / (1000 * 60 * 60 * 24)));
  const grossSubtotal = Number(reservation.room?.base_price || 0) * nights;
  const discountApplied = Number(reservation.discount_amount || 0);

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
            <Text style={styles.titleText}>PAYMENT RECEIPT</Text>
            <Text style={styles.invoiceNo}>TRX: {reservation.transaction_id || 'N/A'}</Text>
            <Text style={styles.invoiceNo}>Date: {new Date().toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Guest Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GUEST & STAY INFORMATION</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>{reservation.guest_name}</Text>
            <Text style={styles.label}>Room:</Text>
            <Text style={styles.value}>{reservation.room?.room_number}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{reservation.guest_phone}</Text>
            <Text style={styles.label}>Category:</Text>
            <Text style={styles.value}>{reservation.room?.category?.name || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{reservation.guest_email || 'N/A'}</Text>
            <Text style={styles.label}>Nights:</Text>
            <Text style={styles.value}>{nights}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dates:</Text>
            <Text style={styles.value}>{checkIn.toLocaleDateString()} to {checkOut.toLocaleDateString()}</Text>
            <Text style={styles.label}>Persons:</Text>
            <Text style={styles.value}>{reservation.person_count}</Text>
          </View>
        </View>

        {/* Payment Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAYMENT BREAKDOWN</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Description</Text>
              <Text style={styles.col3}>Amount</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.col1}>Accommodation ({nights} nights @ {formatCurrency(reservation.room?.base_price)})</Text>
              <Text style={styles.col3}>{formatCurrency(grossSubtotal)}</Text>
            </View>
            {discountApplied > 0 && (
              <View style={styles.tableRow}>
                <Text style={styles.col1}>Discounts Applied</Text>
                <Text style={styles.col3}>- {formatCurrency(discountApplied)}</Text>
              </View>
            )}
            <View style={styles.tableRow}>
              <Text style={styles.col1}>Taxes ({Number(reservation.tax_percent)}%)</Text>
              <Text style={styles.col3}>{formatCurrency(reservation.tax_amount)}</Text>
            </View>
          </View>
        </View>

        {/* Summary Box */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={{color: '#666'}}>Subtotal:</Text>
              <Text>{formatCurrency(reservation.subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{color: '#666'}}>Total Taxes:</Text>
              <Text>{formatCurrency(reservation.tax_amount)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>GRAND TOTAL:</Text>
              <Text style={styles.totalValue}>{formatCurrency(reservation.total_amount)}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for choosing {hotelInfo?.hotel_name || 'our hotel'}.</Text>
          <Text>Payment Method: {reservation.payment_method || 'N/A'} | Status: {reservation.status}</Text>
          <Text>This is a computer-generated receipt.</Text>
        </View>
      </Page>
    </Document>
  );
};

export default ReservationInvoicePDF;
