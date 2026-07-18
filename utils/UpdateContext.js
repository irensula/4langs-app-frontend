import React, { createContext, useState, useCallback, useContext } from "react";
import { Linking } from "react-native";
import Constants from "expo-constants";

import * as Application from "expo-application";

import { compareVersions } from "./versionUtils";
import { api } from "./apiClient";

export const UpdateContext = createContext();

export function UpdateProvider({ children }) {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const openStore = async () => {
    if (!updateInfo?.playStoreUrl) return;

    try {
        const supported = await Linking.canOpenURL(updateInfo.playStoreUrl);

        if (supported) {
            await Linking.openURL(updateInfo.playStoreUrl);
        }
    } catch (e) {
        console.log(e);
    }
  };

  const checkForUpdate = useCallback(async () => {
    const isExpoGo = Constants.executionEnvironment === "storeClient";

    if (isExpoGo && !__DEV__) {
        return;
    }

    setLoading(true);
    
    try {
        // PRODUCTION
        const currentVersion = Application.nativeApplicationVersion ?? "0.0.0";
        // DEVELOPMENT
        // const currentVersion = __DEV__
        //   ? "1.0.0"
        //   : (Application.nativeApplicationVersion ?? "0.0.0");

        const server = await api.get("/version");
        
        const hasUpdate = compareVersions(currentVersion, server.latestVersion) < 0;

        const forceUpdate = compareVersions(currentVersion, server.minimumVersion) < 0;
        
        setUpdateInfo({
            currentVersion,
            ...server,
            hasUpdate,
            forceUpdate,
        });

    } catch (err) {
      console.log(err);
    
    } finally {
        setLoading(false);
        
    }
  }, []);

  return (
    <UpdateContext.Provider
      value={{
        updateInfo,
        loading,
        checkForUpdate,
        openStore
      }}
    >
      {children}
    </UpdateContext.Provider>
  );
}

export function useUpdate() {
    return useContext(UpdateContext);
}