import { View, StyleSheet, Text, FlatList } from 'react-native';
import { Clock, MapPin, Navigation } from 'lucide-react-native';

const mockRides = [
  {
    id: '1',
    source: '123 Main St',
    destination: '456 Market St',
    status: 'Pending',
    bidAmount: 25,
    date: '2024-02-20',
  },
  {
    id: '2',
    source: '789 Oak Ave',
    destination: '321 Pine St',
    status: 'Accepted',
    bidAmount: 30,
    date: '2024-02-19',
  },
];

interface Ride {
    id: string;
    source: string;
    destination: string;
    status: string;
    bidAmount: number;
    date: string;
  }
  
export default function RidesScreen() {
    const renderRide = ({ item }: { item: Ride }) => (
    <View style={styles.rideCard}>
      <View style={styles.header}>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={[
          styles.status,
          { color: item.status === 'Accepted' ? '#4CAF50' : '#FF9800' }
        ]}>{item.status}</Text>
      </View>

      <View style={styles.locationContainer}>
        <View style={styles.locationRow}>
          <MapPin size={20} color="#666" />
          <Text style={styles.locationText}>{item.source}</Text>
        </View>
        <View style={styles.locationRow}>
          <Navigation size={20} color="#666" />
          <Text style={styles.locationText}>{item.destination}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Clock size={16} color="#666" />
        <Text style={styles.bidAmount}>${item.bidAmount}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Rides</Text>
      <FlatList
        data={mockRides}
        renderItem={renderRide}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    paddingTop: 60,
  },
  listContainer: {
    padding: 16,
  },
  rideCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationContainer: {
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  bidAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0066FF',
  },
});