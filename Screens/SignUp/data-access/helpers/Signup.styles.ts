import { StyleSheet } from 'react-native';

export const SignupStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#199A8E',
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  signupButton: {
    backgroundColor: '#199A8E',
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 24,
    marginBottom: 16,
    shadowColor: '#199A8E',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loginContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    color: '#718096',
  },
  loginLink: {
    color: '#199A8E',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
});

export const SignupInputStyles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    height: 56,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    height: 56,
    justifyContent: 'center',
    position: 'relative',
  },
  labelContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  labelContainer1: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    height: 56,
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  floatingLabel: {
    position: 'absolute',
    left: 0,
    paddingHorizontal: 0,
    fontWeight: '500',
  },
  input: {
    fontSize: 16,
    color: '#1A1A1A',
    padding: 0,
    height: 24,
    marginTop: 16,
    zIndex: 2,
  },
  inputUnderline: {
    height: 1,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
  customPickerButton: {
    height: 40,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
    zIndex: 3,
  },
  customPickerText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  modalItemText: {
    fontSize: 16,
    color: '#1A1A1A',
    textAlign: 'center',
  },
  selectedItemText: {
    color: '#199A8E',
    fontWeight: 'bold',
  },
  modalDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
  },
}); 