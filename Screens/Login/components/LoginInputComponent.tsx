import { useState } from "react";
import { Animated, TextInput, View } from "react-native";
import { FloatingLabelInputProps } from "../data-access/interfaces/Login.interface";
import { useRef } from "react";
import Icon from "react-native-vector-icons/Ionicons";
import { TouchableOpacity } from "react-native";
import { LoginInputStyles } from "../data-access/helpers/Login.styles";
import { handleFocus, handleBlur, labelStyle } from "../data-access/helpers/Login.helpers";

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({ label, value, onChangeText, iconName, secureTextEntry, isPasswordInput, isPasswordVisible, onTogglePasswordVisibility }) => {
    const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;
    const [isFocused, setIsFocused] = useState(false);
  
    return (
      <View style={LoginInputStyles.inputContainer}>
        <Animated.Text style={[LoginInputStyles.floatingLabel, labelStyle(animatedValue)]}>
          {label}
        </Animated.Text>
        <View style={LoginInputStyles.inputRow}>
          <View style={LoginInputStyles.iconContainer}>
            <Icon name={iconName} size={20} color={isFocused ? '#199A8E' : '#A0A0A0'} />
          </View>
          <TextInput
            style={[
              LoginInputStyles.input,
              isPasswordInput && { paddingRight: 40 },
              isFocused && LoginInputStyles.inputFocused,
            ]}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => handleFocus(setIsFocused, animatedValue, value)}
            onBlur={() => handleBlur(setIsFocused, animatedValue, value)}
            secureTextEntry={secureTextEntry}
            autoCapitalize="none"
          />
          {isPasswordInput && (
            <TouchableOpacity
              style={LoginInputStyles.eyeIcon}
              onPress={onTogglePasswordVisibility}
            >
              <Icon
                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#199A8E"
              />
            </TouchableOpacity>
          )}
        </View>
        <Animated.View
          style={[
            LoginInputStyles.inputUnderline,
            isFocused && LoginInputStyles.inputUnderlineFocused
          ]} 
        />
      </View>
    );
  };
    