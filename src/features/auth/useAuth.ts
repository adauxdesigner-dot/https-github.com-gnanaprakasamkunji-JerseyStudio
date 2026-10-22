import * as React from 'react';
import { entitlementService } from './entitlementService';
import { AuthState } from './types';

export function useAuth() {
  const [authState, setAuthState] = React.useState<AuthState>(entitlementService.getState());

  React.useEffect(() => {
    // Subscribe to entitlement state changes
    const unsubscribe = entitlementService.subscribe((state) => {
      setAuthState(state);
    });

    // Run initial offline verification check
    entitlementService.initialize();

    return () => {
      unsubscribe();
    };
  }, []);

  const requestOtp = React.useCallback(async (email: string) => {
    return entitlementService.requestOtp(email);
  }, []);

  const verifyOtp = React.useCallback(async (email: string, otp: string) => {
    return entitlementService.verifyOtp(email, otp);
  }, []);

  const refreshLicense = React.useCallback(async () => {
    return entitlementService.refreshOnline();
  }, []);

  const logout = React.useCallback(() => {
    entitlementService.logout();
  }, []);

  return {
    ...authState,
    requestOtp,
    verifyOtp,
    refreshLicense,
    logout,
  };
}
