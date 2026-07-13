import { useState, useEffect, useContext } from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

import { AuthContext } from '../utils/AuthContext';
import { api } from "../utils/apiClient";
import { saveProgress } from "../utils/progressService";
import { playUISound, stopSound } from "../utils/soundUtils";

import MessageModal from "../components/MessageModal";
import CategoryTitle from '../components/CategoryTitle';
import TextCard from '../components/TextCard';
import NextArrow from '../components/NextArrow';
import Navbar from '../components/Navbar';

import { layout, textStyles, colors, spacing } from '../constants/layout';

const TextScreen = ({ route, navigation }) => {
    const { token } = useContext(AuthContext);
    const { categoryName, courseId, categoryId, exerciseId } = route.params;

    const [text, setText] = useState([]);
    const [exercise, setExercise] = useState(null);

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
        const fetchText = async () => {
          try {
            const data = await api.get(
              `/courses/${courseId}/categories/${categoryId}/exercises/${exerciseId}`,
               token
              );
            
              if (!Array.isArray(data.content)) return;
            
              setText(data.content);
              setExercise(data.exercise);
    
          } catch (error) {
            console.error("Error fetching words list:", error);
            setText([]);
          }
        };
        fetchText();
      }, [token, courseId, categoryId, exerciseId]);

    // COMPLETE AND SAVE PROGRESS 
    const handleComplete = async () => {
        if (hasScored) return;

        setHasScored(true);

        try {
            await saveProgress({
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
    // stop sound when user goes to another screen
    useEffect(() => {
        if (!isFocused) {
            stopSound();
        }
    }, [isFocused]);
    // GO TO NEXT SCREEN
    const handleNext = () => {
        navigation.navigate("MemoGame", {
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
                    categoryName={categoryName} 
                    subtitle={exercise?.name}
                    isFocused={isFocused}
                    refreshProgress={refreshProgress}
                />

                 {text.map(item => (
                    <TextCard
                        key={item.content_id}
                        contentId={item.content_id}
                        image={item.image_path}
                        studyTitle={item.study_title}
                        studyText={item.study}
                        studySound={item.study_sound}
                        translationTitle={item.translation_title}
                        translationText={item.translation}
                        translationSound={item.translation_sound}
                        handleComplete={handleComplete}
                    />
                ))}

                {/* NEXT ARROW */}
                <NextArrow handleNext={handleNext} />
            
            </ScrollView>

            {/* NAVBAR */}
            <View style={layout.navbarWrapper}>
                <Navbar navigation={navigation} />
            </View>
        </View>
    )
}

export default TextScreen;