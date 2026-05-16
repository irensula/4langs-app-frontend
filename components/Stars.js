import { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import { layout, colors } from "../constants/layout";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const Stars = ({ value }) => {
  // animation
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: value,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View>
      {/* animated stars */}
      <View
        style={{
          position: "relative",
          height: 30,
          justifyContent: "center",
        }}
      >
        <View style={{ flexDirection: "row" }}>
          {[...Array(10)].map((_, i) => (
            <MaterialIcons
              key={i}
              name="star-border"
              size={25}
              color={colors.yellow}
            />
          ))}
        </View>

        <Animated.View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width,
            height: "100%",
            overflow: "hidden",
            flexDirection: "row",
          }}
        >
          {[...Array(10)].map((_, i) => (
            <MaterialIcons
              key={i}
              name="star"
              size={25}
              color={colors.yellow}
            />
          ))}
        </Animated.View>
      </View>
    </View>
  );
};

export default Stars;
