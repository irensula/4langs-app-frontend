import { View, Text, Pressable, StyleSheet } from 'react-native';
import { layout, textStyles, colors, spacing } from '../constants/layout';
import LANG_KEYS from '../constants/langKeys';

const LanguageTabs = ({ selectedLanguage, setSelectedLanguage, activeLanguage }) => {
    
    return (
        <View style={styles.tabsWrapper}>

             {LANG_KEYS.map(({ key }) => (
                <Pressable
                    key={key}
                    style={[
                        styles.tabWrapper,
                        selectedLanguage === key && styles.activeTab,
                    ]}
                    onPress={() => setSelectedLanguage(key)}
                >
                    <Text
                        style={[
                            styles.text,
                            selectedLanguage === key && styles.activeText
                        ]}
                    >
                        {key}
                    </Text>
                </Pressable>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    tabsWrapper: {
        flexDirection: 'row', 
        justifyContent: 'center',
        marginVertical: 10,
        borderWidth: 2, 
        backgroundColor: colors.lightorange,
        borderColor: colors.lightorange,  
        borderRadius: 25,
        paddingVertical: 5,
        width: '60%',
        alignSelf: 'center',
    },
    tabWrapper: {
        borderWidth: 2, 
        backgroundColor: colors.lightorange,
        borderColor: colors.lightorange,  
        borderRadius: 15,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    text: {
        color: colors.orange,
        fontFamily: 'ABeeZee',
        fontSize: 14,
    },
    activeTab: {
        backgroundColor: colors.orange,
    },
    activeText: {
        color: colors.white,
    },
});

export default LanguageTabs;