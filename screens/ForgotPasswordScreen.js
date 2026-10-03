import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { layout, textStyles, colors } from "../constants/layout";
import BackButton from '../components/BackButton';
import MessageBox from '../components/MessageBox';
import { api } from "../utils/apiClient";

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [emailFocused, setEmailFocused] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            setMessage("Write your email");
            setMessageType("error");
            setTimeout(() => setMessage(""), 5000);
            return;
        }
        try {
            const data = await api.post(
                "/password/forgot-password",
                { email: email }
            );
            
            if (!data || data.error) {
                setMessage(data?.error || "Something went wrong");
                setMessageType("error");
                
                setTimeout(() => setMessage(""), 5000);
                
                return;
        }
        setMessage("If an account with this email exists, a password reset link has been sent.");
        setMessageType("success");
        setTimeout(() => {
            setMessage("");
        }, 5000);

        } catch (error) {
        console.error("Error forgot password: ", error);

        setMessage("Network error. Check internet connection");
        setMessageType("error");
        
        setTimeout(() => setMessage(""), 5000);
        }
    };

    return (
        <View style={layout.container}>
            <View>
                <BackButton navigation={navigation} />
            </View>

            <View style={layout.mainContainer}>
                <Text style={textStyles.title}>Forgot password?</Text>

                {message ? (
                    <View style={{ minHeight: 50, width: '100%' }}>
                        <MessageBox message={message} type={messageType} />
                    </View>
                ) : null}
                
                <View style={[layout.formContainer, layout.shadowStyle]}>
                    <Text>Enter your email and we'll send you a link to reset your password.</Text>
                    <Text style={textStyles.label}>Email</Text>
                    <TextInput
                        style={[
                            layout.input,
                            { color: colors.text },
                            // hasError && styles.inputError,
                            emailFocused && styles.inputFocused,
                        ]}
                        value={email}
                        onChangeText={setEmail}
                        underlineColorAndroid="transparent"
                        onFocus={() => {
                        //     setHasError(false);
                        setEmailFocused(true);
                        }}
                        onBlur={() => setEmailFocused(false)}
                    />
                    <Pressable style={layout.formButton} onPress={handleForgotPassword}>
                        <Text style={textStyles.formButtonText}>Send link</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
  // inputError: {},
  inputFocused: {},
});

 export default ForgotPasswordScreen;