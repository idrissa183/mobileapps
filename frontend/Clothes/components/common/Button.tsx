// // components/common/Button.tsx
// import React from 'react';
// import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';
// import { styled } from 'nativewind';

// const StyledTouchableOpacity = styled(TouchableOpacity);
// const StyledText = styled(Text);

// type ButtonProps = {
//   title: string;
//   onPress: () => void;
//   variant?: 'primary' | 'secondary' | 'outline';
//   disabled?: boolean;
//   loading?: boolean;
//   fullWidth?: boolean;
// };

// const Button: React.FC<ButtonProps> = ({
//   title,
//   onPress,
//   variant = 'primary',
//   disabled = false,
//   loading = false,
//   fullWidth = false,
// }) => {
//   const getButtonStyles = () => {
//     switch (variant) {
//       case 'primary':
//         return 'bg-blue-500 border-blue-500';
//       case 'secondary':
//         return 'bg-gray-500 border-gray-500';
//       case 'outline':
//         return 'bg-transparent border-blue-500';
//       default:
//         return 'bg-blue-500 border-blue-500';
//     }
//   };

//   const getTextStyles = () => {
//     return variant === 'outline' ? 'text-blue-500' : 'text-white';
//   };

//   return (
//     <StyledTouchableOpacity
//       onPress={onPress}
//       disabled={disabled || loading}
//       className={`py-3 px-6 rounded-lg border ${getButtonStyles()} ${
//         disabled ? 'opacity-50' : 'opacity-100'
//       } ${fullWidth ? 'w-full' : 'w-auto'} flex items-center justify-center`}
//     >
//       {loading ? (
//         <ActivityIndicator color={variant === 'outline' ? '#3B82F6' : 'white'} />
//       ) : (
//         <StyledText className={`font-semibold ${getTextStyles()}`}>{title}</StyledText>
//       )}
//     </StyledTouchableOpacity>
//   );
// };

// export default Button;