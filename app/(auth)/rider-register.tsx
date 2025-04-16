import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { BadgeCheck, Bike } from 'lucide-react-native';
import axios from 'axios';
import Input from '@/components/Input';
import AppButton from '@/components/Button';
import CustomImagePicker from '@/components/ImageInput';
import RNPickerSelect from 'react-native-picker-select';

export default function RiderRegistration() {
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licensePhoto, setLicensePhoto] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePhoto, setVehiclePhoto] = useState('');
  const [vehicleNumberPlate, setVehicleNumberPlate] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [email, setEmail] = useState('');

  const handleRegister = async () => {
    try {
      const riderData: any = {
        licenseNumber,
        licensePhoto,
        vehicleType,
        vehicleName,
        vehicleModel,
        vehiclePhoto,
        vehicleNumberPlate,
        email,
      };

      const response = await axios.post('http://192.168.1.149:8002/register/rider', riderData);
      const data = await response.data;
      console.log(data);

      // After successful registration, navigate to verify email page
      router.replace({
        pathname: '/verify-email',
        params: { email: email, message: `Opt sent to ${email}` }
      });

    } catch (error: any) {
      console.log("Full error:", error);

      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const errorMessages = error.response.data.details.map((err: any) => err.message);
        setErrors(errorMessages);
      } else if (error.response?.data?.message) {
        setErrors([error.response.data.message]); // fallback if message is provided
      } else {
        setErrors(["Something went wrong."]);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>

      <Text style={styles.title}>Register as a Rider</Text>

      {/* Show errors if any */}
      {errors.length > 0 && errors.map((err, i) => (
        <Text key={i} style={styles.error}>{err}</Text>
      ))}

      {/* Rider-specific Inputs */}
      <Input icon={<BadgeCheck size={20} />} placeholder="License Number" value={licenseNumber} setValue={setLicenseNumber} />
      <CustomImagePicker label="License Photo" selectedImageUri={licensePhoto} onImageSelect={setLicensePhoto} />

      <RNPickerSelect
        onValueChange={(value) => setVehicleType(value)}
        placeholder={{ label: 'Select Vehicle Type', value: '' }}
        items={[
          { label: 'Bike', value: 'bike' },
          { label: 'Car', value: 'car' },
          { label: 'Scooter', value: 'scooter' },
          { label: 'Other', value: 'other' },
        ]}
        style={{
          inputIOS: {
            paddingVertical: 12,
            paddingHorizontal: 10,
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            color: 'black',
            paddingRight: 30,
            marginBottom: 15,
          },
          inputAndroid: {
            paddingVertical: 12,
            paddingHorizontal: 10,
            borderWidth: 1,
            borderColor: '#ddd',
            borderRadius: 8,
            color: 'black',
            paddingRight: 30,
            marginBottom: 15,
          },
        }}
        Icon={() => <Bike size={20} color="#666" style={{ marginRight: 10 }} />}
      />
      <Input icon={<Bike size={20} />} placeholder="Vehicle Name" value={vehicleName} setValue={setVehicleName} />
      <Input icon={<Bike size={20} />} placeholder="Vehicle Model" value={vehicleModel} setValue={setVehicleModel} />
      <CustomImagePicker label="Vehicle Photo" selectedImageUri={vehiclePhoto} onImageSelect={setVehiclePhoto} />
      <Input icon={<Bike size={20} />} placeholder="Vehicle Number Plate" value={vehicleNumberPlate} setValue={setVehicleNumberPlate} />

      {/* Register Button */}
      <AppButton title="Register as Rider" onPress={handleRegister} style={styles.fullWidth} />
      <AppButton
        title="Already have an account? Login"
        onPress={() => router.push('/login')}
        style={{ backgroundColor: 'transparent' }}
        textStyle={{ color: '#2196F3' }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    marginTop: 20,
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  fullWidth: {
    width: '100%',
  },
});
