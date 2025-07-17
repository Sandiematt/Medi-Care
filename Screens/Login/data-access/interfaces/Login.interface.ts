export interface LoginProps {
    navigation: any;
    onLoginSuccess: () => void;
  }
  
  export interface FloatingLabelInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    iconName: string;
    secureTextEntry?: boolean;
    isPasswordInput?: boolean;
    isPasswordVisible?: boolean;
    onTogglePasswordVisibility?: () => void;
  }