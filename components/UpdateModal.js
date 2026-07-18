import { Modal, View, Text, StyleSheet, Pressable } from "react-native"; 
import { colors } from '../constants/layout';

const UpdateModal = ({ 
        visible,
        forceUpdate,
        title,
        message = "A new version of the application is available",
        confirmText = "Update",
        cancelText = "Later",
        onConfirm,
        onClose
    }) => {

    const handleConfirm = async () => {
        await onConfirm?.();

        if (!forceUpdate) {
            onClose?.();
        }
    };
    return (
        <Modal 
            transparent
            animationType="fade"
            visible={visible}
            statusBarTranslucent
            // user can't close the modal with Android back button 
            onRequestClose={() => {
                if (!forceUpdate) {
                    onClose?.();
                }
            }}
        >
            <View style={styles.overlay}>
                <View style={styles.modalBox}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <View style={styles.buttons}>
                        {!forceUpdate && (
                            <Pressable
                                onPress={() => {
                                    console.log("Later pressed");
    console.log("Calling onClose...");
    onClose?.();
                                }}
                                style={styles.cancelButton}
                            >
                                <Text style={styles.buttonText}>{cancelText}</Text>
                            </Pressable>
                        )}

                        <Pressable style={styles.button} onPress={handleConfirm}>
                            <Text style={styles.buttonText}>{confirmText}</Text>
                        </Pressable>
                    </View>
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

export default UpdateModal;