import { useState, useEffect, useContext } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { AuthContext } from "../utils/AuthContext";

import shuffledArray from "../utils/shuffledArray";
import WordCard from "../components/WordCard";
import ImageCard from "../components/ImageCard";
import LanguageTabs from "../components/LanguageTabs";
import MessageModal from "../components/MessageModal";
import Navbar from "../components/Navbar";
import NextArrow from "../components/NextArrow";
import CategoryTitle from "../components/CategoryTitle";
import { layout, textStyles } from "../constants/layout";
import { useIsFocused } from "@react-navigation/native";
import { saveProgress } from "../utils/progressService";
import { api } from "../utils/apiClient";

const ConnectScreen = ({ navigation, route }) => {
  const { token, user, loading, logout } = useContext(AuthContext);
  const { name, categoryID } = route.params;
  const [pairs, setPairs] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [activeLanguage, setActiveLanguage] = useState(false);
  const [shuffledWords, setShuffledWords] = useState([]);
  const [shuffledImages, setShuffledImages] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [hasScored, setHasScored] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const isFocused = useIsFocused();
  const [refreshProgress, setRefreshProgress] = useState(0);

  useEffect(() => {

    const fetchConnectTask = async () => {
      if (loading || !token || !user || !categoryID) return;

      try {
        const data = await api.get(
          `/categories/${categoryID}/connect_task`, 
          token
        );

        if (!Array.isArray(data)) return;

        setPairs(data);
      
      } catch (error) {
        console.error("Error fetching connect task:", error);
        setPairs([])
      }
    };
    fetchConnectTask();
  }, [token, categoryID ]);

  useEffect(() => {
    const words = pairs.map((pair) => ({
      word: pair.wordID,
      value: pair[`value_${selectedLanguage}`],
      [`sound_${selectedLanguage}`]: pair[`sound_${selectedLanguage}`],
    }));

    const images = pairs.map((pair) => ({
      image: pair.imageID,
      word_url: pair.word_url,
    }));

    setShuffledWords(shuffledArray(words));
    setShuffledImages(shuffledArray(images));
  }, [pairs, selectedLanguage]);

  const handleWordPress = (word) => {
    if (!activeLanguage) setActiveLanguage(true);

    setSelectedWord(word);
    
    if (selectedImage) {
      const isMatch = selectedImage.image === word.word;
      processMatch(isMatch, word.word);
    }
  };

  const handleImagePress = (image) => {
    setSelectedImage(image);

    if (selectedWord) {
      const isMatch = image.image === selectedWord.word;
      processMatch(isMatch, selectedWord.word);
    }
  };

  const processMatch = (isMatch, wordID) => {
    if (!isMatch) {
      setSelectedWord(null);
      setSelectedImage(null);
      return;
    }

    const updatedPairs = [...matchedPairs, wordID];
    setMatchedPairs(updatedPairs);

    setSelectedWord(null);
    setSelectedImage(null);

    if (updatedPairs.length === pairs.length && !hasScored) {
      handleWin();
    }
  };

  const handleWin = async () => {
  if (hasScored) return;

  setHasScored(true);

  try {
    const maxScore = pairs[0]?.maxScore || 0;

    const result = await saveProgress({
      API_BASE,
      userId: user?.id,
      token,
      exerciseID: pairs[0]?.exerciseID,
      selectedLanguage,
      maxScore,
      categoryID
    });

    setModalMessage(
      `You did it!\nYou've got ${maxScore} stars for ${selectedLanguage.toUpperCase()}.`
    );

    setMessageType("win");
    setModalVisible(true);

    setTimeout(() => {
      resetGame();
    }, 5000);

  } catch (error) {
    console.error(error);

    setModalMessage("Saving failed");
    setMessageType("error");
    setModalVisible(true);

    setHasScored(false);
  }
};

  const resetGame = () => {
    const words = pairs.map((pair) => ({
      word: pair.wordID,
      value: pair[`value_${selectedLanguage}`],
    }));

    const images = pairs.map((pair) => ({
      image: pair.imageID,
      word_url: pair.word_url,
    }));

    setShuffledWords(shuffledArray(words));
    setShuffledImages(shuffledArray(images));
    
    setMatchedPairs([]);
    setSelectedWord(null);
    setSelectedImage(null);
    setActiveLanguage(false);
    setHasScored(false);
    setRefreshProgress(Date.now());
  };

  return (
    <View style={layout.screen}>
      <ScrollView contentContainerStyle={layout.scrollContent}>
        <CategoryTitle
          categoryID={categoryID}
          name={name}
          subtitle="Yhdistä"
          isFocused={isFocused}
          refreshProgress={refreshProgress}
        />

        <MessageModal
          visible={modalVisible}
          message={modalMessage}
          onClose={() => setModalVisible(false)}
        />

        <LanguageTabs
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          activeLanguage={activeLanguage}
        />

        <View
          style={{
            flexDirection: "row",
            gap: 10,
            justifyContent: "space-around",
          }}
        >
          <View>
            {shuffledImages.map((image, index) => (
              <ImageCard
                key={index}
                image={image}
                API_BASE={API_BASE}
                selected={selectedImage?.image === image.image}
                onPress={() => handleImagePress(image)}
                matched={matchedPairs.includes(image.image)}
              />
            ))}
          </View>
          <View>
            {shuffledWords.map((word, index) => (
              <WordCard
                key={index}
                word={word}
                selected={selectedWord?.word === word.word}
                onPress={() => handleWordPress(word)}
                matched={matchedPairs.includes(word.word)}
                API_BASE={API_BASE}
                selectedLanguage={selectedLanguage}
              />
            ))}
          </View>
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
            screen={"MemoScreen"}
            name={name}
            categoryID={categoryID}
            user={user}
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

export default ConnectScreen;
