import { View, Text, StyleSheet } from "react-native"; 

const MessageBox = ({ message, messageType }) => {
    return (
        <View style={[styles.messageBox, styles.shadowStyle]}>
            <Text style={styles.message}>{message}</Text>
        </View>
    )
} 

const styles=StyleSheet.create({
    messageBox: {
        padding: 10,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#55962f',
        backgroundColor: '#f0f8eb',
        marginVertical: 10,
    },
    shadowStyle: {
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    message: {
        padding: 5,
        fontSize: 18,
        fontFamily: 'ABeeZee',
    }
})

export default MessageBox;