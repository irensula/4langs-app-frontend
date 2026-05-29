import { useState, useEffect, useContext } from 'react';
import { View, Text, Image, Pressable, TextInput, StyleSheet } from "react-native";
import MessageBox from '../components/MessageBox';
import AvatarPicker from '../components/AvatarPicker';
import Navbar from '../components/Navbar';
import { layout, textStyles, spacing, colors } from '../constants/layout';
import { ScrollView } from 'react-native';
import { AuthContext } from '../utils/AuthContext';
import { api, getImageUrl } from "../utils/apiClient";

const UserScreen = ({ route, navigation }) => {
    const { user: contextUser, token, logout, updateUser } = useContext(AuthContext);    
    const [user, setUser] = useState(contextUser);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('success');
    const [editMode, setEditMode] = useState(false);
    const [userdata, setUserdata] = useState({
        username: contextUser?.username || '',
        email: contextUser?.email || '',
        phonenumber: contextUser?.phonenumber || '',
        password: '',
    });
    const [avatars, setAvatars] = useState([]);
    const [selectedImageID, setSelectedImageID] = useState(user?.imageID || null);
    const userAvatar = avatars.find(a => a.imageID === user?.imageID);
    const userAvatarUrl = userAvatar ? userAvatar.url : null;
    
    useEffect(() => {
        setUserdata({
            username: user?.username || '',
            email: user?.email || '',
            phonenumber: user?.phonenumber || '',
            password: '',
        });
    }, [user]);

    useEffect(() => {
        setUser(contextUser);
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
        setSelectedImageID(user?.imageID || null);
    }, [user]);

    const handleChange = (field, value) => {
        setUserdata(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const editUserData = async() => {
        try {
            if (!token || !user) {
                setMessage('Käyttäjän on oltava valtuutettu');
                return;
            }
            
            const response = await api.put(
                `/users/${user.id}`, 
                {
                    username: userdata.username,
                    email: userdata.email,
                    phonenumber: userdata.phonenumber,
                    password: userdata.password,
                    imageID: selectedImageID
                },
                token
            );

            if (response) {
                setMessage('Käyttäjän tiedot on päivitetty');
                setMessageType('success');
                setUser(response);
                updateUser(response);
                setEditMode(false);

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
                                source={{ uri: getImageUrl(userAvatarUrl || user?.url) }}
                                style={styles.image}
                            />}
                            {editMode && 
                                <AvatarPicker 
                                    avatars={avatars} 
                                    selectedAvatar={selectedImageID}
                                    onSelect={setSelectedImageID}
                                />}

                            {editMode && (<Text style={textStyles.label}>Username</Text>)}
                            <TextInput
                                value={userdata.username}
                                editable={editMode}
                                onChangeText={(val) => handleChange('username', val)}
                                autoCapitalize='none'
                                style={textStyles.title}
                            />
                            <Text style={textStyles.label}>Email</Text>
                            <TextInput
                                value={userdata.email}
                                editable={editMode}
                                onChangeText={(val) => handleChange('email', val)}
                                keyboardType="email-address"
                                autoCapitalize='none'
                                style={styles.textInput}
                            />
                            <Text style={textStyles.label}>Phonenumber</Text>
                            <TextInput
                                value={userdata.phonenumber}
                                editable={editMode}
                                onChangeText={(val) => handleChange('phonenumber', val)}
                                keyboardType="phone-pad"
                                autoCapitalize='none'
                                style={styles.textInput}
                            />
                            <Text style={textStyles.label}>Password</Text>
                            <TextInput
                                value={userdata.password}
                                editable={editMode}
                                placeholder="●●●●●●●●"
                                placeholderTextColor="lightgrey"
                                onChangeText={(val) => handleChange('password', val)}
                                secureTextEntry
                                style={styles.textInput}
                            />
                            
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
                {user && (
                    <View style={layout.navbarWrapper}>
                        <Navbar user={user} navigation={navigation} logout={logout} />
                    </View>
                )}
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
        marginBottom: 10,
        textAlign: 'center',
        fontSize: 18,
    },
})

export default UserScreen;