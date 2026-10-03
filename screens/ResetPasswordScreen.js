import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { layout, textStyles, colors } from "../constants/layout";
import BackButton from '../components/BackButton';
import MessageBox from '../components/MessageBox';
import { api } from "../utils/apiClient";
import AntDesign from '@expo/vector-icons/AntDesign';

const ResetPasswordScreen = ({ navigation, route }) => {
    const { token } = route.params || {};

    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    const handleChange = (field, value) => {
        setErrors((prev) => ({
            ...prev,
            [field]: "",
        }));

        if (field === "password") {
            setPassword(value);
        }

        if (field === "passwordConfirm") {
            setPasswordConfirm(value);
        }
    };
    
    const validate = () => {
        const newErrors = {};

        if (!password) {
            newErrors.password = "Enter password";
        } else if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }

        if (!passwordConfirm) {
            newErrors.passwordConfirm = "Confirm password";
        } else if (password !== passwordConfirm) {
            newErrors.passwordConfirm = "Passwords do not match";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleResetPassword = async () => {
        if (!validate()) return; 
            
         if (!token) {
            setMessage("Invalid or missing reset link");
            setMessageType("error");
            return;
        }

        try {
            const data = await api.post(
                "/password/reset-password",
                { token, password }
            );
            
            setMessage(data.message);
            setMessageType("success");

            setTimeout(() => {
                navigation.navigate("Login");
            }, 2000);

        } catch (error) {
            console.log("Error reset password: ", error);

            setMessage(error.response?.error || "Something went wrong");
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
                <Text style={textStyles.title}>Reset Password</Text>

                {message ? (
                    <View style={{ minHeight: 50, width: '100%' }}>
                        <MessageBox message={message} type={messageType} />
                    </View>
                ) : null}
                
                <View style={[layout.formContainer, layout.shadowStyle]}>

                    {/* password input */}
                    <Text style={textStyles.label}>Password</Text>
                    <View style={[
                            layout.input, 
                            {marginBottom: 5, flexDirection: 'row', alignItems: 'center', paddingRight: 10 }, 
                            errors.password && layout.errorInput
                        ]}>
                        <TextInput
                            value={password}
                            secureTextEntry={!showPassword}
                            style={{ flex: 1 }}
                            onChangeText={(text) => handleChange("password", text)}
                        />
                        <Pressable onPress={() => setShowPassword(!showPassword)}>
                        <AntDesign 
                            name={showPassword ? "eye-invisible" : "eye"}
                            size={24} 
                            color={errors.password ? 'red' : colors.darkblue} 
                        />
                        </Pressable>
                    </View>
                    {errors.password && <Text style={layout.errorText}>{errors.password}</Text>}

                    {/* password confirm input */}
                    <Text style={textStyles.label}>Confirm password</Text>
                    <View style={[
                        layout.input, 
                        { marginBottom: 5, flexDirection: 'row', alignItems: 'center', paddingRight: 10 }, 
                        errors.passwordConfirm && layout.errorInput
                        ]}>
                        <TextInput
                            value={passwordConfirm}
                            secureTextEntry={!showPasswordConfirm}
                            style={{ flex: 1 }}
                            onChangeText={(text) => handleChange("passwordConfirm", text)}
                        />
                        <Pressable onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}>
                        <AntDesign 
                            name={showPasswordConfirm ? "eye-invisible" : "eye"} 
                            size={24} 
                            color={errors.passwordConfirm ? 'red' : colors.darkblue}
                        />
                        </Pressable>
                        
                    </View>
                    {errors.passwordConfirm && <Text style={layout.errorText}>{errors.passwordConfirm}</Text>}

                    <Pressable style={layout.formButton} onPress={handleResetPassword}>
                        <Text style={textStyles.formButtonText}>Reset password</Text>
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

 export default ResetPasswordScreen;