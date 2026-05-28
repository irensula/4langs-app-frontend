import { useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  Linking,
  StyleSheet,
} from "react-native";
import Checkbox from 'expo-checkbox';
import validateUser from "../utils/validateUser";

import BackButton from "../components/BackButton";
import MessageBox from "../components/MessageBox";
import AvatarPicker from "../components/AvatarPicker";
import AntDesign from '@expo/vector-icons/AntDesign';
import { layout, textStyles, colors } from "../constants/layout";
import { api } from "../utils/apiClient";

const RegisterScreen = ({ navigation }) => {
  const [userdata, setUserdata] = useState({
    username: "",
    email: "",
    phonenumber: "",
    password: "",
    passwordConfirm: "",
    imageID: "",
  }); {/* user validation data */}
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [avatars, setAvatars] = useState([]);
  const [avatarTouched, setAvatarTouched] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  {/* get avatars endpoint */}
  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const data = await api.get("/avatars");

        if (!Array.isArray(data)) return;

        setAvatars(data);
      } catch (error) {
        console.error("Error fetching avatars: ", error);
        setAvatars([]);
      }
    }  
      fetchAvatars();
  }, []);  

  {/* dedault avatar to choose */}
  useEffect(() => {
    if (avatars.length > 0 && !userdata.imageID) {
      handleChange("imageID", avatars[0].imageID.toString());
    }
  }, [avatars, userdata.imageID]);

  {/* fetch user's input */}
  const handleChange = (field, value) => {
    setUserdata((prevState) => ({
      ...prevState,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  {/* user registration */}
  const handleRegister = async () => {
    const errors = validateUser({
      username: userdata.username,
      email: userdata.email,
      phonenumber: userdata.phonenumber,
      imageID: userdata.imageID,
      password: userdata.password,
      passwordConfirm: userdata.passwordConfirm,
      privacyPolicy: privacyAccepted
    });
    console.log("errors:", errors);
    console.log("imageID:", userdata.imageID);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    setErrors({});

    try {
      const response = await api.post(
        `/register`,
        {
          username: userdata.username,
          email: userdata.email,
          phonenumber: userdata.phonenumber,
          password: userdata.password,
          imageID: parseInt(userdata.imageID) || 0,
        }
      );

      if (response) {
        setMessage("Tervetuloa sovellukseen!");
        setMessageType("success");
        
        setTimeout(() => {
          navigation.navigate("Login");
        }, 3000);

      } else {
        setMessage("Rekisteröinti epäonnistui");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error registering new user: ", error);
      setMessage("Verkkovirhe");
      setMessageType("error");
    }
  };

  return (
    <ScrollView style={layout.container}>
      {/* go back button */}
      <View>
        <BackButton navigation={navigation} />
      </View>

      <View style={layout.mainContainer}>

        <Text style={textStyles.title}>Rekisteröityminen</Text>

        {/* message box */}
        {message ? (
          <View style={{ minHeight: 50 }}>
            <MessageBox message={message} type={messageType} />
          </View>
        ) : null}

        <View style={[layout.formContainer, layout.shadowStyle]}>
          {/* login input */}
          <Text style={textStyles.label}>Käyttäjätunnus</Text>
          <TextInput
            value={userdata.username}
            onChangeText={(text) => handleChange("username", text)}
            style={[layout.input, {marginBottom: 5}, errors.username && styles.errorInput ]}
          />
          {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

          {/* email input */}
          <Text style={textStyles.label}>Sähköposti</Text>
          <TextInput
            value={userdata.email}
            onChangeText={(text) => handleChange("email", text)}
            style={[layout.input, {marginBottom: 5}, errors.email && styles.errorInput]}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* phonenumber input */}
          <Text style={textStyles.label}>Puhelinnumero</Text>
          <TextInput
            value={userdata.phonenumber}
            onChangeText={(text) => handleChange("phonenumber", text)}
            style={[layout.input, {marginBottom: 5}, errors.phonenumber && styles.errorInput]}
          />
          {errors.phonenumber && <Text style={styles.errorText}>{errors.phonenumber}</Text>}

          {/* password input */}
          <Text style={textStyles.label}>Password</Text>
          <View style={[
              layout.input, 
              {marginBottom: 5, flexDirection: 'row', alignItems: 'center', paddingRight: 10 }, 
              errors.password && styles.errorInput
            ]}>
            <TextInput
              value={userdata.password}
              secureTextEntry={!showPassword}
              style={{ flex: 1 }}
              onChangeText={(text) => handleChange("password", text)}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <AntDesign 
                name={showPassword ? "eye-invisible" : "eye"}
                size={24} 
                color={errors.password ? 'red' : colors.secondary} 
              />
            </Pressable>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          {/* password confirm input */}
          <View style={[
              layout.input, 
              { marginBottom: 5, flexDirection: 'row', alignItems: 'center', paddingRight: 10 }, 
              errors.passwordConfirm && styles.errorInput
            ]}>
            <TextInput
              value={userdata.passwordConfirm}
              secureTextEntry={!showPasswordConfirm}
              style={{ flex: 1 }}
              onChangeText={(text) => handleChange("passwordConfirm", text)}
            />
            <Pressable onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}>
              <AntDesign 
                name={showPasswordConfirm ? "eye-invisible" : "eye"} 
                size={24} 
                color={errors.passwordConfirm ? 'red' : colors.secondary}
              />
            </Pressable>
            
          </View>
          {errors.passwordConfirm && <Text style={styles.errorText}>{errors.passwordConfirm}</Text>}

          {/* choose avatar */}
          <View style={[layout.center, { paddingVertical: 20 }]}>
            <Text style={textStyles.label}>Valitse kuva</Text>
            <AvatarPicker
              avatars={avatars}
              selectedAvatar={userdata.imageID}
              onSelect={(imageID) => {
                setAvatarTouched(true);
                handleChange("imageID", imageID.toString());
              }}
            />
            {errors.imageID && <Text style={styles.errorText}>{errors.imageID}</Text>}
          </View>

          {/* privacy policy */}
          <View style={styles.wrap}>
            <Checkbox 
              value={privacyAccepted}
              onValueChange={(value) => {
                setPrivacyAccepted(value);
                if(value) {
                  setErrors((prev) => ({
                    ...prev,
                    privacyPolicy: "",
                  }));
                }
              }}
              color={privacyAccepted ? '#54932f' : undefined}
            />
            <Text>Hyväksyn {" "}
              <Text style={{ color: colors.secondary, textDecorationLine: 'underline', fontWeight: "600" }} onPress={() => Linking.openURL(
                "https://irensula.github.io/privacy_policy/"
              )}>
                tietosuojaselosteen
              </Text>
            </Text>
          </View>
          {errors.privacyPolicy && <Text style={styles.errorText}>{errors.privacyPolicy}</Text>}
            
          {/* register button */}
          <Pressable onPress={handleRegister} style={layout.formButton}>
            <Text style={textStyles.formButtonText}>Register</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignSelf: "flex-start",
    gap: 8,
    marginTop: 15,
  },
  errorText: {
    color: "red",
    fontSize: 11,
    marginBottom: 5,
    alignSelf: 'flex-start'
  },
  errorInput: {
    borderColor: "red",
    borderWidth: 2,
  }
});

export default RegisterScreen;
