import React, { useEffect, useRef, useState, useCallback, useContext, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import { api } from "../utils/apiClient";
import { saveProgress } from "../utils/progressService";
import { playUISound, playSound } from "../utils/soundUtils";

import MessageModal from "../components/MessageModal";
import CategoryTitle from '../components/CategoryTitle';
import StudyCard from '../components/StudyCard';
import NextArrow from '../components/NextArrow';
import Navbar from '../components/Navbar';

import { layout, textStyles, colors } from '../constants/layout';
import AntDesign from "@expo/vector-icons/AntDesign";

import { AuthContext } from '../utils/AuthContext';

const WordCardScreen = ({ route, navigation }) => {
  const { token } = useContext(AuthContext);
  const { categoryName, courseId, categoryId, exerciseId } = route.params;

  const [words, setWords] = useState([]);
  const [exercise, setExercise] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

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
    const fetchWords = async () => {
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
    fetchWords();
  }, [token, courseId, categoryId, exerciseId]);
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
  const handleNextCard = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  }
  // GO TO NEXT SCREEN
  const handleNext = () => {
    navigation.navigate("SentenceCard", {
      courseId,
      categoryId,
      categoryName,
      exerciseId: exerciseId + 1,
    });
  };

  const word = words[currentIndex];

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
      <ScrollView contentContainerStyle={[
        layout.scrollContent,
        { flexGrow: 1 },
      ]}>
        {/* CATEGORY TITLLE */}
        <CategoryTitle 
            courseId={courseId} 
            categoryName={categoryName} 
            subtitle={exercise?.name}
            isFocused={isFocused}
            refreshProgress={refreshProgress}
        />        
        {/* WORDS */}
        <View style={styles.contentContainer}>
          {words.length > 0 && (
            <StudyCard 
              contentId={word.content_id}
              image={word.image_path}
              studyText={word.study}
              translationText={word.translation}
              studySound={word.study_sound}
              translationSound={word.translation_sound}
            />
          )}
          <Pressable
            style={[layout.formButton, {width: "80%"} ]}
            onPress={handleNextCard}
          >
            <Text style={textStyles.formButtonText}>
              {currentIndex < words.length - 1 ? "Next" : "Finish"}
            </Text>
          </Pressable>
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
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
  }
});

export default WordCardScreen;