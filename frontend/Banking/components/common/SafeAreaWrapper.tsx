import React from 'react';
import { SafeAreaView, View, StatusBar, StyleSheet, ViewProps } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface SafeAreaWrapperProps extends ViewProps {
  children: React.ReactNode;
}

const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({ children, style, ...props }) => {
  const { isDarkMode } = useTheme();

  const backgroundColor = isDarkMode ? '#111827' : '#FFFFFF';
  const barStyle = isDarkMode ? 'light-content' : 'dark-content';

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor }]}
      {...props}
    >
      <StatusBar barStyle={barStyle} backgroundColor={backgroundColor} />
      <View style={[styles.content, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default SafeAreaWrapper;
