export const lightTheme = {
    background: 'bg-white',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    primary: 'bg-blue-500',
    primaryText: 'text-blue-500',
    secondary: 'bg-purple-500',
    secondaryText: 'text-purple-500',
    card: 'bg-white border border-gray-200',
    cardHover: 'hover:bg-gray-50',
    input: 'bg-gray-50 border border-gray-300',
    inputFocus: 'focus:border-blue-500',
    button: 'bg-blue-500 hover:bg-blue-600',
    buttonSecondary: 'bg-gray-200 hover:bg-gray-300',
    shadow: 'shadow',
    divider: 'border-gray-200'
  };
  
  export const darkTheme = {
    background: 'bg-gray-900',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    primary: 'bg-blue-600',
    primaryText: 'text-blue-400',
    secondary: 'bg-purple-600',
    secondaryText: 'text-purple-400',
    card: 'bg-gray-800 border border-gray-700',
    cardHover: 'hover:bg-gray-700',
    input: 'bg-gray-800 border border-gray-700',
    inputFocus: 'focus:border-blue-400',
    button: 'bg-blue-600 hover:bg-blue-700',
    buttonSecondary: 'bg-gray-700 hover:bg-gray-600',
    shadow: 'shadow-dark',
    divider: 'border-gray-700'
  };
  
  export const applyTheme = (themeStyles: ThemeType, specificStyles: { [key: string]: string }): ThemeType & { [key: string]: string } => {
    return { ...themeStyles, ...specificStyles };
  };
  
  export type ThemeType = typeof lightTheme;