import { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
const API_BASE = Constants.expoConfig.extra.API_BASE;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // validate token
    const validateToken = async (token) => {
        try {
            const res = await fetch(`${API_BASE}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
            });

            return res.ok;
        } catch {
            return false;
        }
    };

    // initial load
    useEffect(() => {
        const loadAuthData = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                const storedUser = await AsyncStorage.getItem('user');
                let parsedUser = null;

                if (storedUser) {
                    try {
                        parsedUser = JSON.parse(storedUser);
                    } catch (e) {
                        console.log("Broken user in storage");
                        await AsyncStorage.removeItem("user");
                    }
                }

                if (storedToken && parsedUser?.id) {
                    const isValid = await validateToken(storedToken);

                    if (isValid) {
                        setToken(storedToken);
                        setUser(parsedUser);
                    } else {
                        await AsyncStorage.removeItem("token");
                        await AsyncStorage.removeItem("user");
                        setToken(null);
                        setUser(null);
                    }
                } else {
                    await AsyncStorage.removeItem("token");
                    await AsyncStorage.removeItem("user");
                    setToken(null);
                    setUser(null);
                } 
            } catch (error) {
                console.error("Auth load error:", error);
                setToken(null);
                setUser(null);
            } finally {
                setLoading(false); 
            }
        };
        loadAuthData();
    }, []);

    // login
    const login = async (newToken, newUser) => {
        try {
            await AsyncStorage.setItem("token", newToken);
            await AsyncStorage.setItem("user", JSON.stringify(newUser));

            setToken(newToken);
            setUser(newUser);
        } catch (e) {
            console.error("Login error:", e);
        }
    };

    // logout 
    const logout = async () => {
        try {
            await AsyncStorage.removeItem("token");
            await AsyncStorage.removeItem("user");
        } catch (e) {
            console.error("Logout error:", e);
        }

        setToken(null);
        setUser(null);
    };

    // update user
    const updateUser = async (newUser) => {
        try {
            await AsyncStorage.setItem("user", JSON.stringify(newUser));
            setUser(newUser);
        } catch (e) {
            console.error("Update user error:", e);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};