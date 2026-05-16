import { useEffect, useState, useContext } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { AuthContext } from "../utils/AuthContext";
import Constants from "expo-constants";
import ProgressCard from "../components/ProgressCard";
import Navbar from "../components/Navbar";
import { layout, textStyles, spacing, colors } from "../constants/layout";

const ProgressScreen = ({ navigation }) => {
  const API_BASE = Constants.expoConfig?.extra?.API_BASE;
  const { user, token } = useContext(AuthContext);
  const [userProgress, setUserProgress] = useState([]);
  const [totalMaxScore, setTotalMaxScore] = useState(0);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        if (!token || !user?.id) return;
        const res = await fetch(`${API_BASE}/progress/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUserProgress(data);
      } catch (error) {
        console.error("Error fetching user progress:", error);
      }
    };
    fetchProgress();
  }, [user, token]);

  useEffect(() => {
    const fetchTotalMaxScore = async () => {
      try {
        if (!token || !user?.id) return;

        const res = await fetch(`${API_BASE}/max-score`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        setTotalMaxScore(Number(data.totalMaxScore));
      } catch (error) {
        console.error("Error fetching total max score", error);
      }
    };
    fetchTotalMaxScore();
  }, [user, token]);

  const totalScores = userProgress.reduce(
    (totals, progress) => {
      return {
        score_en: totals.score_en + (progress.score_en || 0),
        score_fi: totals.score_fi + (progress.score_fi || 0),
        score_ua: totals.score_ua + (progress.score_ua || 0),
        score_ru: totals.score_ru + (progress.score_ru || 0),
        maxScore: totals.maxScore + (progress.maxScore || 0),
      };
    },
    { score_en: 0, score_fi: 0, score_ua: 0, score_ru: 0, maxScore: 0 }
  );

  const totalScore =
    (totalScores.score_en || 0) +
    (totalScores.score_fi || 0) +
    (totalScores.score_ua || 0) +
    (totalScores.score_ru || 0);

  const totalMaxScoreAllLanguages = totalMaxScore * 4;
  const toFraction = (score, max) => {
    if (max === 0) return 0;
    return score / max;
  };
  const toPercent = (score, max) => {
    if (max === 0) return 0;
    return Math.round((score / max) * 100);
  };

  return (
    <View
      style={[
        layout.screen,
        { paddingHorizontal: 10, backgroundColor: colors.primary },
      ]}
    >
      <ScrollView
        contentContainerStyle={{
          backgroundColor: colors.primary,
          paddingBottom: 80,
        }}
      >
        <View style={layout.container}>
          <View>
            <Text style={[textStyles.title, { color: colors.secondary }]}>
              Edistymisesi
            </Text>

            <ProgressCard
              language={"Kokonaisedistyminen"}
              percents={toPercent(totalScore, totalMaxScoreAllLanguages)}
              totalMaxScoreAllLanguages={totalMaxScoreAllLanguages}
              totalScore={totalScore}
              value={toFraction(totalScore, totalMaxScoreAllLanguages)}
            />

            <ProgressCard
              language={"Englanniksi"}
              percents={toPercent(totalScores.score_en, totalMaxScore)}
              totalMaxScoreAllLanguages={totalMaxScore}
              totalScore={totalScores.score_en}
              value={toFraction(totalScores.score_en, totalMaxScore)}
            />

            <ProgressCard
              language={"Suomeksi"}
              percents={toPercent(totalScores.score_fi, totalMaxScore)}
              totalMaxScoreAllLanguages={totalMaxScore}
              totalScore={totalScores.score_fi}
              value={toFraction(totalScores.score_fi, totalMaxScore)}
            />

            <ProgressCard
              language={"Ukrainaksi"}
              percents={toPercent(totalScores.score_ua, totalMaxScore)}
              totalMaxScoreAllLanguages={totalMaxScore}
              totalScore={totalScores.score_ua}
              value={toFraction(totalScores.score_ua, totalMaxScore)}
            />

            <ProgressCard
              language={"Venäjäksi"}
              percents={toPercent(totalScores.score_ru, totalMaxScore)}
              totalMaxScoreAllLanguages={totalMaxScore}
              totalScore={totalScores.score_ru}
              value={toFraction(totalScores.score_ru, totalMaxScore)}
            />
          </View>
        </View>
      </ScrollView>

      {user && (
        <View style={layout.navbarWrapper}>
          <Navbar user={user} navigation={navigation} />
        </View>
      )}
    </View>
  );
};

export default ProgressScreen;
