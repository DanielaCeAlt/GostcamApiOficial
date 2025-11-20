// =============================================
// CONTEXTO OPTIMIZADO: AppContextUnified
// =============================================

'use client';

import React, { 
  createContext, 
  useContext, 
  useReducer, 
  useEffect, 
  useCallback, 
  useMemo 
} from 'react';
import { DashboardStats, LoginResponse, VistaEquipoCompleto, VistaMovimientoDetallado } from '@/types/database';
import { apiService } from '@/lib/apiService';

// ========================
// TIPOS OPTIMIZADOS
// ========================
interface User {
  idUsuarios: number;
  NombreUsuario: string;
  NivelUsuario: number;
  Correo: string;
  Estatus: number;
  NivelNombre?: string;
}

interface AppState {
  // Autenticación
  auth: {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
  };
  
  // UI State
  ui: {
    isLoading: boolean;
    error: string | null;
    currentSection: string;
  };
  
  // Datos de la aplicación (con cache)
  data: {
    dashboardStats: DashboardStats | null;
    equipos: VistaEquipoCompleto[];
    movimientos: VistaMovimientoDetallado[];
    catalogos: any;
  };
  
  // Configuración
  config: {
    apiMode: 'nextjs' | 'python' | 'hybrid';
  };
}

// ========================
// ACCIONES DEL REDUCER
// ========================
type AppAction =
  // Auth actions
  | { type: 'AUTH_LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_LOGOUT' }
  
  // UI actions
  | { type: 'UI_SET_LOADING'; payload: boolean }
  | { type: 'UI_SET_ERROR'; payload: string | null }
  | { type: 'UI_SET_SECTION'; payload: string }
  | { type: 'UI_CLEAR_ERROR' }
  
  // Data actions
  | { type: 'DATA_SET_DASHBOARD_STATS'; payload: DashboardStats }
  | { type: 'DATA_SET_EQUIPOS'; payload: VistaEquipoCompleto[] }
  | { type: 'DATA_SET_MOVIMIENTOS'; payload: VistaMovimientoDetallado[] }
  | { type: 'DATA_SET_CATALOGOS'; payload: any }
  | { type: 'DATA_CLEAR_ALL' }
  
  // Config actions
  | { type: 'CONFIG_SET_API_MODE'; payload: 'nextjs' | 'python' | 'hybrid' };

// ========================
// ESTADO INICIAL
// ========================
const initialState: AppState = {
  auth: {
    isAuthenticated: false,
    user: null,
    token: null,
  },
  ui: {
    isLoading: false,
    error: null,
    currentSection: 'dashboard',
  },
  data: {
    dashboardStats: null,
    equipos: [],
    movimientos: [],
    catalogos: null,
  },
  config: {
    apiMode: 'nextjs',
  }
};

// ========================
// REDUCER OPTIMIZADO
// ========================
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // Auth cases
    case 'AUTH_LOGIN_SUCCESS':
      return {
        ...state,
        auth: {
          isAuthenticated: true,
          user: action.payload.user,
          token: action.payload.token,
        },
        ui: {
          ...state.ui,
          error: null,
          isLoading: false,
        }
      };
    
    case 'AUTH_LOGOUT':
      return {
        ...initialState,
        config: state.config // Preserve config
      };
    
    // UI cases
    case 'UI_SET_LOADING':
      return {
        ...state,
        ui: { ...state.ui, isLoading: action.payload }
      };
    
    case 'UI_SET_ERROR':
      return {
        ...state,
        ui: { 
          ...state.ui, 
          error: action.payload, 
          isLoading: false 
        }
      };
    
    case 'UI_SET_SECTION':
      return {
        ...state,
        ui: { ...state.ui, currentSection: action.payload }
      };
    
    case 'UI_CLEAR_ERROR':
      return {
        ...state,
        ui: { ...state.ui, error: null }
      };
    
    // Data cases
    case 'DATA_SET_DASHBOARD_STATS':
      return {
        ...state,
        data: { ...state.data, dashboardStats: action.payload }
      };
    
    case 'DATA_SET_EQUIPOS':
      return {
        ...state,
        data: { ...state.data, equipos: action.payload }
      };
    
    case 'DATA_SET_MOVIMIENTOS':
      return {
        ...state,
        data: { ...state.data, movimientos: action.payload }
      };
    
    case 'DATA_SET_CATALOGOS':
      return {
        ...state,
        data: { ...state.data, catalogos: action.payload }
      };
    
    case 'DATA_CLEAR_ALL':
      return {
        ...state,
        data: initialState.data
      };
    
    // Config cases
    case 'CONFIG_SET_API_MODE':
      return {
        ...state,
        config: { ...state.config, apiMode: action.payload }
      };
    
    default:
      return state;
  }
}

// ========================
// CONTEXTO TIPADO
// ========================
interface AppContextType {
  // Estado
  state: AppState;
  
  // Getters memoizados
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  currentSection: string;
  
  // Acciones de autenticación
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Acciones de UI
  setSection: (section: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Acciones de datos
  loadDashboardStats: () => Promise<void>;
  loadEquipos: (filters?: any) => Promise<void>;
  loadMovimientos: (filters?: any) => Promise<void>;
  loadCatalogos: () => Promise<void>;
  
  // Acciones de configuración
  setApiMode: (mode: 'nextjs' | 'python' | 'hybrid') => void;
  
  // Utilidades
  getStatusColor: (status: string) => string;
  getUserRoleColor: (level: number) => string;
  testAltaEquipo: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ========================
// PROVIDER OPTIMIZADO
// ========================
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // ========================
  // GETTERS MEMOIZADOS
  // ========================
  const isAuthenticated = useMemo(() => state.auth.isAuthenticated, [state.auth.isAuthenticated]);
  const user = useMemo(() => state.auth.user, [state.auth.user]);
  const isLoading = useMemo(() => state.ui.isLoading, [state.ui.isLoading]);
  const error = useMemo(() => state.ui.error, [state.ui.error]);
  const currentSection = useMemo(() => state.ui.currentSection, [state.ui.currentSection]);

  // ========================
  // EFECTOS OPTIMIZADOS
  // ========================
  
  // Cargar token desde localStorage al inicializar
  useEffect(() => {
    const savedToken = localStorage.getItem('gostcam_token');
    const savedUser = localStorage.getItem('gostcam_user');
    const savedApiMode = localStorage.getItem('gostcam_api_mode');
    
    if (savedApiMode) {
      dispatch({ 
        type: 'CONFIG_SET_API_MODE', 
        payload: savedApiMode as 'nextjs' | 'python' | 'hybrid' 
      });
    }
    
    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ 
          type: 'AUTH_LOGIN_SUCCESS', 
          payload: { user, token: savedToken } 
        });
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('gostcam_token');
        localStorage.removeItem('gostcam_user');
      }
    }
  }, []);

  // Sincronizar apiService cuando cambie el modo o token
  useEffect(() => {
    apiService.setMode(state.config.apiMode);
    if (state.auth.token) {
      apiService.setToken(state.auth.token);
    }
  }, [state.config.apiMode, state.auth.token]);

  // ========================
  // ACCIONES MEMOIZADAS
  // ========================
  
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'UI_SET_LOADING', payload: true });
    dispatch({ type: 'UI_CLEAR_ERROR' });
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: email, contraseña: password }),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.user && data.token) {
        // Guardar en localStorage
        localStorage.setItem('gostcam_token', data.token);
        localStorage.setItem('gostcam_user', JSON.stringify(data.user));
        
        dispatch({ 
          type: 'AUTH_LOGIN_SUCCESS', 
          payload: { user: data.user, token: data.token } 
        });
        
        return true;
      } else {
        dispatch({ 
          type: 'UI_SET_ERROR', 
          payload: data.message || 'Error de autenticación' 
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ 
        type: 'UI_SET_ERROR', 
        payload: 'Error de conexión' 
      });
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('gostcam_token');
    localStorage.removeItem('gostcam_user');
    dispatch({ type: 'AUTH_LOGOUT' });
    dispatch({ type: 'DATA_CLEAR_ALL' });
  }, []);

  const setSection = useCallback((section: string) => {
    dispatch({ type: 'UI_SET_SECTION', payload: section });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'UI_SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'UI_SET_ERROR', payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'UI_CLEAR_ERROR' });
  }, []);

  const loadDashboardStats = useCallback(async () => {
    if (!state.auth.token) return;
    
    try {
      dispatch({ type: 'UI_SET_LOADING', payload: true });
      dispatch({ type: 'UI_CLEAR_ERROR' });
      
      const data = await apiService.getDashboardStats();

      if (data.success && data.data) {
        dispatch({ 
          type: 'DATA_SET_DASHBOARD_STATS', 
          payload: data.data 
        });
      } else {
        dispatch({ 
          type: 'UI_SET_ERROR', 
          payload: data.error || 'Error cargando dashboard' 
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      dispatch({ 
        type: 'UI_SET_ERROR', 
        payload: 'Error de conexión' 
      });
    } finally {
      dispatch({ type: 'UI_SET_LOADING', payload: false });
    }
  }, [state.auth.token]);

  const loadEquipos = useCallback(async (filters?: any) => {
    if (!state.auth.token) return;
    
    try {
      dispatch({ type: 'UI_SET_LOADING', payload: true });
      const data = await apiService.getEquipos(filters);
      
      if (data.success && data.data) {
        dispatch({ type: 'DATA_SET_EQUIPOS', payload: data.data });
      } else {
        dispatch({ 
          type: 'UI_SET_ERROR', 
          payload: data.error || 'Error cargando equipos' 
        });
      }
    } catch (error) {
      console.error('Error loading equipos:', error);
      dispatch({ 
        type: 'UI_SET_ERROR', 
        payload: 'Error de conexión' 
      });
    } finally {
      dispatch({ type: 'UI_SET_LOADING', payload: false });
    }
  }, [state.auth.token]);

  const loadMovimientos = useCallback(async (filters?: any) => {
    if (!state.auth.token) return;
    
    try {
      dispatch({ type: 'UI_SET_LOADING', payload: true });
      const data = await apiService.getMovimientos(filters);
      
      if (data.success && data.data) {
        dispatch({ type: 'DATA_SET_MOVIMIENTOS', payload: data.data });
      } else {
        dispatch({ 
          type: 'UI_SET_ERROR', 
          payload: data.error || 'Error cargando movimientos' 
        });
      }
    } catch (error) {
      console.error('Error loading movimientos:', error);
      dispatch({ 
        type: 'UI_SET_ERROR', 
        payload: 'Error de conexión' 
      });
    } finally {
      dispatch({ type: 'UI_SET_LOADING', payload: false });
    }
  }, [state.auth.token]);

  const loadCatalogos = useCallback(async () => {
    if (!state.auth.token) return;
    
    try {
      dispatch({ type: 'UI_SET_LOADING', payload: true });
      const data = await apiService.getCatalogos();
      
      if (data.success && data.data) {
        dispatch({ type: 'DATA_SET_CATALOGOS', payload: data.data });
      } else {
        dispatch({ 
          type: 'UI_SET_ERROR', 
          payload: data.error || 'Error cargando catálogos' 
        });
      }
    } catch (error) {
      console.error('Error loading catalogos:', error);
      dispatch({ 
        type: 'UI_SET_ERROR', 
        payload: 'Error de conexión' 
      });
    } finally {
      dispatch({ type: 'UI_SET_LOADING', payload: false });
    }
  }, [state.auth.token]);

  const setApiMode = useCallback((mode: 'nextjs' | 'python' | 'hybrid') => {
    dispatch({ type: 'CONFIG_SET_API_MODE', payload: mode });
    localStorage.setItem('gostcam_api_mode', mode);
  }, []);

  // ========================
  // UTILIDADES MEMOIZADAS
  // ========================
  
  const getStatusColor = useCallback((status: string): string => {
    const statusColors: Record<string, string> = {
      'Activo': 'bg-green-100 text-green-800',
      'Inactivo': 'bg-gray-100 text-gray-800',
      'Con Falla': 'bg-red-100 text-red-800',
      'Mantenimiento': 'bg-yellow-100 text-yellow-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }, []);

  const getUserRoleColor = useCallback((level: number): string => {
    const roleColors: Record<number, string> = {
      1: 'bg-red-100 text-red-800',     // Admin
      2: 'bg-blue-100 text-blue-800',   // Manager
      3: 'bg-green-100 text-green-800', // Técnico
      4: 'bg-gray-100 text-gray-800'    // Usuario
    };
    return roleColors[level] || 'bg-gray-100 text-gray-800';
  }, []);

  const testAltaEquipo = useCallback(async (): Promise<boolean> => {
    if (!state.auth.token) return false;
    
    try {
      dispatch({ type: 'UI_SET_LOADING', payload: true });
      const data = await apiService.testAltaEquipo();
      return data.success;
    } catch (error) {
      console.error('Error testing alta equipo:', error);
      return false;
    } finally {
      dispatch({ type: 'UI_SET_LOADING', payload: false });
    }
  }, [state.auth.token]);

  // ========================
  // VALOR DEL CONTEXTO MEMOIZADO
  // ========================
  const contextValue = useMemo<AppContextType>(() => ({
    // Estado
    state,
    
    // Getters
    isAuthenticated,
    user,
    isLoading,
    error,
    currentSection,
    
    // Auth actions
    login,
    logout,
    
    // UI actions
    setSection,
    setLoading,
    setError,
    clearError,
    
    // Data actions
    loadDashboardStats,
    loadEquipos,
    loadMovimientos,
    loadCatalogos,
    
    // Config actions
    setApiMode,
    
    // Utilities
    getStatusColor,
    getUserRoleColor,
    testAltaEquipo,
  }), [
    state,
    isAuthenticated,
    user,
    isLoading,
    error,
    currentSection,
    login,
    logout,
    setSection,
    setLoading,
    setError,
    clearError,
    loadDashboardStats,
    loadEquipos,
    loadMovimientos,
    loadCatalogos,
    setApiMode,
    getStatusColor,
    getUserRoleColor,
    testAltaEquipo,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// ========================
// HOOK OPTIMIZADO
// ========================
export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp debe ser usado dentro de un AppProvider');
  }
  return context;
}

// Exportar tipos para uso externo
export type { User, AppState, AppContextType };