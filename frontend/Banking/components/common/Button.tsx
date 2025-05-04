import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface ButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  [key: string]: any; // Pour les autres props de TouchableOpacity
}

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  disabled = false,
  style,
  ...props
}) => {
  const { isDarkMode } = useTheme();

  const getButtonStyles = (): StyleProp<ViewStyle>[] => {
    const baseStyles: StyleProp<ViewStyle>[] = [styles.button];

    if (variant === 'primary') {
      baseStyles.push(isDarkMode ? styles.primaryDark : styles.primary);
    } else if (variant === 'secondary') {
      baseStyles.push(isDarkMode ? styles.secondaryDark : styles.secondary);
    } else if (variant === 'outline') {
      baseStyles.push(isDarkMode ? styles.outlineDark : styles.outline);
    }

    if (size === 'small') {
      baseStyles.push(styles.small);
    } else if (size === 'medium') {
      baseStyles.push(styles.medium);
    } else if (size === 'large') {
      baseStyles.push(styles.large);
    }

    if (fullWidth) {
      baseStyles.push(styles.fullWidth);
    }

    if (disabled) {
      baseStyles.push(styles.disabled);
    }

    return baseStyles;
  };

  const getTextStyles = (): StyleProp<TextStyle>[] => {
    const textStyles: StyleProp<TextStyle>[] = [styles.text];

    if (variant === 'outline') {
      textStyles.push(isDarkMode ? styles.outlineTextDark : styles.outlineText);
    } else if (variant === 'secondary') {
      textStyles.push(isDarkMode ? styles.secondaryTextDark : styles.secondaryText);
    } else {
      textStyles.push(styles.defaultText);
    }

    return textStyles;
  };

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      style={[...getButtonStyles(), style]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? (isDarkMode ? '#60A5FA' : '#3B82F6') : 'white'}
        />
      ) : (
        <Text style={getTextStyles()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  // Variants
  primary: {
    backgroundColor: '#3B82F6', 
    borderColor: '#3B82F6',
  },
  primaryDark: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  secondary: {
    backgroundColor: '#E5E7EB',
    borderColor: '#E5E7EB',
  },
  secondaryDark: {
    backgroundColor: '#374151', 
    borderColor: '#374151',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#3B82F6', 
  },
  outlineDark: {
    backgroundColor: 'transparent',
    borderColor: '#60A5FA', 
  },
  // Tailles
  small: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  medium: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  large: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  // Largeur
  fullWidth: {
    width: '100%',
  },
  // États
  disabled: {
    opacity: 0.5,
  },
  // Styles de texte
  text: {
    fontWeight: '600',
  },
  defaultText: {
    color: 'white',
  },
  outlineText: {
    color: '#3B82F6',
  },
  outlineTextDark: {
    color: '#60A5FA', 
  },
  secondaryText: {
    color: '#1F2937',
  },
  secondaryTextDark: {
    color: 'white',
  },
});

export default Button;