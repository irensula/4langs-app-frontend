import { useState, useEffect, useContext } from "react";
import { View, Text, StyleSheet } from "react-native";
import { textStyles, colors, layout, spacing } from "../constants/layout";
import { AuthContext } from "../utils/AuthContext";
import AntDesign from "@expo/vector-icons/AntDesign";
import { api } from "../utils/apiClient";

const CategoryTitle = ({
    categoryName,
    courseId,
    categoryId,
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
            `/courses/${courseId}/categories/${categoryId}/progress`, 
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
      <View style={styles.header}>
        <Text style={[textStyles.title, { marginBottom: 0 }]}>{categoryName}</Text>

        <View style={styles.progressWrapper}>
          <AntDesign name="star" size={24} color={colors.yellow} />
          <Text style={styles.progressText}>
            {progressPercent?.progress.percent ?? 0} / 100%
          </Text>
        </View>
      </View>
      
      <Text style={[textStyles.subtitle, {alignSelf: "flex-start"}]}>{subtitle}</Text>
      
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10
  },
  categoryWrapper: {
    backgroundColor: colors.primary,
    borderBottomWidth: 2,
    borderColor: colors.secondary,
    paddingTop: 15,
    paddingHorizontal: 15
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