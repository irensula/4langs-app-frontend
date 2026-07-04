import { StyleSheet, View, Text, Image } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

import { getImageUrl } from "../utils/apiClient";
import { colors, layout } from "../constants/layout";

import FontAwesome from '@expo/vector-icons/FontAwesome';

const LanguageDropdown = ({
    data,
    value,
    onChange,
    onSelect,
    placeholder,
    disableItem
  }) => {
    
    // find the selected language
    const selectedItem = data.find(item => item.language_id === value);

    // element in the drpdown menu
    const renderItem = (item) => {
      return (
        <View style={styles.item}>
          <Image source={{ uri: getImageUrl(item.flag_path) }} style={styles.flag} />
          <Text style={styles.textItem}>{item.name}</Text>
          {item.disabled && (
            <FontAwesome name="check" size={24} color="grey" />
          )}
        </View>
      );
    };

  return (
    <View style={styles.container}>
      <Dropdown
        style={styles.dropdown}
        data={data}
        value={value}
        labelField="name"
        valueField="language_id"
        placeholder={placeholder}
        onChange={(item) => {
          console.log(item);
          if (!item.disabled) {
            onSelect?.(item);
          }
        }}
        renderItem={renderItem}
        // show the flag
        renderLeftIcon={() => (
          selectedItem && (
              <Image 
                source={{ uri: getImageUrl(selectedItem.flag_path) }} 
                style={styles.leftFlag} 
              />
            ))}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    justifyContent: 'center',
  },
  dropdown: {
    flex: 1,
    height: 50,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.darkblue,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  item: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textItem: {
    flex: 1,
    fontSize: 16,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
    marginLeft: 8, 
  },
  flag: {
    width: 24,
    height: 24,
    marginRight: 10,
    borderRadius: 24,
  },
  leftFlag: {
    width: 24,
    height: 24,
    borderRadius: 24,
  },
});

export default LanguageDropdown;