import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Input from '@/components/Input';
import AppButton from '@/components/Button';
import { IndianRupee } from 'lucide-react-native';

type Props = {
  price: string;
  setPrice: (val: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  startLocation: string;
  destination: string;
};

const BidForm = ({
  price,
  setPrice,
  onSubmit,
  onCancel,
  startLocation,
  destination,
}: Props) => {
  return (
    <View style={styles.card}>
      <Text style={styles.rideSummary}>
        🚕 Ride from <Text style={styles.bold}>{startLocation}</Text> to{' '}
        <Text style={styles.bold}>{destination}</Text>
      </Text>

      <Input
        icon={<IndianRupee size={20} />}
        placeholder="Your Bid Price"
        value={price}
        setValue={setPrice}
        keyboardType="numeric"
      />
      <AppButton title="Submit Bid" onPress={onSubmit} />
      <AppButton title="Cancel" onPress={onCancel} style={styles.cancelBtn} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  rideSummary: {
    fontSize: 16,
    marginBottom: 15,
    textAlign: 'center',
  },
  bold: {
    fontWeight: '600',
    color: '#333',
  },
  cancelBtn: {
    marginTop: 10,
  },
});

export default BidForm;
