import { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { textStyles, colors, layout, spacing } from "../constants/layout";
import { AuthContext } from "../utils/AuthContext";
import AntDesign from "@expo/vector-icons/AntDesign";
import { api } from "../utils/apiClient";

const CategoryTitle = ({
    categoryName,
    courseId,
    isFocused,
    refreshProgress,
    subtitle
  }) => {
    const { token } = useContext(AuthContext);  
    const [progressPercent, setProgressPercent] = useState(null);
    
    useEffect(() => {
      const fetchProgress = async () => {
        if (!token || !courseId) return;

        try {
          const data = await api.get(
            `/courses/${courseId}/progress`, 
            token
          );

          if (!data) return;

          setProgressPercent(data);

        } catch(error) {
          console.error("Fetch error:", error);
          setProgressPercent(null);
        }
      };
      fetchProgress();
  }, [token, courseId, isFocused, refreshProgress]);

  return (
    <View style={styles.categoryWrapper}>
      <View style={styles.progressWrapper}>
        <AntDesign name="star" size={24} color={colors.yellow} />
        <Text style={styles.progressText}>
          {(progressPercent?.progress.percent ?? 0)} / 100%
        </Text>
      </View>
      <Text style={textStyles.title}>{categoryName}</Text>
      <Text style={textStyles.subtitle}>{subtitle}</Text>
      
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