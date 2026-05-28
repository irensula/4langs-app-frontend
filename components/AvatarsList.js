import { useState, useEffect } from "react";
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from "react-native"; 
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getImageUrl } from "../utils/apiClient";
import { colors } from "../constants/layout";

const AvatarsList = ({ avatars, onSelect, selectedImageID }) => {
    return (
            <FlatList
                contentContainerStyle={styles.listContent}
                horizontal
                data={avatars}
                keyExtractor={(item) => item.imageID.toString()}
                renderItem={({ item }) => {
                    const isSelected = item.imageID === selectedImageID;
                    return (
                        <TouchableOpacity onPress={() => {
                            onSelect?.(item.imageID);
                        }}>
                        <Image
                            source={{ uri: getImageUrl(item.url) }}
                            style={[styles.image, isSelected && styles.selectedImage]}
                        />
                        </TouchableOpacity>
                    );  
                }}
            />
    )
}

const styles=StyleSheet.create({
    listContent: {
        alignItems: "center",
        paddingBottom: 10
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 40,
        margin: 5,
        borderWidth: 2,
        borderColor: colors.secondary,
    },
    selectedImage: {
        borderWidth: 3,
    },
})

export default AvatarsList;