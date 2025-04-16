import { useState } from 'react';
import { Text, StyleSheet, ScrollView, ViewStyle, StyleProp } from 'react-native';
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

      const response = await axios.post('http://192.168.1.156:8002/register/rider', riderData);
      const data = await response.data;
      console.log(data);

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
        setErrors([error.response.data.message]);
      } else {
        setErrors(["Something went wrong."]);
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.container}>
      <Text style={styles.title}>Register as a Rider</Text>

      {errors.length > 0 && errors.map((err, i) => (
        <Text key={i} style={styles.error}>{err}</Text>
      ))}

      <Input icon={<BadgeCheck size={20} />} placeholder="License Number" value={licenseNumber} setValue={setLicenseNumber} />
      <CustomImagePicker
        label="License Photo"
        selectedImageUri={licensePhoto}
        onImageSelect={setLicensePhoto}
        containerStyle={styles.fullWidth}
      />

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
          inputIOS: styles.picker,
          inputAndroid: styles.picker,
        }}
        Icon={() => <Bike size={20} color="#666" style={{ marginRight: 10 }} />}
      />
      <Input icon={<Bike size={20} />} placeholder="Vehicle Name" value={vehicleName} setValue={setVehicleName} />
      <Input icon={<Bike size={20} />} placeholder="Vehicle Model" value={vehicleModel} setValue={setVehicleModel} />
      <CustomImagePicker
        label="Vehicle Photo"
        selectedImageUri={vehiclePhoto}
        onImageSelect={setVehiclePhoto}
        containerStyle={styles.fullWidth}
      />
      <Input icon={<Bike size={20} />} placeholder="Vehicle Number Plate" value={vehicleNumberPlate} setValue={setVehicleNumberPlate} />
      <Input icon={<BadgeCheck size={20} />} placeholder="Email" value={email} setValue={setEmail} />

      <AppButton title="Register as Rider" onPress={handleRegister} style={styles.fullWidth} /> 
      <AppButton
        title="Already have an account? Login"
        onPress={() => router.push('/login')}
        style={StyleSheet.flatten([styles.fullWidth, { backgroundColor: 'transparent' }])}
        textStyle={{ color: '#2196F3' }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 5,
    textAlign: 'center',
  },
  picker: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
    marginBottom: 15,
  },
  fullWidth: {
    width: '100%',
    marginBottom: 15,
  },
});
