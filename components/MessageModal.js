import { useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from "react-native"; 
import { colors } from '../constants/layout';

const MessageModal = ({ visible, message, onClose, autoClose = true, messageType }) => {
    
    useEffect(() => {
        if (visible && autoClose) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    return (
        <Modal transparent animationType='fade' visible={visible}>
            <View style={styles.overlay}>
                <View style={styles.modalBox}>
                    <Text style={styles.message}>{message}</Text>
                    <Pressable style={styles.button}>
                        <Text style={styles.buttonText} onPress={onClose}>OK</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    )
} 

const styles=StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBox: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        width: 260,
        alignItems: 'center',
    },
    message: {
        fontSize: 18,
        textAlign: 'center',
        fontFamily: 'ABeeZee',
        marginBottom: 15,
    },
    button: {
        backgroundColor: colors.secondary,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    buttonText: {
        color: colors.white,
    }
})

export default MessageModal;