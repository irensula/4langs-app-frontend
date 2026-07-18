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

import { layout, colors, textStyles } from "../constants/layout";

const GapsScreen = ({ navigation, route }) => {
  const { token } = useContext(AuthContext);
  const { categoryName, courseId, categoryId, exerciseId } = route.params;

  const [sentences, setSentences] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exercise, setExercise] = useState(null);
  const [shuffledWords, setShuffledWords] = useState([]);
  
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  const [hasScored, setHasScored] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState(null);
  const [modal, setModal] = useState({
      visible: false,
      type: "message",
      title: "",
      message: "",
  });
  const isFocused = useIsFocused();
  // GET SENTENCES DATA
  useEffect(() => {
      const fetchSentences = async () => {
        try {
          const data = await api.get(
            `/courses/${courseId}/categories/${categoryId}/exercises/${exerciseId}`,
             token
            );
          
            if (!Array.isArray(data.content)) return;
            
            setSentences(data.content);
            setExercise(data.exercise);

            const answers = data.content.map(item => item.answer);
            setShuffledWords(shuffledArray(answers));
  
        } catch (error) {
          console.error("Error fetching words list:", error);
          setSentences([]);
        }
      };
      fetchSentences();
    }, [token, courseId, categoryId, exerciseId]);

    const sentence = sentences[currentIndex];
    // CHECK USER'S ANSWER
    const handleCheck = () => {
      setChecked(true);
      // user's answer to trim and lower case
      const answer = (answers[sentence.content_id] || "")
        .trim()
        .toLowerCase();
      // check user's answer with correct answer
      const correct =
        answer === sentence.answer.trim().toLowerCase();
      // check's result
      setIsCorrect(correct);

      if (correct) {
        playUISound("correct");
        // go to next sentence after correct answer
        if (currentIndex < sentences.length - 1) {
          setTimeout(() => {
            setChecked(false);
            setIsCorrect(null);
            setCurrentIndex(prev => prev + 1);
          }, 500);
        } else {
          handleComplete();
        }
      } else {
        playUISound("wrong");
      }
    };
    // COMPLETE AND SAVE PROGRESS 
    const handleComplete = async () => {
        
        if (hasScored) return;
  
        setHasScored(true);
  
        try {
            await saveProgress
            ({
                courseId,
                categoryId,
                exerciseId,
                token,
            });
  
            playUISound("win");
  
            setModal({
                visible: true,
                type: "message",
                title: "",
                message: "Exercise completed!",
                confirmText: "Next",
            }); 
  
            setRefreshProgress(Date.now());
  
        } catch (error) {
            playUISound("second_win");
            setModal({
                visible: true,
                type: "message",
                title: "",
                message: error.response?.error,
                confirmText: "OK",
            }); 
        }
    };

    // GO TO NEXT SCREEN
    const handleNext = () => {
      navigation.navigate("Category", { courseId: courseId, categoryId: categoryId})
    };
    
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
              categoryId={categoryId}
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
            <View style={{ width: "70%", alignSelf: "center" }}>
              {sentences.length > 0 && (
              
                <Sentence
                  contentId={sentence.content_id}
                  image={sentence.image_path}
                  studyText={sentence.study_sentence}
                  studySound={sentence.study_sound}
                  answer={sentence.answer}
                  translationText={sentence.translation_sentence}
                  translationSound={sentence.translation_sound}
                  translation_answer={sentence.answer}
                  value={answers[sentence.content_id] || ""}
                  onChange={(text) =>
                    setAnswers(prev => ({
                      ...prev,
                      [sentence.content_id]: text,
                    }))
                  }
                  checked={checked}
                  isCorrect={isCorrect}
                />
              )}
              <View style={{ width: "100%", alignItems: "center" }}>
                <Pressable
                  style={layout.formButton}
                  onPress={handleCheck}
                >
                  <Text style={textStyles.formButtonText}>
                    {currentIndex < sentences.length - 1 ? "Check" : "Finish"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
          {/* NEXT ARROW */}
          <NextArrow handleNext={handleNext} />

        </ScrollView>

        {/* NAVBAR */}
        <View style={layout.navbarWrapper}>
          <Navbar navigation={navigation} />
        </View>
      </View>
    );
};

const styles = StyleSheet.create({
  wrapper: {
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center"
  },
  wordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 5,
    alignContent: "center",
    justifyContent: "center"
  }
});

export default GapsScreen;

{/* <View style={{ width: "90%", alignSelf: "center" }}></View>
[
  "I like apples.",
  "I eat {{answer}} every day."
]
{sentences.map((sentence, index) => (
  <View key={index} style={{ flexDirection: "row", flexWrap: "wrap" }}>
    ...
  </View>
))} */}
