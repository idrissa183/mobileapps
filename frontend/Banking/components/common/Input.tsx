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
  [key: string]: any;
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
    color: '#374151'
  },
  labelDark: {
    color: '#D1D5DB'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 6
  },
  inputContainerLight: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D1D5DB'
  },
  inputContainerDark: {
    backgroundColor: '#1F2937',
    borderColor: '#374151'
  },
  inputContainerError: {
    borderColor: '#EF4444'
  },
  input: {
    padding: 12,
    flex: 1
  },
  inputLight: {
    color: '#111827'
  },
  inputDark: {
    color: '#FFFFFF'
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
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4
  }
});

export default Input;