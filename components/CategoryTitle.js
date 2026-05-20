import { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { textStyles, colors, layout, spacing } from "../constants/layout";
import { AuthContext } from "../utils/AuthContext";
import AntDesign from "@expo/vector-icons/AntDesign";
import { api } from "../utils/apiClient";

const CategoryTitle = ({
    categoryID,
    name,
    subtitle,
    isFocused,
    refreshProgress,
    setUnlocked,
  }) => {
    const [progress, setProgress] = useState({
      totalProgress: 0,
      progressPercent: 0,
      unlockNext: false,
    });
    const { token, user } = useContext(AuthContext);    

    useEffect(() => {
      const fetchProgress = async () => {
        if (!token || !user || !categoryID) return;

        try {
          const data = await api.get(
            `/progress/${user.id}/${categoryID}`, 
            token
          );

          if (!data) return;

          setProgress(data);

          if (setUnlocked) {
            setUnlocked(data.unlockNext);
          }

        } catch(error) {
          console.error("Fetch error:", error);
          setProgress({
            totalProgress: 0,
            progressPercent: 0,
            unlockNext: false,
          });
        }
      };
      fetchProgress();
  }, [token, user, categoryID, isFocused, refreshProgress]);

  return (
    <View style={styles.categoryWrapper}>
      <View style={styles.progressWrapper}>
        <AntDesign name="star" size={24} color={colors.yellow} />
        <Text style={styles.progressText}>
          {(progress?.currentScoreAll ?? 0)} / {progress.maxScoreAll}
        </Text>
      </View>
      <Text style={textStyles.title}>{name}</Text>
      {subtitle && <Text style={textStyles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  categoryWrapper: {
    backgroundColor: colors.primary,
    borderBottomWidth: 2,
    borderColor: colors.secondary,
    paddingTop: 15,
  },
  progressWrapper: {
    marginHorizontal: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: colors.secondary,
    flexDirection: "row",
    alignSelf: "flex-end",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
    height: 40,
  },
  progressText: {
    fontFamily: "ABeeZee",
    fontSize: 16,
  },
});

export default CategoryTitle;