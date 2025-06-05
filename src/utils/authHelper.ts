/**
 * Authentication Helper Utilities
 * Provides utility functions for authentication debugging and troubleshooting
 */

import { supabase } from '../config/supabase';

/**
 * Force check current authentication state
 */
export const forceAuthCheck = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    console.log('🔍 Force Auth Check:', {
      session: !!session,
      user: !!session?.user,
      userId: session?.user?.id,
      email: session?.user?.email,
      error: error?.message
    });

    return {
      hasSession: !!session,
      hasUser: !!session?.user,
      user: session?.user || null,
      error: error?.message || null
    };
  } catch (error: any) {
    console.error('❌ Force auth check failed:', error);
    return {
      hasSession: false,
      hasUser: false,
      user: null,
      error: error.message || 'Unknown error'
    };
  }
};

/**
 * Clear all authentication data and redirect to login
 */
export const clearAuthAndRedirect = () => {
  console.log('🧹 Clearing all auth data...');
  
  // Clear Supabase session
  supabase.auth.signOut();
  
  // Clear local storage
  localStorage.clear();
  
  // Clear session storage
  sessionStorage.clear();
  
  // Redirect to login
  window.location.href = '/login';
};

/**
 * Debug authentication state
 */
export const debugAuthState = async () => {
  const authCheck = await forceAuthCheck();
  
  const debugInfo = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    localStorage: {
      keys: Object.keys(localStorage),
      supabaseAuth: localStorage.getItem('sb-gkcxqgslcbaspnkkzigu-auth-token')
    },
    sessionStorage: {
      keys: Object.keys(sessionStorage)
    },
    authCheck
  };

  console.log('🐛 Complete Auth Debug Info:', debugInfo);
  return debugInfo;
};

/**
 * Test dashboard access
 */
export const testDashboardAccess = () => {
  const currentPath = window.location.pathname;
  const isDashboard = currentPath === '/dashboard';
  
  console.log('🎯 Dashboard Access Test:', {
    currentPath,
    isDashboard,
    canAccess: isDashboard,
    timestamp: new Date().toISOString()
  });

  return {
    currentPath,
    isDashboard,
    canAccess: isDashboard
  };
};

/**
 * Force navigation to dashboard
 */
export const forceDashboardNavigation = () => {
  console.log('🚀 Force navigating to dashboard...');
  window.location.href = '/dashboard';
};

/**
 * Comprehensive authentication troubleshooting
 */
export const troubleshootAuth = async () => {
  console.log('🔧 Starting comprehensive auth troubleshooting...');
  
  const authCheck = await forceAuthCheck();
  const dashboardTest = testDashboardAccess();
  const debugInfo = await debugAuthState();

  const troubleshootingReport = {
    authCheck,
    dashboardTest,
    debugInfo,
    recommendations: []
  };

  // Add recommendations based on findings
  if (!authCheck.hasSession) {
    troubleshootingReport.recommendations.push('No session found - try logging in again');
  }
  
  if (!authCheck.hasUser) {
    troubleshootingReport.recommendations.push('No user in session - authentication may have failed');
  }
  
  if (authCheck.error) {
    troubleshootingReport.recommendations.push(`Auth error: ${authCheck.error}`);
  }
  
  if (!dashboardTest.isDashboard) {
    troubleshootingReport.recommendations.push('Not on dashboard - try navigating manually');
  }

  console.log('📋 Troubleshooting Report:', troubleshootingReport);
  return troubleshootingReport;
};

export default {
  forceAuthCheck,
  clearAuthAndRedirect,
  debugAuthState,
  testDashboardAccess,
  forceDashboardNavigation,
  troubleshootAuth
};
