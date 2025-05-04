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

  // Déterminer les styles selon variant, taille et état
  const getButtonStyles = (): StyleProp<ViewStyle>[] => {
    const baseStyles: StyleProp<ViewStyle>[] = [styles.button];

    // Styles de variant
    if (variant === 'primary') {
      baseStyles.push(isDarkMode ? styles.primaryDark : styles.primary);
    } else if (variant === 'secondary') {
      baseStyles.push(isDarkMode ? styles.secondaryDark : styles.secondary);
    } else if (variant === 'outline') {
      baseStyles.push(isDarkMode ? styles.outlineDark : styles.outline);
    }

    // Styles de taille
    if (size === 'small') {
      baseStyles.push(styles.small);
    } else if (size === 'medium') {
      baseStyles.push(styles.medium);
    } else if (size === 'large') {
      baseStyles.push(styles.large);
    }

    // Largeur
    if (fullWidth) {
      baseStyles.push(styles.fullWidth);
    }

    // État désactivé
    if (disabled) {
      baseStyles.push(styles.disabled);
    }

    return baseStyles;
  };

  // Déterminer les styles du texte
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
    backgroundColor: '#3B82F6', // blue-500
    borderColor: '#3B82F6',
  },
  primaryDark: {
    backgroundColor: '#2563EB', // blue-600
    borderColor: '#2563EB',
  },
  secondary: {
    backgroundColor: '#E5E7EB', // gray-200
    borderColor: '#E5E7EB',
  },
  secondaryDark: {
    backgroundColor: '#374151', // gray-700
    borderColor: '#374151',
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: '#3B82F6', // blue-500
  },
  outlineDark: {
    backgroundColor: 'transparent',
    borderColor: '#60A5FA', // blue-400
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
    color: '#3B82F6', // blue-500
  },
  outlineTextDark: {
    color: '#60A5FA', // blue-400
  },
  secondaryText: {
    color: '#1F2937', // gray-800
  },
  secondaryTextDark: {
    color: 'white',
  },
});

export default Button;


// import React from 'react';
// import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
// import { useTheme } from '../../hooks/useTheme';

// interface ButtonProps extends TouchableOpacityProps {
//   title: string;
//   variant?: 'primary' | 'secondary' | 'outline';
//   size?: 'small' | 'medium' | 'large';
//   loading?: boolean;
//   fullWidth?: boolean;
// }

// const Button: React.FC<ButtonProps> = ({
//   title,
//   variant = 'primary',
//   size = 'medium',
//   loading = false,
//   fullWidth = false,
//   disabled = false,
//   style,
//   ...props
// }) => {
//   const { theme, isDarkMode } = useTheme();

//   // Styles based on variant
//   const getVariantStyle = () => {
//     switch (variant) {
//       case 'primary':
//         return isDarkMode
//           ? 'bg-blue-600 border-blue-600'
//           : 'bg-blue-500 border-blue-500';
//       case 'secondary':
//         return isDarkMode
//           ? 'bg-gray-700 border-gray-700'
//           : 'bg-gray-200 border-gray-200';
//       case 'outline':
//         return isDarkMode
//           ? 'bg-transparent border-blue-400'
//           : 'bg-transparent border-blue-500';
//     }
//   };

//   // Styles based on size
//   const getSizeStyle = () => {
//     switch (size) {
//       case 'small':
//         return 'py-1 px-3 rounded text-sm';
//       case 'medium':
//         return 'py-2 px-4 rounded-md text-base';
//       case 'large':
//         return 'py-3 px-6 rounded-lg text-lg';
//     }
//   };

//   // Text color based on variant
//   const getTextColor = () => {
//     if (variant === 'outline') {
//       return isDarkMode ? 'text-blue-400' : 'text-blue-500';
//     } else if (variant === 'secondary') {
//       return isDarkMode ? 'text-white' : 'text-gray-800';
//     }
//     return 'text-white';
//   };

//   return (
//     <TouchableOpacity
//       disabled={disabled || loading}
//       className={`border ${getVariantStyle()} ${getSizeStyle()} ${fullWidth ? 'w-full' : 'w-auto'} items-center justify-center ${disabled ? 'opacity-50' : 'opacity-100'}`}
//       style={style}
//       {...props}
//     >
//       {loading ? (
//         <ActivityIndicator color={variant === 'outline' ? (isDarkMode ? '#60A5FA' : '#3B82F6') : 'white'} />
//       ) : (
//         <Text className={`font-semibold ${getTextColor()}`}>{title}</Text>
//       )}
//     </TouchableOpacity>
//   );
// };

// export default Button;