import Stars from "../components/Stars";
import { View, Text, StyleSheet } from "react-native";
import { textStyles, colors, layout } from "../constants/layout";

const ProgressCard = ({
  percents,
  totalScore,
  totalMaxScoreAllLanguages,
  value,
  language,
}) => {
  return (
    <View style={[styles.wrapper, layout.shadowStyle]}>
      <Text style={[textStyles.default, { fontSize: 22 }]}>{language}</Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingVertical: 15,
          alignItems: "center",
        }}
      >
        <View>
          <Text style={styles.percents}>{percents} %</Text>
        </View>

        <View>
          <Text style={{ fontSize: 18 }}>Tehtävät tehty</Text>
          <Text style={styles.tasks}>
            {totalScore} / {totalMaxScoreAllLanguages}
          </Text>
        </View>
      </View>
      <Stars value={value} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.lightgreen,
    borderColor: colors.secondary,
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 30,
    marginVertical: 10,
    width: "100%",
  },
  percents: {
    fontSize: 50,
    fontWeight: 800,
    color: colors.violet,
  },
  tasks: {
    fontSize: 20,
  },
});

export default ProgressCard;
