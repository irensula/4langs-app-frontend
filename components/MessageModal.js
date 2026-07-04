import { useEffect } from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from "react-native"; 
import { colors } from '../constants/layout';

const MessageModal = ({ 
        visible, 
        type,
        title,
        message,
        confirmText,
        cancelText = "Cancel",
        onConfirm,
        onClose, 
        autoClose = true 
    }) => {
    
    const isConfirm = type === "confirm";
    
    useEffect(() => {
        if (!visible || !autoClose) return;

        const timer = setTimeout(() => {
            onClose?.();
        }, 5000);

        return () => clearTimeout(timer);
    }, [visible, autoClose]);

    return (
        <Modal 
            transparent 
            animationType='fade' 
            visible={visible}
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <View style={styles.modalBox}>
                    
                    {title && <Text style={styles.title}>
                        {title}
                    </Text>}

                    {isConfirm ? (
                        <>
                            <Text style={styles.message}>{message}</Text>

                            <View style={styles.buttons}>
                                <Pressable onPress={onClose} style={styles.cancelButton}>
                                    <Text style={styles.buttonText}>{cancelText}</Text>
                                </Pressable>

                                <Pressable onPress={onConfirm} style={styles.button}>
                                    <Text style={styles.buttonText}>{confirmText}</Text>
                                </Pressable>
                            </View>
                        </>
                    ) : (
                        <>
                            <Text style={styles.message}>{message}</Text>

                            <Pressable onPress={onClose} style={styles.button}>
                                <Text style={styles.buttonText}>OK</Text>
                            </Pressable>
                        </>
                    )}
                    </View>
                </View>
        </Modal>
    )
} 

const styles=StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

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
    title: {
        fontSize: 22,
        fontFamily: "NunitoBold",
        marginBottom: 10,
        color: colors.secondary,
    },
    message: {
        fontSize: 18,
        textAlign: 'center',
        fontFamily: 'ABeeZee',
        marginBottom: 15,
    },
    buttons: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10,
    },
    button: {
        backgroundColor: colors.secondary,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    cancelButton: {
        backgroundColor: "#999",
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginRight: 10,
    },
    buttonText: {
        color: colors.white,
    }
})

export default MessageModal;