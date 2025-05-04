import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface InputProps {
  label?: string;
  error?: string;
  leftIcon?: string;
  isPassword?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  [key: string]: any; // Pour les autres props de TextInput
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  isPassword = false,
  containerStyle,
  ...props
}) => {
  const { isDarkMode } = useTheme();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  // Styles dynamiques basés sur le thème et les erreurs
  const getContainerStyles = (): StyleProp<ViewStyle>[] => {
    const containerStyles: StyleProp<ViewStyle>[] = [styles.container];

    if (containerStyle) {
      containerStyles.push(containerStyle);
    }

    return containerStyles;
  };

  const getInputContainerStyles = (): StyleProp<ViewStyle>[] => {
    const inputContainerStyles: StyleProp<ViewStyle>[] = [
      styles.inputContainer,
      isDarkMode ? styles.inputContainerDark : styles.inputContainerLight
    ];

    if (error) {
      inputContainerStyles.push(styles.inputContainerError);
    }

    return inputContainerStyles;
  };

  const getInputStyles = (): StyleProp<TextStyle>[] => {
    const inputStyles: StyleProp<TextStyle>[] = [
      styles.input,
      isDarkMode ? styles.inputDark : styles.inputLight
    ];

    if (leftIcon) {
      inputStyles.push(styles.inputWithIcon);
    }

    return inputStyles;
  };

  const getLabelStyles = (): StyleProp<TextStyle>[] => {
    return [
      styles.label,
      isDarkMode ? styles.labelDark : styles.labelLight
    ];
  };

  return (
    <View style={getContainerStyles()}>
      {label && (
        <Text style={getLabelStyles()}>
          {label}
        </Text>
      )}

      <View style={getInputContainerStyles()}>
        {leftIcon && (
          <View style={styles.iconContainer}>
            <Ionicons
              name={leftIcon as any}
              size={20}
              color={isDarkMode ? '#9CA3AF' : '#6B7280'}
            />
          </View>
        )}

        <TextInput
          style={getInputStyles()}
          placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
          secureTextEntry={isPassword && !passwordVisible}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={isDarkMode ? '#9CA3AF' : '#6B7280'}
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  label: {
    marginBottom: 4,
    fontWeight: '500'
  },
  labelLight: {
    color: '#374151' // text-gray-700
  },
  labelDark: {
    color: '#D1D5DB' // text-gray-300
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6
  },
  inputContainerLight: {
    backgroundColor: '#F9FAFB', // bg-gray-50
    borderColor: '#D1D5DB' // border-gray-300
  },
  inputContainerDark: {
    backgroundColor: '#1F2937', // bg-gray-800
    borderColor: '#374151' // border-gray-700
  },
  inputContainerError: {
    borderColor: '#EF4444' // border-red-500
  },
  input: {
    padding: 12,
    flex: 1
  },
  inputLight: {
    color: '#111827' // text-gray-900
  },
  inputDark: {
    color: '#FFFFFF' // text-white
  },
  inputWithIcon: {
    paddingLeft: 8
  },
  iconContainer: {
    paddingLeft: 12
  },
  eyeIcon: {
    paddingRight: 12
  },
  errorText: {
    color: '#EF4444', // text-red-500
    fontSize: 14,
    marginTop: 4
  }
});

export default Input;













// import React, { useState } from 'react';
// import { View, TextInput, Text, TouchableOpacity, TextInputProps } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { useTheme } from '../../hooks/useTheme';

// interface InputProps extends TextInputProps {
//   label?: string;
//   error?: string;
//   leftIcon?: string;
//   isPassword?: boolean;
//   containerStyle?: any;
// }

// const Input: React.FC<InputProps> = ({
//   label,
//   error,
//   leftIcon,
//   isPassword = false,
//   containerStyle,
//   ...props
// }) => {
//   const { theme, isDarkMode } = useTheme();
//   const [passwordVisible, setPasswordVisible] = useState(false);

//   const togglePasswordVisibility = () => {
//     setPasswordVisible(!passwordVisible);
//   };

//   const inputBgColor = isDarkMode ? 'bg-gray-800' : 'bg-gray-50';
//   const borderColor = error
//     ? 'border-red-500'
//     : isDarkMode ? 'border-gray-700' : 'border-gray-300';
//   const textColor = isDarkMode ? 'text-white' : 'text-gray-900';

//   return (
//     <View className={`mb-4 ${containerStyle}`}>
//       {label && (
//         <Text className={`mb-1 font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
//           {label}
//         </Text>
//       )}

//       <View className={`flex-row items-center border rounded-md ${borderColor} ${inputBgColor}`}>
//         {leftIcon && (
//           <View className="pl-3">
//             <Ionicons
//               name={leftIcon as any}
//               size={20}
//               color={isDarkMode ? '#9CA3AF' : '#6B7280'}
//             />
//           </View>
//         )}

//         <TextInput
//           className={`p-3 flex-1 ${textColor} ${leftIcon ? 'pl-2' : 'pl-4'}`}
//           placeholderTextColor={isDarkMode ? '#9CA3AF' : '#9CA3AF'}
//           secureTextEntry={isPassword && !passwordVisible}
//           {...props}
//         />

//         {isPassword && (
//           <TouchableOpacity onPress={togglePasswordVisibility} className="pr-3">
//             <Ionicons
//               name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
//               size={20}
//               color={isDarkMode ? '#9CA3AF' : '#6B7280'}
//             />
//           </TouchableOpacity>
//         )}
//       </View>

//       {error ? (
//         <Text className="text-red-500 text-sm mt-1">{error}</Text>
//       ) : null}
//     </View>
//   );
// }

// export default Input;