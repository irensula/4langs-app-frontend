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

const SentenceCardScreen = ({ route, navigation }) => {
  const { token } = useContext(AuthContext);
  const { categoryName, courseId, categoryId, exerciseId } = route.params;
  const [sentences, setSentences] = useState([]);
  const [exercise, setExercise] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [hasScored, setHasScored] = useState(false);
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
        
          setSentences(data.content);
          setExercise(data.exercise);

      } catch (error) {
        console.error("Error fetching sentences:", error);
        setSentences([]);
      }
    };
    fetchSentences();
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
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleComplete();
    }
  }
  // GO TO NEXT SCREEN
  const handleNext = () => {
    navigation.navigate("Text", {
      courseId,
      categoryId,
      categoryName,
      exerciseId: exerciseId + 1,
    });
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
        />        
        {/* SENTENCES */}
        <View style={styles.contentContainer}>
          {sentences.length > 0 && (
            // <StudyCard sentence={sentences[currentIndex]} />
            <StudyCard 
              contentId={sentence.content_id}
              image={sentence.image_path}
              studyText={sentence.study}
              translationText={sentence.translation}
              studySound={sentence.study_sound}
              translationSound={sentence.translation_sound}
            />
          )}
          <Pressable
            style={[layout.formButton, {width: "80%"} ]}
            onPress={handleNextCard}
          >
            <Text style={textStyles.formButtonText}>
              {currentIndex < sentences.length - 1 ? "Next" : "Finish"}
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

export default SentenceCardScreen;