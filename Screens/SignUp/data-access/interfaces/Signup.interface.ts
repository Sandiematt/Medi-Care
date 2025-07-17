export interface SignUpProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

export interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  iconName: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  field: string;
  isFocused: boolean;
  handleFocus: () => void;
  handleBlur: () => void;
  labelAnimation: any;
}

export interface GenderPickerProps {
  value: string;
  onSelect: (gender: string) => void;
  isFocused: boolean;
  handleFocus: () => void;
  labelAnimation: any;
}

export interface FocusState {
  username: boolean;
  email: boolean;
  contact: boolean;
  age: boolean;
  gender: boolean;
  password: boolean;
  confirmPassword: boolean;
  [key: string]: boolean;
} 