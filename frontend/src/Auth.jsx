import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // ponytail: native localstorage, skip complex token managers
    const token = localStorage.getItem('token');
    return token ? { name: 'Admin RT' } : null;
  });

  const login = (email, password) => {
    // ponytail: hardcoded mock login until backend integration
    if (email === 'admin@rt.com' && password === 'admin') {
      localStorage.setItem('token', 'mock-token');
      setUser({ name: 'Admin RT' });
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
