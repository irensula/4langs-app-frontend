import { useState, useEffect, useContext } from 'react';
import { View, ScrollView, Text, Image, Pressable, TextInput, StyleSheet } from "react-native";

import { AuthContext } from '../utils/AuthContext';
import { api, getImageUrl } from "../utils/apiClient";

import MessageBox from '../components/MessageBox';
import AvatarPicker from '../components/AvatarPicker';
import Navbar from '../components/Navbar';

import { layout, textStyles, spacing, colors } from '../constants/layout';

import validateUser from "../utils/validateUser";

import AntDesign from '@expo/vector-icons/AntDesign';

const UserScreen = ({ route, navigation }) => {
    const { user: contextUser, token, logout, refreshSession } = useContext(AuthContext);    
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');

    const [editMode, setEditMode] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
    const [errors, setErrors] = useState({});
    const [userdata, setUserdata] = useState({
        username: contextUser?.username || '',
        email: contextUser?.email || '',
        password: '',
        passwordConfirm: ""
    });
    
    const [avatars, setAvatars] = useState([]);
    const [selectedImageId, setSelectedImageId] = useState(contextUser?.avatar_id || null);
    const userAvatar = avatars.find(a => a.avatar_id === contextUser?.avatar_id);
    const userAvatarUrl = userAvatar ? userAvatar.avatar_path : null;
    
    useEffect(() => {
        setUserdata({
            username: contextUser?.username || '',
            email: contextUser?.email || '',
            password: '',
            passwordConfirm: "",
        });
    }, [contextUser]);

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

    useEffect(() => {
        setSelectedImageId(contextUser?.avatar_id || null);
    }, [contextUser]);

    const editUserData = async() => {
        const errors = validateUser(userdata, "edit");

        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            console.log(errors);
            return;
        }

        setErrors({});

        try {
            if (!token || !contextUser) {
                setMessage('Käyttäjän on oltava valtuutettu');
                return;
            }
            
            const response = await api.put(
                `/users/${contextUser.user_id}`, 
                {
                    username: userdata.username,
                    email: userdata.email,
                    password: userdata.password,
                    avatar_id: selectedImageId
                },
                token
            );

            if (response) {             
                await refreshSession();

                setMessage('Käyttäjän tiedot on päivitetty');
                setMessageType('success');
                setEditMode(false);

                setUserdata(prev => ({
                    ...prev,
                    password: "",
                    passwordConfirm: "",
                }));

                setTimeout(() => {
                    setMessage('');
                }, 3000);

            } else {
                setMessage('Päivitys epäonnistui');
            }
        } catch (err) {
            console.error(err);
            setMessage('Verkko- tai palvelinvirhe');
        }
    };

    const handleChange = (field, value) => {
        setUserdata(prev => ({
            ...prev,
            [field]: value,
        }));

        setErrors(prev => ({
            ...prev,
            [field]: undefined,
        }));
    };

    return (
        <View style={[layout.screen, {paddingHorizontal: 10, backgroundColor: colors.primary }]}>
            <ScrollView contentContainerStyle={{ backgroundColor: colors.primary, paddingBottom: 80 }}>
                <View style={layout.container}>

                    <View style={{ minHeight: 50 }}>
                        {message !== '' && (<MessageBox message={message} type={messageType} />)}
                    </View>

                    <View style={[layout.infoCard, layout.shadowStyle]}>
                        <View style={styles.info}>
                        
                            {!editMode && <Image
                                source={{ uri: getImageUrl(userAvatarUrl || contextUser?.avatar_path) }}
                                style={styles.image}
                            />}
                            {editMode && 
                                <AvatarPicker 
                                    avatars={avatars} 
                                    selectedAvatar={selectedImageId}
                                    onSelect={setSelectedImageId}
                                />}

                            {editMode && (<Text style={textStyles.label}>Username</Text>)}
                            <TextInput
                                value={userdata.username}
                                editable={editMode}
                                onChangeText={(val) => handleChange('username', val)}
                                autoCapitalize='none'
                                style={[textStyles.title, { marginBottom: 0 }]}
                            />
                            {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

                            <Text style={textStyles.label}>Email</Text>
                            <TextInput
                                value={userdata.email}
                                editable={editMode}
                                onChangeText={(val) => handleChange('email', val)}
                                keyboardType="email-address"
                                autoCapitalize='none'
                                style={styles.textInput}
                            />
                            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                            <Text style={textStyles.label}>Password</Text>
                            <View style={[
                                          layout.input, 
                                          { marginBottom: 5, flexDirection: 'row', alignItems: 'center', paddingRight: 10 }, 
                                          errors.password && styles.errorInput
                                        ]}>
                                <TextInput
                                    value={userdata.password}
                                    editable={editMode}
                                    placeholder="●●●●●●●●"
                                    placeholderTextColor="lightgrey"
                                    secureTextEntry={!showPassword}
                                    onChangeText={(text) => handleChange("password", text)}
                                    style={styles.textInput}
                                />
                                {editMode && (
                                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                                        <AntDesign 
                                            name={showPassword ? "eye-invisible" : "eye"} 
                                            size={24} 
                                            color={errors.password ? 'red' : colors.darkblue}
                                        />
                                    </Pressable>
                                )}
                            </View>
                            {errors.password && (<Text style={styles.errorText}>{errors.password}</Text>)}

                            {editMode && (
                                <>
                                    <Text style={textStyles.label}>Confirm password</Text>
                                    <View style={[
                                        layout.input, 
                                        { marginBottom: 5, flexDirection: 'row', alignItems: 'center', paddingRight: 10 }, 
                                        errors.passwordConfirm && styles.errorInput
                                    ]}>
                                        
                                        <TextInput
                                            value={userdata.passwordConfirm}
                                            editable={editMode}
                                            placeholder="●●●●●●●●"
                                            placeholderTextColor="lightgrey"
                                            secureTextEntry={!showPasswordConfirm}
                                            onChangeText={(text) => handleChange("passwordConfirm", text)}
                                            style={styles.textInput}
                                            />
                                        <Pressable onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}>
                                            <AntDesign 
                                                name={showPasswordConfirm ? "eye-invisible" : "eye"} 
                                                size={24} 
                                                color={errors.passwordConfirm ? 'red' : colors.darkblue}
                                            />
                                        </Pressable>
                                    </View>
                                    {errors.passwordConfirm && (<Text style={styles.errorText}>{errors.passwordConfirm}</Text>)}
                                </>
                            )}
                            {editMode ? (
                                <Pressable style={layout.formButton} onPress={editUserData}>
                                    <Text style={textStyles.formButtonText}>Tallenna</Text>
                                </Pressable>
                            ) : (
                                <Pressable style={layout.formButton} onPress={() => setEditMode(true)}>
                                    <Text style={textStyles.formButtonText}>Muokkaa</Text>
                                </Pressable>
                            )}
                        </View>
                    </View>
                    <Pressable 
                        onPress={() => {
                            logout();
                            }} 
                        style={layout.center}
                    >
                        <View style={layout.button}>
                            <Text style={[textStyles.buttonText, {fontSize: 16}]}>Kirjaudu ulos</Text>
                        </View>
                    </Pressable>
                </View>
            </ScrollView>
            <View style={{ backgroundColor: 'transparent' }}>
            
            <View style={layout.navbarWrapper}>
                <Navbar navigation={navigation} logout={logout} />
            </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    info: {
        alignItems: 'center',
        width: '100%',
        marginTop: -40,
    },
    image: {
        width: 100,
        height: 100,
        margin: 5,
        borderWidth: 3,
        borderColor: colors.darkblue,
        borderRadius: 100,
        backgroundColor: '#f0f8eb',
    },
    label: {
        fontSize: 10,
        fontFamily: "ABeeZee",
        color: '#55962f',
        marginTop: 10,
    },
    textInput : {
        textAlign: 'center',
        fontSize: 18,
    },
    errorText: {
        color: "red",
        fontSize: 15,
        marginBottom: 5,
        
    },
    errorInput: {
        borderColor: "red",
        borderWidth: 2,
    }
})

export default UserScreen;