// Type declarations for Google Sign-In
declare module '@react-native-google-signin/google-signin' {
  export interface SignInResponseUser {
    id: string;
    name?: string;
    email: string;
    photo?: string;
    familyName?: string;
    givenName?: string;
  }

  export interface SignInSuccessResponse {
    idToken: string;
    serverAuthCode: string;
    scopes: string[];
    // Direct user properties
    id: string;
    name?: string;
    email: string;
    photo?: string;
    familyName?: string;
    givenName?: string;
  }

  export type SignInErrorResponse = {
    code: number;
    message: string;
  };

  export type SignInResponse = SignInSuccessResponse | SignInErrorResponse;

  export const statusCodes: {
    SIGN_IN_CANCELLED: number;
    IN_PROGRESS: number;
    PLAY_SERVICES_NOT_AVAILABLE: number;
  };

  export const GoogleSignin: {
    configure: (options: any) => void;
    hasPlayServices: (options?: any) => Promise<boolean>;
    signIn: () => Promise<SignInSuccessResponse>;
    signOut: () => Promise<null>;
    isSignedIn: () => Promise<boolean>;
    getTokens: () => Promise<{ idToken: string; accessToken: string }>;
    // Add other methods as needed
  };
} 