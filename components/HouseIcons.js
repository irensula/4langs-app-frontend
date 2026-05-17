import { Text, View, Pressable, StyleSheet } from "react-native";
import Svg, { Rect, Polygon, Path, G } from "react-native-svg";
import { Entypo, MaterialIcons } from "@expo/vector-icons";
import { layout, colors, textStyles, spacing } from "../constants/layout";

const HouseIcons = ({ categories = [], onSelect }) => {
  const safeCategories = Array.isArray(categories) ? categories : [];
  
  return (
    <View style={{ width: "90%" }}>
      {safeCategories.map((category, index) => {
          if (!category) return null;
          const isLocked = !category.isOpen;
        return (
          <Pressable
            key={category?.categoryID ?? index}
            disabled={isLocked}
            onPress={() => onSelect?.(category)}
            style={styles.category}
          >
            <Text
              style={[textStyles.subtitle, { opacity: isLocked ? 0.4 : 1 }]}
            >
              {category.name}{" "}
              {Entypo ? (
                  isLocked ? (
                    <Entypo name="lock" size={30} color={colors.white} />
                  ) : (
                    <Entypo name="lock-open" size={30} color={colors.white} />
                  )
                ) : null }
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

export default HouseIcons;
