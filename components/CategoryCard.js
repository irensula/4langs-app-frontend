import { Text, View, Pressable, StyleSheet } from "react-native";
import Svg, { Rect, Polygon, Path, G } from "react-native-svg";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { layout, colors, textStyles, spacing } from "../constants/layout";

const CategoryCard = ({ categories = [], onSelect }) => {
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  return (
    <View style={{ width: "90%" }}>
      {safeCategories.map((category, index) => {
          if (!category) return null;
          
          const status = category.status;
          
        return (
          <Pressable
            key={category?.categoryID ?? index}
            disabled={status === "locked"}
            onPress={() => onSelect?.(category)}
            style={styles.category}
          >
            <Text
              style={[textStyles.subtitle, { opacity: status === "locked" ? 0.4 : 1 }]}
            >
              {category.name}{" "}
              {status === "locked" ? (
                <Entypo name="lock" size={30} color={colors.white} />
              ) : (
                <Entypo name="lock-open" size={30} color={colors.white} />
              )}
            </Text>
            <Text style={[textStyles.subtitle, { opacity: status === "locked" ? 0.4 : 1 }]}>
              {category.percent} / 100%
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  category: {
    padding: 10,
    backgroundColor: colors.violet,
    marginBottom: 5,
    borderColor: colors.lightviolet,
    borderWidth: 2,
    borderRadius: 25,
    alignItems: "center",
  },
});

export default CategoryCard;