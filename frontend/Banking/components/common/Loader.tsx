import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useTranslation } from '../../hooks/useTranslation';

interface LoaderProps {
  size?: 'small' | 'large';
  text?: string;
  fullScreen?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
  size = 'large',
  text,
  fullScreen = false
}) => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  const loaderText = text || t('loading', 'common');

  const getContainerStyles = (): StyleProp<ViewStyle>[] => {
    const containerStyles: StyleProp<ViewStyle>[] = [styles.container];

    if (fullScreen) {
      containerStyles.push(styles.fullScreen);
      containerStyles.push(
        isDarkMode ? styles.fullScreenDark : styles.fullScreenLight
      );
    } else {
      containerStyles.push(styles.inline);
    }

    return containerStyles;
  };

  const getTextStyles = (): StyleProp<TextStyle>[] => {
    return [
      styles.text,
      isDarkMode ? styles.textDark : styles.textLight
    ];
  };

  return (
    <View style={getContainerStyles()}>
      <ActivityIndicator
        size={size}
        color={isDarkMode ? '#60A5FA' : '#3B82F6'}
      />
      {loaderText && (
        <Text style={getTextStyles()}>
          {loaderText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline: {
    paddingVertical: 16,
  },
  fullScreen: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fullScreenLight: {
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  fullScreenDark: {
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  text: {
    marginTop: 8,
  },
  textLight: {
    color: '#374151',
  },
  textDark: {
    color: '#D1D5DB',
  },
});

export default Loader;