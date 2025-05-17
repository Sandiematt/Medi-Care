import React from 'react';
import { Animated, TextInput, View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { FloatingLabelInputProps, GenderPickerProps } from '../data-access/interfaces/Signup.interface';
import { SignupInputStyles } from '../data-access/helpers/Signup.styles';
import { getLabelStyle, getUnderlineStyle } from '../data-access/helpers/Signup.helpers';

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  label,
  value,
  onChangeText,
  iconName,
  secureTextEntry,
  keyboardType,
  field,
  isFocused,
  handleFocus,
  handleBlur,
  labelAnimation
}) => {
  const labelStyle = getLabelStyle(field, labelAnimation);
  const underlineStyle = getUnderlineStyle(field, labelAnimation);

  return (
    <View style={SignupInputStyles.inputContainer}>
      <View style={SignupInputStyles.iconContainer}>
        <Icon name={iconName} size={20} color="#199A8E" />
      </View>
      <View style={SignupInputStyles.inputWrapper}>
        <View style={SignupInputStyles.labelContainer}>
          <Animated.Text style={[SignupInputStyles.floatingLabel, labelStyle]}>
            {label}
          </Animated.Text>
        </View>
        <TextInput
          style={SignupInputStyles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        <Animated.View style={[SignupInputStyles.inputUnderline, underlineStyle]} />
      </View>
    </View>
  );
};

export const GenderPicker: React.FC<GenderPickerProps> = ({
  value,
  onSelect,
  isFocused,
  handleFocus,
  labelAnimation
}) => {
  const [showGenderModal, setShowGenderModal] = React.useState<boolean>(false);
  const labelStyle = getLabelStyle('gender', labelAnimation);
  const underlineStyle = getUnderlineStyle('gender', labelAnimation);

  return (
    <>
      <View style={SignupInputStyles.inputContainer}>
        <View style={SignupInputStyles.iconContainer}>
          <Icon name="people-outline" size={20} color="#199A8E" />
        </View>
        <View style={SignupInputStyles.inputWrapper}>
          <View style={SignupInputStyles.labelContainer1}>
            <Animated.Text style={[SignupInputStyles.floatingLabel, labelStyle]}>
              Gender
            </Animated.Text>
          </View>
          
          <TouchableOpacity
            style={SignupInputStyles.customPickerButton}
            onPress={() => {
              setShowGenderModal(true);
              handleFocus();
            }}
          >
            <Text style={[
              SignupInputStyles.customPickerText,
              !value && { color: '#A0A0A0' }
            ]}>
              {value || "Select Gender"}
            </Text>
            <Icon name="chevron-down-outline" size={16} color="#1A1A1A" />
          </TouchableOpacity>
          
          <Animated.View style={[SignupInputStyles.inputUnderline, underlineStyle]} />
        </View>
      </View>

      {/* Gender Selection Modal */}
      {showGenderModal && (
        <TouchableOpacity
          style={SignupInputStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGenderModal(false)}
        >
          <View style={SignupInputStyles.modalContent}>
            <TouchableOpacity
              style={SignupInputStyles.modalItem}
              onPress={() => {
                onSelect('Male');
                setShowGenderModal(false);
              }}
            >
              <Text style={[SignupInputStyles.modalItemText, value === 'Male' && SignupInputStyles.selectedItemText]}>
                Male
              </Text>
            </TouchableOpacity>
            <View style={SignupInputStyles.modalDivider} />
            <TouchableOpacity
              style={SignupInputStyles.modalItem}
              onPress={() => {
                onSelect('Female');
                setShowGenderModal(false);
              }}
            >
              <Text style={[SignupInputStyles.modalItemText, value === 'Female' && SignupInputStyles.selectedItemText]}>
                Female
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </>
  );
}; 