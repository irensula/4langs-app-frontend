import { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const API_BASE = Constants.expoConfig?.extra?.API_BASE;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState(null);
    const [authReady, setAuthReady] = useState(false);
    // load full session from backend
    // validate token
    const loadUser = async (token) => {
       try {
            const res = await fetch(`${API_BASE}/users/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) return false;

            const data = await res.json();
            
            setUser(data.user);
            setCourses(data.courses);
            
            return true;
        } catch {
            console.error("loadUser error:", err);
            return false;
        }
    };

    // initial bootstrap
    useEffect(() => {
        const loadAuthData = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');

                if (!storedToken) {
                    setAuthReady(true);
                    return;
                }
                const ok = await loadUser(storedToken);
                
                if (ok) {
                    setToken(storedToken);
                } else {
                    await AsyncStorage.removeItem("token");
                }
            } catch (error) {
                console.error("Auth load error:", error);
            } finally {
                setAuthReady(true);
            }
        };
        loadAuthData();
    }, []);

    // login
    const login = async (newToken) => {
        try {
            await AsyncStorage.setItem("token", newToken);

            const ok = await loadUser(newToken);

            if (ok) {
                setToken(newToken);
            } else {
                await AsyncStorage.removeItem("token");
            }
        } catch (error) {
            console.error("Login error:", error);
        }
    };

    // logout 
    const logout = async () => {
        try {
            await AsyncStorage.removeItem("token");
        } catch (error) {
            console.error("Logout error:", error);
        }

        setToken(null);
        setUser(null);
        setCourses(null);
    };

    return (
        <AuthContext.Provider 
            value={{ 
                token, 
                user,
                courses, 
                authReady, 
                login, 
                logout 
            }}>
                {children}
        </AuthContext.Provider>
    );
};