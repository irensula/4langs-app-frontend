import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../utils/AuthContext";
import shuffledArray from "../utils/shuffledArray";
import LanguageTabs from "../components/LanguageTabs";
import MessageModal from "../components/MessageModal";
import Sentence from "../components/Sentence";
import WordGap from "../components/WordGap";
import Navbar from "../components/Navbar";
import NextArrow from "../components/NextArrow";
import { layout, colors, spacing, textStyles } from "../constants/layout";
import CategoryTitle from "../components/CategoryTitle";
import { useIsFocused } from "@react-navigation/native";
import { saveProgress } from "../utils/progressService";
import { api } from "../utils/apiClient";

const GapsScreen = ({ navigation, route }) => {
  const { user, token } = useContext(AuthContext);
  const { name, categoryID } = route.params;
  const [sentences, setSentences] = useState([]);
  const [words, setWords] = useState([]);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [activeLanguage, setActiveLanguage] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [answers, setAnswers] = useState({});
  const [resetTrigger, setResetTrigger] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [refreshProgress, setRefreshProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchGapsTask = async () => {
      
      if (!token || !categoryID) return;

      try {
        const data = await api.get(
          `/categories/${categoryID}/gaps_task`,
          token
        );

        if (!Array.isArray(data)) return;

        setSentences(data);
        setWords(data);

        const shuffled = shuffledArray(data);
        setShuffledWords(shuffled);

      } catch (error) {
        console.error("Error fetching gaps task:", error);
        setSentences([]);
        setWords([]);
      }
    };
    fetchGapsTask();
  }, [token, categoryID]);

  const handleSendAnswers = async () => {
    if (submitted) return;

    const correctCount = calculateScore();

    const maxScore = sentences.length;

    if (!activeLanguage) { 
      setActiveLanguage(true); 
    }

  setSubmitted(true);

  try {
    const result = await saveProgress({
        userId: user?.id,
        token,
        exerciseID: sentences[0]?.exerciseID,
        selectedLanguage,
        maxScore,
        categoryID
      });

    setModalMessage("Good job!");
    setMessageType("win");
    setModalVisible(true);

    setTimeout(() => {
      playUISound("win");
      setModalMessage(
        `You got ${correctCount} out of ${maxScore} correct.`
      );
      setMessageType(correctCount === maxScore ? "win" : "info");
    }, 3000);

    setTimeout(() => {
      setModalMessage("");
      setModalVisible(false);
      resetGame();
      setSubmitted(false);
    }, 6000);
  } catch (error) {
    console.error(error);

    setModalMessage("Saving failed");
    setMessageType("error");
    setModalVisible(true);
    setSubmitted(false);
  }
};

  const resetGame = () => {
    setShuffledWords(shuffledArray(words));
    setCorrectAnswers({});
    setAnswers({});
    setActiveLanguage(false);

    setModalMessage("");
    setModalVisible(false);

    setSubmitted(false);

    setResetTrigger((prev) => prev + 1);
    setRefreshProgress(Date.now());
  };

  const calculateScore = () => {
    let correct = 0;

    sentences.forEach((sentence, index) => {
      const user = answers[index]?.trim().toLowerCase();
      const correctAnswer =
        sentence?.[`answer_${selectedLanguage}`]
          ?.trim()
          .toLowerCase();

        if (user && user === correctAnswer) {
          correct++;
        }
      });

      return correct;
  };

  // when user changes the language
  useEffect(() => {
    setAnswers({});
    setCorrectAnswers({});
    setActiveLanguage(false);
  }, [selectedLanguage]);

  return (
    <View style={layout.screen}>
      <ScrollView contentContainerStyle={layout.scrollContent}>
        <CategoryTitle
          categoryID={categoryID}
          name={name}
          subtitle="Aukkotehtävä"
          isFocused={isFocused}
          refreshProgress={refreshProgress}
        />

        <MessageModal
          visible={modalVisible}
          message={modalMessage}
          onClose={() => setModalVisible(false)}
        />
        <View style={layout.wrapper}>
          <LanguageTabs
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            activeLanguage={activeLanguage}
          />

          <View style={styles.wordsContainer}>
            {shuffledWords.map((word, index) => (
              <WordGap
                key={index}
                word={word}
                selectedLanguage={selectedLanguage}
              />
            ))}
          </View>
          <View style={styles.row}>
            {sentences.map((sentence, index) => (
              <Sentence
                key={index}
                sentence={sentence}
                selectedLanguage={selectedLanguage}
                index={index}
                value={answers[index] || ""}
                onChange={(text) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [index]: text,
                  }))
                }
              />
            ))}
          </View>

          <View style={styles.buttonsWrapper}>
            <Pressable
              style={[
                layout.buttonInner,
                { width: "auto", paddingHorizontal: 18, height: 40 },
                submitted && { opacity: 0.5 }
              ]}
              onPress={handleSendAnswers}
              disabled={submitted}
            >
              <Text style={textStyles.buttonTextInner}>Lähetä</Text>
            </Pressable>

            <Pressable
              style={[
                layout.buttonInner,
                { width: "auto", paddingHorizontal: 15, height: 40 },
              ]}
              onPress={resetGame}
            >
              <Text style={textStyles.buttonTextInner}>
                Käynnistä uudelleen
              </Text>
            </Pressable>

            <NextArrow screen={"Home"} name={name} categoryID={categoryID} />
          </View>
        </View>
      </ScrollView>

      <View style={layout.navbarWrapper}>
        {user && <Navbar user={user} navigation={navigation} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 5,
  },
  row: {
    justifyContent: "center",
  },
  buttonsWrapper: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
});

export default GapsScreen;
