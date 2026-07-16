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
  const [checked, setChecked] = useState(false);
  
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

  const checkForUpdate = async () => {
    if (Constants.executionEnvironment === "storeClient") {
        return;
    }

    setLoading(true);
    
    try {

        const currentVersion = Application.nativeApplicationVersion ?? "0.0.0";
      
        const response = await api.get("/version");

        const server = response;

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
        setChecked(true);
    }
  };

  return (
    <UpdateContext.Provider
      value={{
        updateInfo,
        loading,
        checked,
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