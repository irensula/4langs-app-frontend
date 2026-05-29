import { View, Text, StyleSheet } from "react-native"; 

const MessageBox = ({ message, type }) => {
    return (
        <View style={[type === "error" ? styles.errorMessageBox : styles.messageBox, styles.shadowStyle]}>
            <Text style={type == "error" ? styles.errorMessage : styles.message}>{message}</Text>
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
    errorMessageBox: {
        padding: 10,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'red',
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
    },
    errorMessage: {
        padding: 5,
        fontSize: 18,
        fontFamily: 'ABeeZee',
        color: 'red'
    }
})

export default MessageBox;