import React, { createContext, useEffect } from 'react';
import { authService } from '../services/api';

type AuthState = {
  isLoading: boolean;
  isGuest: boolean;
  isSignout: boolean;
  userToken: string | null;
};

type AuthAction =
  | { type: 'RESTORE_TOKEN'; token: string | null }
  | { type: 'SIGN_IN'; token: string }
  | { type: 'CONTINUE_AS_GUEST' }
  | { type: 'SIGN_OUT' };

type AuthContextValue = {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue>({
  state: {
    isLoading: true,
    isGuest: false,
    isSignout: false,
    userToken: null,
  },
  signIn: async () => {},
  signUp: async () => {},
  continueAsGuest: () => {},
  signOut: async () => {},
});

function authReducer(prevState: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...prevState,
        isGuest: false,
        userToken: action.token,
        isLoading: false,
      };
    case 'SIGN_IN':
      return {
        ...prevState,
        isGuest: false,
        isSignout: false,
        userToken: action.token,
      };
    case 'CONTINUE_AS_GUEST':
      return {
        ...prevState,
        isGuest: true,
        isSignout: false,
        userToken: null,
      };
    case 'SIGN_OUT':
      return {
        ...prevState,
        isGuest: false,
        isSignout: true,
        userToken: null,
      };
    default:
      return prevState;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(authReducer, {
    isLoading: true,
    isGuest: false,
    isSignout: false,
    userToken: null,
  });

  useEffect(() => {
    const bootstrapAsync = async () => {
      let userToken: string | null = null;

      try {
        userToken = await authService.getToken();
      } catch (error) {
        console.error('Failed to restore token:', error);
      }

      dispatch({ type: 'RESTORE_TOKEN', token: userToken });
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async (email: string, password: string) => {
        const result = await authService.login(email, password);
        dispatch({ type: 'SIGN_IN', token: result.token });
      },
      signUp: async (email: string, password: string, displayName: string) => {
        const result = await authService.signup(email, password, displayName);
        dispatch({ type: 'SIGN_IN', token: result.token });
      },
      continueAsGuest: () => {
        dispatch({ type: 'CONTINUE_AS_GUEST' });
      },
      signOut: async () => {
        await authService.logout();
        dispatch({ type: 'SIGN_OUT' });
      },
    }),
    []
  );

  return <AuthContext.Provider value={{ state, ...authContext }}>{children}</AuthContext.Provider>;
}
