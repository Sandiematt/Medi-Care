import { StyleSheet } from "react-native";

export const LoginStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    keyboardView: {
      flex: 1,
    },
    contentContainer: {
      flex: 1,
      justifyContent: 'space-between',
    },
    header: {
      backgroundColor: '#1d958b',
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    logoContainer: {
      width: 140,
      height: 140,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000000',
      borderRadius: 70,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 8,
    },
    logo: {
      width: 150,
      height: 150,
    },
    formContainer: {
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 16,
      flex: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      fontFamily: 'Poppins-Bold',
      color: '#1A1A1A',
      textAlign: 'center',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      color: '#666666',
      textAlign: 'center',
      marginBottom: 16,
    },
    loginButton: {
      backgroundColor: '#199A8E',
      borderRadius: 12,
      paddingVertical: 14,
      marginTop: 20,
      marginBottom: 20,
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
      fontFamily: 'Poppins-Bold',
      textAlign: 'center',
    },
    signupContainer: {
      alignItems: 'center',
      marginTop: 16,
    },
    signupText: {
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
      color: '#718096',
    },
    signupLink: {
      color: '#199A8E',
      fontFamily: 'Poppins-Bold',
      fontWeight: 'bold',
    },
    separatorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 8,
      width: '100%',
    },
    separator: {
      flex: 1,
      height: 1,
      backgroundColor: '#E2E8F0',
    },
    separatorText: {
      paddingHorizontal: 10,
      color: '#718096',
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
    },
    googleSignupButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 24,
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#E2E8F0',
      marginTop: 15,
      width: '100%',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    googleIcon: {
      marginRight: 12,
    },
    googleSignupLink: {
      color: '#000000',
      fontFamily: 'Poppins-Medium',
      fontWeight: '600',
      fontSize: 16,
    },
    errorText: {
      color: '#DC2626',
      textAlign: 'center',
      marginTop: 8,
      fontSize: 14,
      fontFamily: 'Poppins-Regular',
    },
  });

  export const LoginInputStyles = StyleSheet.create({
    inputContainer: {
        marginBottom: 16,
        height: 60,
        justifyContent: 'flex-end',
      },
    iconContainer: {
        width: 24,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
      },
      inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
      },
      floatingLabel: {
        position: 'absolute',
        backgroundColor: 'transparent',
        fontWeight: '500',
        fontFamily: 'Poppins-Medium',
      },
      input: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Poppins-Regular',
        color: '#1A1A1A',
        padding: 0,
        height: '100%',
      },
      inputFocused: {
        color: '#199A8E',
      },
      inputUnderline: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginTop: 4,
      },
      inputUnderlineFocused: {
        height: 2,
        backgroundColor: '#199A8E',
      },
      eyeIcon: {
        padding: 8,
        justifyContent: 'center',
      },
    })