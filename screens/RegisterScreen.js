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
import AvatarsList from "../components/AvatarsList";
import MessageBox from "../components/MessageBox";
import BackButton from "../components/BackButton";
import AntDesign from '@expo/vector-icons/AntDesign';
import { layout, textStyles, spacing, colors } from "../constants/layout";
import { api } from "../utils/apiClient";

const RegisterScreen = ({ navigation }) => {
  const [avatars, setAvatars] = useState([]);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [isChecked, setChecked] = useState(false);
  const [errors, setErrors] = useState({});

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

  const [userdata, setUserdata] = useState({
    username: "",
    email: "",
    phonenumber: "",
    password: "",
    passwordConfirm: "",
    imageID: "",
  });

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

  const handleRegister = async () => {
    const errors = validateUser({
      username: userdata.username,
      email: userdata.email,
      phonenumber: userdata.phonenumber,
      imageID: userdata.imageID,
      password: userdata.password,
      passwordConfirm: userdata.passwordConfirm,
      privacyPolicy: isChecked
    });

    setErrors({});
    
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

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
      <View>
        <BackButton navigation={navigation} />
      </View>

      <View style={layout.mainContainer}>
        <Text style={textStyles.title}>Rekisteröityminen</Text>

        {message ? (
          <View style={{ minHeight: 50 }}>
            <MessageBox message={message} type={messageType} />
          </View>
        ) : null}

        <View style={[layout.formContainer, layout.shadowStyle]}>
          <Text style={textStyles.label}>Käyttäjätunnus</Text>
          <TextInput
            value={userdata.username}
            onChangeText={(text) => handleChange("username", text)}
            style={[layout.input, {marginBottom: 5}, errors.username && styles.errorInput ]}
          />
          {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

          <Text style={textStyles.label}>Sähköposti</Text>
          <TextInput
            value={userdata.email}
            onChangeText={(text) => handleChange("email", text)}
            style={[layout.input, {marginBottom: 5}, errors.email && styles.errorInput]}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <Text style={textStyles.label}>Puhelinnumero</Text>
          <TextInput
            value={userdata.phonenumber}
            onChangeText={(text) => handleChange("phonenumber", text)}
            style={[layout.input, {marginBottom: 5}, errors.phonenumber && styles.errorInput]}
          />
          {errors.phonenumber && <Text style={styles.errorText}>{errors.phonenumber}</Text>}

          <Text style={textStyles.label}>Password</Text>
          <TextInput
            value={userdata.password}
            secureTextEntry={true}
            onChangeText={(text) => handleChange("password", text)}
            style={[layout.input, {marginBottom: 5}, errors.password && styles.errorInput]}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          <TextInput
            value={userdata.passwordConfirm}
            secureTextEntry={true}
            onChangeText={(text) => handleChange("passwordConfirm", text)}
            style={[layout.input, {marginBottom: 5}, errors.passwordConfirm && styles.errorInput]}
          />
          {errors.passwordConfirm && <Text style={styles.errorText}>{errors.passwordConfirm}</Text>}

          <View style={layout.center}>
            <Text style={textStyles.label}>Valitse kuva</Text>
            <AvatarsList
              avatars={avatars}
              onSelect={(imageID) => {
                setSelectedAvatar(imageID);
                handleChange("imageID", imageID.toString());
              }}
            />
            {errors.imageID && <Text style={styles.errorText}>{errors.imageID}</Text>}

          <View style={styles.wrap}>
            <Checkbox 
              value={isChecked}
              onValueChange={(value) => {
                setChecked(value);
                if(value) {
                  setErrors((prev) => ({
                    ...prev,
                    privacyPolicy: "",
                  }));
                }
              }}
              color={isChecked ? '#54932f' : undefined}
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
            
            <Pressable onPress={handleRegister} style={layout.button}>
              <Text style={textStyles.buttonText}>Register</Text>
            </Pressable>
          </View>
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
    fontSize: 12,
    marginBottom: 5,
    alignSelf: 'flex-start'
  },
  errorInput: {
    borderColor: "red",
    borderWidth: 2,
  }
});

export default RegisterScreen;
