import { useState, useEffect } from "react";
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from "react-native"; 
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getImageUrl } from "../utils/apiClient";

const AvatarsList = ({ avatars, onSelect, selectedImageID: propSelectedImageID }) => {
    const [selectedImageID, setSelectedImageID] = useState(propSelectedImageID || null);
    const [showAllAvatars, setShowAllAvatars] = useState(false);

    useEffect(() => {
        if (avatars.length > 0) {
            const found = avatars.find(a => a.imageID === propSelectedImageID);
            if (found) {
                setSelectedImageID(propSelectedImageID);
            } else {
            setSelectedImageID(avatars[0].imageID);
            onSelect && onSelect(avatars[0].imageID);
            }
        } 
    }, [avatars, propSelectedImageID]);

    return (
        <View>
        {showAllAvatars ? (
            <FlatList
                horizontal
                data={avatars}
                keyExtractor={item => item.imageID.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => {
                        setSelectedImageID(item.imageID);
                        onSelect && onSelect(item.imageID);
                    }}>
                    <Image
                        source={{ uri: getImageUrl(item.url) }}
                        style={styles.image}
                    />
                    </TouchableOpacity>
                )}
                />
            ) : (
                    avatars.length > 0 && (
                        <TouchableOpacity
                            onPress={() => {
                                setShowAllAvatars(true);
                            }}
                        >
                            <View style={{ position: 'relative' }}>
                                <Image
                                    source={{
                                        uri: avatars?.length > 0 ? getImageUrl(avatars[0].url) : undefined
                                    }}
                                    style={styles.imageEdit}
                                />
                                <View style={styles.editOverlay}>
                                    <Text style={styles.edit}>
                                        <MaterialIcons name="edit" size={24} color="#fff" />
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    )
                )}
        </View>
    )
}

const styles=StyleSheet.create({
    image: {
        width: 80,
        height: 80,
        borderRadius: 40,
        margin: 5,
        borderWidth: 2,
        borderColor: '#55962f',
    },
    imageEdit: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#55962f',
        position: 'relative',
    },
    editOverlay: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        width: 80,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        borderBottomRightRadius: 40,
        borderBottomLeftRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
})

export default AvatarsList;