import { useState, useEffect, useContext } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { AuthContext } from "../utils/AuthContext";

import shuffledArray from "../utils/shuffledArray";
import { playUISound } from "../utils/soundUtils";
import LanguageTabs from "../components/LanguageTabs";
import MemoCard from "../components/MemoCard";
import MessageModal from "../components/MessageModal";
import Navbar from "../components/Navbar";
import NextArrow from "../components/NextArrow";
import { layout, textStyles, colors, spacing } from "../constants/layout";
import CategoryTitle from "../components/CategoryTitle";
import { saveProgress } from "../utils/progressService";
import { api } from "../utils/apiClient";

const MemoScreen = ({ route, navigation }) => {
  const { name, categoryID } = route.params;
  const { user, token } = useContext(AuthContext);
  const [originalCards, setOriginalCards] = useState([]);
  const [memoCards, setMemoCards] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const [openedCards, setOpenedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState(false);
  const [hasScored, setHasScored] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [refreshProgress, setRefreshProgress] = useState(0);
  const isFocused = useIsFocused();

  const doubleAndShuffle = (array) => shuffledArray([...array, ...array]);

  useEffect(() => {
    const fetchMemoGame = async () => {
      
      if (!token || !categoryID) return;

      try {
          const data = await api.get(
            `/categories/${categoryID}/memogame`,
            token
          );

          if (!Array.isArray(data)) return;
        
          setOriginalCards(data);
          
          const shuffled = doubleAndShuffle(data);
          setMemoCards(shuffled);
      
        } catch (error) {
          console.error("Error fetching memogame:", error);
          setOriginalCards([]);
      }
    };
    fetchMemoGame();
  }, [token, categoryID]);

  useEffect(() => {
    if (openedCards.length === 2) {
      const [firstIndex, secondIndex] = openedCards;
      const firstCard = memoCards[firstIndex];
      const secondCard = memoCards[secondIndex];

      setIsDisabled(true);

      const isMatch = firstCard.wordID === secondCard.wordID;

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
    if (!activeLanguage) {
      setActiveLanguage(true);
    }
    const newOpened = [...openedCards, index];
    setOpenedCards(newOpened);
  };

  const handleGameComplete = async () => {
    const totalCards = memoCards.length;
    const allMatched = matchedCards.length === totalCards && totalCards > 0;

    if (!allMatched || hasScored) return;

    setHasScored(true);

     const maxScore = originalCards[0]?.maxScore || 0;

    playUISound("win");
    setModalMessage("Congratulations! All cards matched.");
    setMessageType("win");
    setModalVisible(true);

    setTimeout(() => {
      setModalMessage(
        `You've got ${maxScore} stars for ${selectedLanguage.toUpperCase()}.`
      );
      setMessageType("success");
    }, 2500);

    try {
      const result = await saveProgress({
        userId: user?.id,
        token,
        exerciseID: originalCards[0]?.exerciseID,
        selectedLanguage,
        maxScore,
        categoryID
      });

      setTimeout(() => {
        setModalMessage("");
        setModalVisible(false);
        setOpenedCards([]);
        setMatchedCards([]);
        setMemoCards(doubleAndShuffle(originalCards));
        setActiveLanguage(false);
        setHasScored(false);
        setRefreshProgress(Date.now());
      }, 5000);

    } catch (error) {
      console.error(error);

      setModalMessage("Saving failed");
      setMessageType("error");
      setModalVisible(true);
      setHasScored(false);
    }
  };

  useEffect(() => {
  handleGameComplete();
}, [
  matchedCards,
  memoCards.length,
  hasScored,
  originalCards,
  selectedLanguage
]);

  const resetGame = () => {
    setOpenedCards([]);
    setMatchedCards([]);
    setHasScored(false);
    setActiveLanguage(false);
    setMemoCards(doubleAndShuffle(originalCards));
  };

  useEffect(() => {
    resetGame();
  }, [selectedLanguage]);

  return (
    <View style={layout.screen}>
      <ScrollView contentContainerStyle={layout.scrollContent}>
        <CategoryTitle
          categoryID={categoryID}
          name={name}
          subtitle="Memopeli"
          isFocused={isFocused}
          refreshProgress={refreshProgress}
        />

        <LanguageTabs
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          activeLanguage={activeLanguage}
        />

        <MessageModal
          visible={modalVisible}
          message={modalMessage}
          onClose={() => setModalVisible(false)}
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
              isOpened={openedCards.includes(index)}
              isMatched={matchedCards.includes(index)}
              onPress={handleCardPress}
              selectedLanguage={selectedLanguage}
            />
          ))}
        </View>

        <View style={styles.buttonsWrapper}>
          <Pressable
            style={[
              layout.buttonInner,
              { width: "auto", paddingHorizontal: 20, height: 40 },
            ]}
            onPress={() => {resetGame}}
          >
            <Text style={textStyles.buttonTextInner}>Käynnistä uudelleen</Text>
          </Pressable>

          <NextArrow
            screen={"ConnectScreen"}
            name={name}
            categoryID={categoryID}
          />
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

const styles = StyleSheet.create({
  buttonsWrapper: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
});

export default MemoScreen;
