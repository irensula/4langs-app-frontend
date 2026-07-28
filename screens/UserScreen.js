import { useState, useEffect, useContext } from 'react';
import { View, ScrollView, Text, Image, Pressable, TextInput, StyleSheet } from "react-native";

import { AuthContext } from '../utils/AuthContext';
import { api, getImageUrl } from "../utils/apiClient";

import MessageModal from "../components/MessageModal";
import AvatarPicker from '../components/AvatarPicker';
import Navbar from '../components/Navbar';

import { layout, textStyles, spacing, colors } from '../constants/layout';

import validateUser from "../utils/validateUser";

import AntDesign from '@expo/vector-icons/AntDesign';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const UserScreen = ({ route, navigation }) => {
    const { user: contextUser, token, logout, refreshSession } = useContext(AuthContext);    
    
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
    const [modal, setModal] = useState({
        visible: false,
        type: "message",
        title: "",
        message: "",
    });
    
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
                setModal({
                    visible: true,
                    type: "message",
                    title: "",
                    message: "The user must be authorized"
                });
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

                setEditMode(false);

                setUserdata(prev => ({
                    ...prev,
                    password: "",
                    passwordConfirm: "",
                }));

                setModal({
                    visible: true,
                    type: "message",
                    title: "",
                    message: "You updated your info successfully!"
                });
            }
        } catch (error) {
            setModal({
                visible: true,
                type: "message",
                title: "",
                message: error.response?.error || "Unable to update profile"
            });
        }
    };

    const cancelEditUserData = () => {
        setEditMode(false);

        setUserdata({
            username: contextUser.username,
            email: contextUser.email,
            password: "",
            passwordConfirm: "",
        });

        setErrors({});
    }

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

    const handleDeleteAccount = async () => {
        if (!token || !contextUser) {
            setModal({
                visible: true,
                type: "message",
                title: "",
                message: "User must be authorised"
            });
            return;
        }
        try {
            await api.delete(`/users/me`, token);
            setModal({
                visible: true,
                type: "message",
                title: "",
                message: "You deleted account successfully!",
            });

            await logout();

        } catch (error) {
            setModal({
                visible: true,
                type: "message",
                title: "",
                message: error.response?.error,
            });
        }
    };

    const confirmDeleteAccount =  () => {
        setModal({
            visible: true,
            type: "confirm",
            title: "Delete account",
            message: "Are you sure you want to delete your account?",
            confirmText: "Delete",
            cancelText: "Cancel",
            onConfirm: handleDeleteAccount
        });
    }

    return (
        <View style={[layout.screen, {paddingHorizontal: 10, backgroundColor: colors.primary }]}>

            <MessageModal
                visible={modal.visible}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                confirmText={modal.confirmText}
                onClose={() =>
                    setModal(prev => ({
                        ...prev,
                        visible: false,
                    }))
                }
                onConfirm={modal.onConfirm}
            />

            <ScrollView contentContainerStyle={{ backgroundColor: colors.primary, paddingTop: 30, paddingBottom: 80 }}>
                <View style={layout.container}>

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
                            <View style={{ width: "80%", marginVertical: 20 }}>
                                {editMode ? (
                                    <View style={{ flexDirection: "row", gap: 10, }}>
                                        <Pressable style={styles.editButton} onPress={cancelEditUserData}>
                                            <Text style={[textStyles.formButtonText, { color: colors.violet, paddingHorizontal: 10, fontWeight: 700 }]}>Cancel</Text>
                                        </Pressable>
                                        <Pressable style={styles.editButton} onPress={editUserData}>
                                            <Text style={[textStyles.formButtonText, { color: colors.violet, paddingHorizontal: 10, fontWeight: 700 }]}>Save</Text>
                                        </Pressable>
                                    </View>
                                ) : (
                                    <Pressable style={[styles.editButton, { flexDirection: "row" } ]} onPress={() => setEditMode(true)}>
                                        <FontAwesome6 name="edit" size={24} color={colors.violet} />
                                        <Text style={[textStyles.formButtonText, { color: colors.violet, paddingHorizontal: 10, fontWeight: 700 }]}>Edit</Text>
                                    </Pressable>
                                )}
                            </View>
                        </View>
                    </View>
                    <Pressable 
                            onPress={() => {
                                logout();
                            }} 
                            style={[layout.formButton, { width: "100%" }]}
                        >
                            <Text style={[textStyles.formButtonText, {fontSize: 16}]}>Log out</Text>
                        </Pressable>

                        <Pressable
                            onPress={confirmDeleteAccount}
                            style={[layout.formButton, { backgroundColor: "transparent", borderWidth: 2, borderColor: colors.red, width: "100%" }]}
                        >
                            <Text style={[textStyles.formButtonText, { color: colors.red }]}>Delete account</Text>
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
    editButton: {
        flex: 1,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 5,
        borderWidth: 2,
        borderColor: colors.violet,
        borderRadius: 50,
    },
    info: {
        alignItems: 'center',
        width: '100%',
        marginTop: -70
    },
    image: {
        width: 120,
        height: 120,
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