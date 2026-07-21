import { useState, useEffect, useContext } from "react";
import { ScrollView, View, Text } from "react-native";

import { useIsFocused } from "@react-navigation/native";

import { AuthContext } from "../utils/AuthContext";
import { api } from "../utils/apiClient";

import shuffledArray from "../utils/shuffledArray";
import { playUISound } from "../utils/soundUtils";
import { saveProgress } from "../utils/progressService";

import CategoryTitle from "../components/CategoryTitle";
import WordCard from "../components/WordCard";
import ImageCard from "../components/ImageCard";
import MessageModal from "../components/MessageModal";
import NextArrow from "../components/NextArrow";
import Navbar from "../components/Navbar";

import { layout, textStyles } from "../constants/layout";

const MatchScreen = ({ navigation, route }) => {
  const { token } = useContext(AuthContext);
  const { categoryName, courseId, categoryId, exerciseId } = route.params;
  
  const [pairs, setPairs] = useState([]);
  const [exercise, setExercise] = useState(null); // get max_score per exercise

  const [shuffledWords, setShuffledWords] = useState([]);
  const [shuffledImages, setShuffledImages] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  
  const [hasScored, setHasScored] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState(0);
  const [modal, setModal] = useState({
    visible: false,
    type: "message",
    title: "",
    message: "",
  });
  const isFocused = useIsFocused();

  // GET GAME CONTENT
  useEffect(() => {
    const fetchMatchGame = async () => {
      
      if (!token || !courseId || !categoryId || !exerciseId) return;

      try {
          const data = await api.get(
            `/courses/${courseId}/categories/${categoryId}/exercises/${exerciseId}`,
            token
          );

          if (!Array.isArray(data.content)) return;
          
          setPairs(data.content);
          setExercise(data.exercise);
        } catch (error) {
          console.error("Error fetching matchgame:", error);
          setPairs([]);
      }
    };
    fetchMatchGame();
  }, [token, courseId, categoryId, exerciseId]);
  // GET SHUFFLED WORDS AND EMAGES
  useEffect(() => {
    if (!pairs.length) return;

    setShuffledWords(shuffledArray([...pairs]));
    setShuffledImages(shuffledArray([...pairs]));

    setMatchedPairs([]);
    setSelectedWord(null);
    setSelectedImage(null);
    setHasScored(false);
  }, [pairs]);

  // HANDLE WORD PRESS
  const handleWordPress = (word) => {

    setSelectedWord(word);
    
    if (selectedImage) {
      processMatch(selectedImage.content_id === word.content_id, word.content_id);
    }
  };

  const handleImagePress = (image) => {
    setSelectedImage(image);

    if (selectedWord) {
      processMatch(image.content_id === selectedWord.content_id, image.content_id);
    }
  };

  const processMatch = (isMatch, id) => {
    if (!isMatch) {
      setSelectedWord(null);
      setSelectedImage(null);
      return;
    }

    playUISound("correct");
    const updatedPairs = [...matchedPairs, id];
    setMatchedPairs(updatedPairs);

    setSelectedWord(null);
    setSelectedImage(null);

    if (updatedPairs.length === pairs.length && !hasScored) {
      handleWin();
    }
  };
  // HANDLE WIN
  const handleWin = async () => {
    if (hasScored) return;

    setHasScored(true);
    playUISound("win");

    try {
      await saveProgress({
        courseId,
        categoryId,
        exerciseId,
        token,
      });
      
      setRefreshProgress(Date.now());

      setModal({
        visible: true,
        type: "message",
        title: "",
        message: "Exercise completed!",
        confirmText: "Next",
      });

    } catch (error) {
      setModal({
        visible: true,
        type: "message",
        title: "",
        message: error.response?.error,
        confirmText: "OK",
      }); 
    }

    setTimeout(() => {
      setModal((prev) => ({
        ...prev,
        visible: false,
      }));

      resetGame();
    }, 5000);
  };
  // RESET GAME
  const resetGame = () => {
    setShuffledWords(shuffledArray([...pairs]));
    setShuffledImages(shuffledArray([...pairs]));

    setMatchedPairs([]);
    setSelectedWord(null);
    setSelectedImage(null);
    setHasScored(false);
    setRefreshProgress(Date.now());
  };

  // GO TO NEXT SCREEN
  const handleNext = () => {
    console.log("handleNext");
    navigation.navigate("GapsTask", {
      courseId,
      categoryId,
      categoryName,
      exerciseId: exerciseId + 1,
    });
  };

  return (
    <View style={layout.screen}>
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
        <CategoryTitle
          courseId={courseId}
          categoryId={categoryId}
          categoryName={categoryName}
          subtitle={exercise?.name}
          isFocused={isFocused}
          refreshProgress={refreshProgress}
        />

        <View
          style={{
            flexDirection: "row",
            gap: 10,
            justifyContent: "space-around",
            paddingVertical: 15
          }}
        >
          <View>
            {shuffledImages.map((image, index) => (
              <ImageCard
                key={image.content_id}
                image={image}
                selected={selectedImage?.content_id === image.content_id}
                onPress={() => handleImagePress(image)}
                matched={matchedPairs.includes(image.content_id)}
              />
            ))}
          </View>
          <View>
            {shuffledWords.map((word, index) => (
              <WordCard
                key={word.content_id}
                word={word}
                selected={selectedWord?.content_id === word.content_id}
                onPress={() => handleWordPress(word)}
                matched={matchedPairs.includes(word.content_id)}
              />
            ))}
          </View>
        </View>

        <NextArrow handleNext={handleNext} />

      </ScrollView>

      <View style={layout.navbarWrapper}>
        <Navbar navigation={navigation} />
      </View>
    </View>
  );
};

export default MatchScreen;
