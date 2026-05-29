import { useState } from "react";
import { View, Image, Touchable, TouchableOpacity, StyleSheet } from "react-native";
import AvatarsList from "./AvatarsList";
import { getImageUrl } from "../utils/apiClient";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { colors } from "../constants/layout";

const AvatarPicker = ({ avatars, selectedAvatar, onSelect }) => {
    const [open, setOpen] = useState(false);

    if (!avatars || avatars.length === 0) {
        return null;
    }

    const current = 
        avatars?.find(
            (a) => a.imageID === Number(selectedAvatar)
        ) || avatars[0];

        if (open) {
            return (
                <AvatarsList 
                    avatars={avatars}
                    onSelect={(id) => {
                        onSelect(id);
                        setOpen(false);
                    }}
                    selectedImageID={Number(selectedAvatar)}
                />
            );
        }

        return (
            <TouchableOpacity onPress={() => setOpen(true)}>
                    <View style={styles.preview}>
                        <Image 
                            source={{ uri: getImageUrl(current.url) }}
                            style={styles.image}
                        />
                        <View style={styles.overlay}>
                            <MaterialIcons name="edit" size={24} color={colors.darkblue} />
                        </View>
                    </View>
                </TouchableOpacity>
        );
    }

const styles = StyleSheet.create({
    preview: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: colors.darkblue,
        overflow: 'hidden'
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    overlay: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 35,
        backgroundColor: "rgba(21, 143, 212, 0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
})

export default AvatarPicker;