import { useState, useEffect, useContext } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";

import { useIsFocused } from "@react-navigation/native";

import { AuthContext } from "../utils/AuthContext";
import { api } from "../utils/apiClient";

import shuffledArray from "../utils/shuffledArray";
import { playUISound } from "../utils/soundUtils";
import { saveProgress } from "../utils/progressService";

import CategoryTitle from "../components/CategoryTitle";
import MemoCard from "../components/MemoCard";
import MessageModal from "../components/MessageModal";
import NextArrow from "../components/NextArrow";
import Navbar from "../components/Navbar";

import { layout, textStyles, colors } from "../constants/layout";

const MemoScreen = ({ route, navigation }) => {
  const { token } = useContext(AuthContext);
  const { categoryName, courseId, categoryId, exerciseId } = route.params;

  const [originalCards, setOriginalCards] = useState([]);
  const [exercise, setExercise] = useState(null);
  const [memoCards, setMemoCards] = useState([]);

  const [openedCards, setOpenedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [hasScored, setHasScored] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [refreshProgress, setRefreshProgress] = useState(0);
  const isFocused = useIsFocused();

  const doubleAndShuffle = (array) => shuffledArray([...array, ...array]);

  // GET GAME DATA
  useEffect(() => {
    const fetchMemoGame = async () => {
      
      if (!token || !courseId || !categoryId || !exerciseId) return;

      try {
          const data = await api.get(
            `/courses/${courseId}/categories/${categoryId}/exercises/${exerciseId}`,
            token
          );

          if (!Array.isArray(data.content)) return;
          
          const cards = data.content;
          
          setOriginalCards(cards);
          setExercise(data.exercise);
          
          const shuffled = doubleAndShuffle(cards);
          
          setMemoCards(shuffled);
        
        } catch (error) {
          console.error("Error fetching memogame:", error);
          setOriginalCards([]);
      }
    };
    fetchMemoGame();
  }, [token, courseId, categoryId, exerciseId]);
  // CHECK 2 OPENED CARDS
  useEffect(() => {
    if (openedCards.length === 2) {
      const [firstIndex, secondIndex] = openedCards;
      const firstCard = memoCards[firstIndex];
      const secondCard = memoCards[secondIndex];

      setIsDisabled(true);

      const isMatch = firstCard.content_id === secondCard.content_id;

      if (isMatch) {
        setTimeout(() => {
          setMatchedCards((prev) => [...prev, firstIndex, secondIndex]);
          playUISound("correct");
          setOpenedCards([]);
          setIsDisabled(false);
        }, 500);
      } else {
        setTimeout(() => {
          setOpenedCards([]);
          setIsDisabled(false);
        }, 1000);
      }
    }
  }, [openedCards]);
  
  const handleCardPress = (index) => {
    if (
      isDisabled ||
      openedCards.includes(index) ||
      matchedCards.includes(index)
    )
      return;
    const newOpened = [...openedCards, index];
    setOpenedCards(newOpened);
  };
  // CHECK IF GAME IS COMPLETE
  useEffect(() => {
    const handleGameComplete = () => {
      const totalCards = memoCards.length;
      const allMatched = matchedCards.length === totalCards && totalCards > 0;

      if (!allMatched || hasScored) return;

      setHasScored(true);

      const maxScore = exercise?.maxScore ?? 0;

      playUISound("win");

      setModalMessage("Congratulations! All cards found their pairs!");
      setModalVisible(true);
      setMessageType("win");
      setTimeout(() => {
        setModalMessage(
          `You got ${maxScore} stars!`
        );
        setMessageType("success");
      }, 2500);

      saveProgress({
        courseId,
        categoryId,
        exerciseId,
        token
      })
      .then(() => {
          console.log("Progress saved");
        })
      .catch((error) => {
        console.error("Progress save failed:", error);
      });

        setTimeout(() => {
          setModalMessage("");
          setModalVisible(false);
          setOpenedCards([]);
          setMatchedCards([]);
          setMemoCards(doubleAndShuffle(originalCards));
          setHasScored(false);
          setRefreshProgress(Date.now());
        }, 5000);
    };

    handleGameComplete();
    }, [ matchedCards, memoCards.length, hasScored, originalCards,]
  );

  const resetGame = () => {
    setOpenedCards([]);
    setMatchedCards([]);
    setHasScored(false);
    setMemoCards(doubleAndShuffle(originalCards));
  };

  useEffect(() => {
    resetGame();
  }, []);

  return (
    <View style={layout.screen}>
      <MessageModal
          visible={modalVisible}
          message={modalMessage}
          onClose={() => setModalVisible(false)}
      />

      <ScrollView contentContainerStyle={layout.scrollContent}>
        <CategoryTitle
          categoryId={categoryId}
          categoryName={categoryName}
          subtitle={exercise?.name}
          isFocused={isFocused}
          refreshProgress={refreshProgress}
        />
    
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {memoCards.map((card, index) => (
            <MemoCard
              key={index}
              index={index}
              memoCards={card}
              isMatched={matchedCards.includes(index)}
              onPress={handleCardPress}
              isOpened={openedCards.includes(index)}
            />
          ))}
        </View>

        <View style={styles.buttonsWrapper}>
          <Pressable
            style={[
              layout.buttonInner,
              { width: "auto", paddingHorizontal: 20, height: 40 },
            ]}
            onPress={resetGame}
          >
            <Text style={textStyles.buttonTextInner}>Käynnistä uudelleen</Text>
          </Pressable>

          <NextArrow
            screen={"MatchScreen"}
            categoryName={categoryName}
            categoryId={categoryId}
          />
        </View>
      </ScrollView>

      <View style={layout.navbarWrapper}>
        <Navbar navigation={navigation} />
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  buttonsWrapper: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
});

export default MemoScreen;
