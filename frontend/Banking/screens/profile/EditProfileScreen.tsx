import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  SafeAreaView, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator
} from "react-native";
import { useTheme } from '../../hooks/useTheme';
import authService from '../../services/authService';
import * as ImagePicker from 'expo-image-picker';

const EditProfileScreen = ({ navigation, route }) => {
  const { userData } = route.params;
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState(userData?.full_name || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [profileImage, setProfileImage] = useState(userData?.profile_image || null);

  const containerStyle = isDarkMode ? styles.darkContainer : styles.lightContainer;
  const cardStyle = isDarkMode ? styles.darkCard : styles.lightCard;
  const headerTextStyle = isDarkMode ? styles.darkHeaderText : styles.lightHeaderText;
  const inputStyle = isDarkMode ? styles.darkInput : styles. lightInput;
  const placeholderTextColor = isDarkMode ? '#9CA3AF' : '#6B7280';
  
  const handlePickImage = async () => {
    // Demander la permission d'accéder à la galerie
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert("Permission refusée", "Nous avons besoin de votre permission pour accéder à votre galerie.");
      return;
    }
    
    // Lancer le sélecteur d'image
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };
  
  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Erreur', 'Le nom complet est obligatoire');
      return;
    }
    
    try {
      setLoading(true);
      
      // Préparer les données de profil à mettre à jour
      const profileData = {
        full_name: fullName,
        phone: phone || null
      };
      
      // Si une nouvelle image a été sélectionnée et diffère de l'image actuelle
      if (profileImage && profileImage !== userData?.profile_image) {
        // Normalement, vous auriez un système de téléchargement de fichiers
        // Pour cet exemple, on simule simplement que l'image est téléchargée
        profileData.profile_image = profileImage;
      }
      
      // Mettre à jour le profil
      const updatedUser = await authService.updateProfile(profileData);
      
      Alert.alert(
        'Succès', 
        'Votre profil a été mis à jour avec succès',
        [
          { 
            text: 'OK', 
            onPress: () => navigation.navigate('Profile', { refresh: true }) 
          }
        ]
      );
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      Alert.alert(
        'Erreur', 
        'Impossible de mettre à jour votre profil. Veuillez réessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, containerStyle]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header avec bouton de retour et titre */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.backButton, headerTextStyle]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, headerTextStyle]}>Modifier le Profil</Text>
          <View style={{ width: 24 }} /> {/* Espace pour équilibrer le header */}
        </View>

        {/* Photo de profil */}
        <View style={styles.photoSection}>
          <TouchableOpacity onPress={handlePickImage}>
            <Image 
              source={profileImage 
                ? { uri: profileImage } 
                : require('../../assets/avatars/avatar2.jpg')} 
              style={styles.profileAvatar} 
            />
            <View style={styles.cameraIconContainer}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={[styles.photoHint, headerTextStyle]}>
            Appuyez pour changer la photo
          </Text>
        </View>

        {/* Formulaire */}
        <View style={[styles.formCard, cardStyle]}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, headerTextStyle]}>Nom complet</Text>
            <TextInput
              style={[styles.input, inputStyle]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Votre nom complet"
              placeholderTextColor={placeholderTextColor}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, headerTextStyle]}>Adresse e-mail</Text>
            <TextInput
              style={[styles.input, inputStyle, styles.disabledInput]}
              value={userData?.email || ''}
              editable={false}
              placeholder="Votre email"
              placeholderTextColor={placeholderTextColor}
            />
            <Text style={styles.emailHint}>L'adresse e-mail ne peut pas être modifiée</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, headerTextStyle]}>Téléphone</Text>
            <TextInput
              style={[styles.input, inputStyle]}
              value={phone}
              onChangeText={setPhone}
              placeholder="+33 6 12 34 56 78"
              placeholderTextColor={placeholderTextColor}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Boutons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Enregistrer</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Espace en bas pour le scrolling */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1E40AF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 20,
  },
  photoHint: {
    marginTop: 10,
    fontSize: 14,
  },
  formCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  disabledInput: {
    opacity: 0.7,
  },
  emailHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 5,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 30,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#9CA3AF',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#1E40AF',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  bottomSpace: {
    height: 40,
  },
  
  // Styles pour le mode clair
  lightContainer: {
    backgroundColor: '#FFFFFF',
  },
  lightCard: {
    backgroundColor: '#F3F4F6',
  },
  lightHeaderText: {
    color: '#111827',
  },
  lightInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#111827',
  },
  
  // Styles pour le mode sombre
  darkContainer: {
    backgroundColor: '#0F172A',
  },
  darkCard: {
    backgroundColor: '#1E293B',
  },
  darkHeaderText: {
    color: '#F9FAFB',
  },
  darkInput: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4B5563',
    color: '#F9FAFB',
  },
});

export default EditProfileScreen;