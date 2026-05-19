import { useEffect, useState, useContext } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { AuthContext } from "../utils/AuthContext";
import ProgressCard from "../components/ProgressCard";
import Navbar from "../components/Navbar";
import { layout, textStyles, spacing, colors } from "../constants/layout";
import { api } from "../utils/apiClient";

const ProgressScreen = ({ navigation }) => {
  const { user, token } = useContext(AuthContext);
  const [userProgress, setUserProgress] = useState([]);

  useEffect(() => {
    const fetchProgress = async () => {
      
      if (!token || !user?.id) return;

      try {
        const data = await api.get(
          `/progress/${user.id}`, 
          token
        );

        if (!Array.isArray(data)) return;
        
        setUserProgress(data);

      } catch (error) {
        console.error("Error fetching user progress:", error);
        setUserProgress([]);
      }
    };   

    fetchProgress();

  }, [user, token]);

  const currentScoreAll = userProgress?.currentScoreAll || 0;
  const maxScoreAll = userProgress?.maxScoreAll || 0;

  const currentScoreEn = userProgress?.currentScoreEn || 0;
  const currentScoreFi = userProgress?.currentScoreFi || 0;
  const currentScoreUa = userProgress?.currentScoreUa || 0;
  const currentScoreRu = userProgress?.currentScoreRu || 0;

  const maxScorePerLanguage = userProgress?.maxScorePerLanguage || 0;      
    const percentAll =
    maxScoreAll > 0
      ? Math.round((currentScoreAll / maxScoreAll) * 100)
      : 0;

  const percentEn =
    maxScorePerLanguage > 0
      ? Math.round((currentScoreEn / maxScorePerLanguage) * 100)
      : 0;

  const percentFi =
    maxScorePerLanguage > 0
      ? Math.round((currentScoreFi / maxScorePerLanguage) * 100)
      : 0;

  const percentUa =
    maxScorePerLanguage > 0
      ? Math.round((currentScoreUa / maxScorePerLanguage) * 100)
      : 0;

  const percentRu =
    maxScorePerLanguage > 0
      ? Math.round((currentScoreRu / maxScorePerLanguage) * 100)
      : 0;

  const toFraction = (score, max) => {
    if (max === 0) return 0;
    return score / max;
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
              percents={percentAll}
              totalMaxScoreAllLanguages={maxScoreAll}
              totalScore={currentScoreAll}
              value={toFraction(currentScoreAll, maxScoreAll)}
            />

            <ProgressCard
              language={"Englanniksi"}
              percents={percentEn}
              totalMaxScoreAllLanguages={maxScorePerLanguage}
              totalScore={currentScoreEn}
              value={toFraction(currentScoreEn, maxScorePerLanguage)}
            />

            <ProgressCard
              language={"Suomeksi"}
              percents={percentFi}
              totalMaxScoreAllLanguages={maxScorePerLanguage}
              totalScore={currentScoreFi}
              value={toFraction(currentScoreFi, maxScorePerLanguage)}
            />

            <ProgressCard
              language={"Ukrainaksi"}
              percents={percentUa}
              totalMaxScoreAllLanguages={maxScorePerLanguage}
              totalScore={currentScoreUa}
              value={toFraction(currentScoreUa, maxScorePerLanguage)}
            />

            <ProgressCard
              language={"Venäjäksi"}
              percents={percentRu}
              totalMaxScoreAllLanguages={maxScorePerLanguage}
              totalScore={currentScoreRu}
              value={toFraction(currentScoreRu, maxScorePerLanguage)}
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
