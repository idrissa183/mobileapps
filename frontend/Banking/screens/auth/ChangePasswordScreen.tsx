// import React, { useState } from 'react';
// import { 
//   View, 
//   Text, 
//   ScrollView, 
//   SafeAreaView, 
//   StyleSheet, 
//   TouchableOpacity,
//   TextInput,
//   Alert,
//   ActivityIndicator
// } from "react-native";
// import { useTheme } from '../../hooks/useTheme';
// import authService from '../../services/authService';

// const ChangePasswordScreen = ({ navigation }) => {
//   const { isDarkMode } = useTheme();
//   const [loading, setLoading] = useState(false);
//   const [currentPassword, setCurrentPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const containerStyle = isDarkMode ? styles.darkContainer : styles.lightContainer;
//   const cardStyle = isDarkMode ? styles.darkCard : styles.lightCard;
//   const headerTextStyle = isDarkMode ? styles.darkHeaderText : styles.lightHeaderText;
//   const inputStyle = isDarkMode ? styles.darkInput : styles.lightInput;
//   const placeholderTextColor = isDarkMode ? '#9CA3AF' : '#6B7280';
  
//   const validatePassword = (password) => {
//     // Au moins 8 caractères, une majuscule, une minuscule, un chiffre, un caractère spécial
//     const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
//     return regex.test(password);
//   };

//   const handleChangePassword = async () => {
//     // Validation des champs
//     if (!currentPassword || !newPassword || !confirmPassword) {
//       Alert.alert('Erreur', 'Tous les champs sont obligatoires');
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas');
//       return;
//     }

//     if (!validatePassword(newPassword)) {
//       Alert.alert(
//         'Mot de passe trop faible', 
//         'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'
//       );
//       return;
//     }

//     try {
//       setLoading(true);
      
//       // Appel à l'API pour changer le mot de passe
//       await authService.changePassword(