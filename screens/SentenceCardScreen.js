import React, { useEffect, useRef, useState, useCallback, useContext, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import { api } from "../utils/apiClient";
import { saveProgress } from "../utils/progressService";
import { playUISound, playSound } from "../utils/soundUtils";

import MessageModal from "../components/MessageModal";
import CategoryTitle from '../components/CategoryTitle';
import WordImageCard from '../components/WordImageCard';
import NextArrow from '../components/NextArrow';
import Navbar from '../components/Navbar';

import { layout, textStyles, colors } from '../constants/layout';
import AntDesign from "@expo/vector-icons/AntDesign";

import { AuthContext } from '../utils/AuthContext';

const SentenceCardScreen = ({ route, navigation }) => {
  const { token } = useContext(AuthContext);
  const { categoryName, courseId, categoryId, exerciseId } = route.params;
  console.log("Route SentenceCardScreen", route.params);
  const [words, setWords] = useState([]);
  const [exercise, setExercise] = useState(null);

  const [hasScored, setHasScored] = useState(false);
  const [modal, setModal] = useState({
      visible: false,
      type: "message",
      title: "",
      message: "",
  });
  
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchWordsList = async () => {
      try {
        const data = await api.get(
          `/courses/${courseId}/categories/${categoryId}/exercises/${exerciseId}`,
           token
          );
        
          if (!Array.isArray(data.content)) return;
        
          setWords(data.content);
          setExercise(data.exercise);

      } catch (error) {
        console.error("Error fetching words list:", error);
        setWords([]);
      }
    };
    fetchWordsList();
  }, [token, courseId, categoryId, exerciseId]);
  // PRESS CARD
  const handlePressCard = async () => {
    console.log("Press the card");
  }
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
    navigation.navigate("SentenceCard", {
      courseId,
      categoryId,
      categoryName,
      exerciseId: exerciseId + 1,
    });
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
            categoryName={categoryName} 
            subtitle={exercise?.name}
            isFocused={isFocused}
        />        
        {/* WORDS LIST */}
        <Text>Sentence Card Screen</Text>
        <View style={styles.listContainer}>
          {words.map((word) => {
            return (
              <WordImageCard word={word} onPress={handlePressCard} />
            );
          })}
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
}
const styles = StyleSheet.create({
  contentContainer: {
    margin: 15
  },
})

export default SentenceCardScreen;