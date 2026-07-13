import { useEffect, useState, useContext } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";

import { useIsFocused } from "@react-navigation/native";

import { AuthContext } from "../utils/AuthContext";
import { api } from "../utils/apiClient";

import shuffledArray from "../utils/shuffledArray";
import { saveProgress } from "../utils/progressService";
import { playUISound } from "../utils/soundUtils";

import MessageModal from "../components/MessageModal";
import CategoryTitle from "../components/CategoryTitle";
import Sentence from "../components/Sentence";
import WordGap from "../components/WordGap";
import NextArrow from "../components/NextArrow";
import Navbar from "../components/Navbar";

import { layout, colors, spacing, textStyles } from "../constants/layout";

const GapsScreen = ({ navigation, route }) => {
  const { token } = useContext(AuthContext);
  const { categoryName, courseId, categoryId, exerciseId } = route.params;

  const [sentences, setSentences] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exercise, setExercise] = useState(null);
  const [words, setWords] = useState([]);
  const [shuffledWords, setShuffledWords] = useState([]);
  
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [answers, setAnswers] = useState({});
  const [resetTrigger, setResetTrigger] = useState(0);

  const [submitted, setSubmitted] = useState(false);
  const [hasScored, setHasScored] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState(null);
  const [modal, setModal] = useState({
      visible: false,
      type: "message",
      title: "",
      message: "",
  });
  const isFocused = useIsFocused();

  useEffect(() => {
      const fetchSentences = async () => {
        try {
          const data = await api.get(
            `/courses/${courseId}/categories/${categoryId}/exercises/${exerciseId}`,
             token
            );
          
            if (!Array.isArray(data.content)) return;
            console.log("data content", data.content);
            setSentences(data.content);
            setExercise(data.exercise);
  
        } catch (error) {
          console.error("Error fetching words list:", error);
          setSentences([]);
        }
      };
      fetchSentences();
    }, [token, courseId, categoryId, exerciseId]);

  const resetGame = () => {
    setShuffledWords(shuffledArray(words));
    setCorrectAnswers({});
    setAnswers({});

    setModalMessage("");
    setModalVisible(false);

    setSubmitted(false);

    setResetTrigger((prev) => prev + 1);
    setRefreshProgress(Date.now());
  };
  // GO TO NEXT SCREEN
  const handleNext = () => {
    navigation.navigate("Course")
  };

  const sentence = sentences[currentIndex];

  return (
    <View style={layout.screen}>
      {/* MESSAGE MODAL */}
      <MessageModal
          visible={modal.visible}
          type={modal.type}
          title={modal.title}
          message={modal.message}
          onClose={() =>
              setModal(prev => ({
                  ...prev,
                  visible: false,
              }))
          }
      />

      <ScrollView contentContainerStyle={layout.scrollContent}>
        {/* CATEGORY TITLLE */}
        <CategoryTitle 
            courseId={courseId} 
            categoryName={categoryName} 
            subtitle={exercise?.name}
            isFocused={isFocused}
            refreshProgress={refreshProgress}
        />

        <View style={layout.wrapper}>
    
          <View style={styles.wordsContainer}>
            {shuffledWords.map((word, index) => (
              <WordGap
                key={index}
                word={word}
              />
            ))}
          </View>
          
          <View style={styles.row}>
            {sentences.length > 0 && (
              <Sentence
                contentId={sentence.content_id}
                image={sentence.image_path}
                studyText={sentence.study}
                translationText={sentence.translation}
                studySound={sentence.study_sound}
                translationSound={sentence.translation_sound}
              />
            )}
          </View>

          <View style={styles.buttonsWrapper}>
            <Pressable
              style={[
                layout.buttonInner,
                { width: "auto", paddingHorizontal: 18, height: 40 },
                submitted && { opacity: 0.5 }
              ]}
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

            <NextArrow handleNext={handleNext} />
          </View>
        </View>
      </ScrollView>

      {/* NAVBAR */}
      <View style={layout.navbarWrapper}>
        <Navbar navigation={navigation} />
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
