import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Lock, Mail, User, Phone, BadgeCheck, Bike } from 'lucide-react-native';
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';
import Input from '@/components/Input';
import AppButton from '@/components/Button';
import CustomImagePicker from '@/components/ImageInput'; // Assuming CustomImagePicker is in this path

type UserRole = 'customer' | 'rider';

export default function riderRegister() {
  const [role, setRole] = useState<UserRole>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullname, setFullname] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  // Rider-specific fields
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licensePhoto, setLicensePhoto] = useState('');
  const [citizenshipNumber, setCitizenshipNumber] = useState('');
  const [citizenshipPhoto, setCitizenshipPhoto] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehiclePhoto, setVehiclePhoto] = useState('');
  const [vehicleNumberPlate, setVehicleNumberPlate] = useState('');
  const [vehicleNumberPlatePhoto, setVehicleNumberPlatePhoto] = useState('');
  const [vehicleBlueBookPhoto, setVehicleBlueBookPhoto] = useState('');

  const handleRegister = async () => {
    try {
      const userData: any = {
        email,
        password,
        fullname,
        phone,
        role,
      };

      if (role === 'rider') {
        userData.licenseNumber = licenseNumber;
        userData.licensePhoto = licensePhoto || '';  // Ensuring it's not null
        userData.citizenshipNumber = citizenshipNumber;
        userData.citizenshipPhoto = citizenshipPhoto || '';  // Ensuring it's not null
        userData.vehicleType = vehicleType;
        userData.vehicleName = vehicleName;
        userData.vehicleModel = vehicleModel;
        userData.vehiclePhoto = vehiclePhoto || '';  // Ensuring it's not null
        userData.vehicleNumberPlate = vehicleNumberPlate;
        userData.vehicleNumberPlatePhoto = vehicleNumberPlatePhoto || '';  // Ensuring it's not null
        userData.vehicleBlueBookPhoto = vehicleBlueBookPhoto || '';  // Ensuring it's not null
      }
      console.log('Sending registration data:', userData);

      const response = await axios.post('http://192.168.1.65:8002/register', userData);
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
        setErrors([error.response.data.message]); // fallback if message is provided
      } else {
        setErrors(["Something went wrong."]);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      {/* Show errors if any */}
      {errors.length > 0 && errors.map((err, i) => (
        <Text key={i} style={styles.error}>{err}</Text>
      ))}

      {/* Role Switch */}
      <View style={styles.roleContainer}>
        {['customer', 'rider'].map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.roleButton, role === r && styles.roleButtonActive]}
            onPress={() => setRole(r as UserRole)}
          >
            <Text style={[styles.roleText, role === r && styles.roleTextActive]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Shared Inputs */}
      <Input icon={<Mail size={20} />} placeholder="Email" value={email} setValue={setEmail} keyboardType="email-address" />
      <Input icon={<Lock size={20} />} placeholder="Password" value={password} setValue={setPassword} secureTextEntry />
      <Input icon={<User size={20} />} placeholder="Full Name" value={fullname} setValue={setFullname} />
      <Input icon={<Phone size={20} />} placeholder="Phone" value={phone} setValue={setPhone} keyboardType="phone-pad" />

      {/* Rider-specific Inputs */}
      {role === 'rider' && (
        <>
          <Input icon={<BadgeCheck size={20} />} placeholder="License Number" value={licenseNumber} setValue={setLicenseNumber} />
          <CustomImagePicker label="License Photo" selectedImageUri={licensePhoto} onImageSelect={setLicensePhoto} />

          <Input icon={<BadgeCheck size={20} />} placeholder="Citizenship Number" value={citizenshipNumber} setValue={setCitizenshipNumber} />
          <CustomImagePicker label="Citizenship Photo" selectedImageUri={citizenshipPhoto} onImageSelect={setCitizenshipPhoto} />

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
          <Input icon={<Bike size={20} />} placeholder="Number Plate" value={vehicleNumberPlate} setValue={setVehicleNumberPlate} />
          <CustomImagePicker label="Number Plate Photo" selectedImageUri={vehicleNumberPlatePhoto} onImageSelect={setVehicleNumberPlatePhoto} />
          <CustomImagePicker label="BlueBook Photo" selectedImageUri={vehicleBlueBookPhoto} onImageSelect={setVehicleBlueBookPhoto} />
        </>
      )}

      <AppButton title="Register" onPress={handleRegister} />
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
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    marginTop: 40,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  roleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0',
  },
  roleButtonActive: {
    backgroundColor: '#007AFF',
  },
  roleText: {
    color: '#666',
  },
  roleTextActive: {
    color: '#fff',
  },
  error: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
});
