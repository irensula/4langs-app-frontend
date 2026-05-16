import { useState, useContext } from "react";
import { AuthContext } from "../utils/AuthContext";
import { ScrollView, Text, View, Pressable, StyleSheet } from "react-native";
import Navbar from "../components/Navbar";
import { layout, colors, textStyles, spacing } from "../constants/layout";
import { useIsFocused } from "@react-navigation/native";
import CategoryTitle from "../components/CategoryTitle";

export default function CategoryScreen({ route, navigation }) {
  const { user } = useContext(AuthContext);
  const { name, categoryID, unlocked } = route.params;
  const isFocused = useIsFocused();

  return (
    <View style={layout.screen}>
      <ScrollView contentContainerStyle={layout.scrollContent}>
        <CategoryTitle
          categoryID={categoryID}
          name={name}
          isFocused={isFocused}
        />

        <View style={styles.categoriesWrap}>
          <Pressable
            onPress={() =>
              navigation.navigate("WordsListScreen", { name, categoryID })
            }
            style={styles.category}
          >
            <Text style={styles.categoryTitle}>Words list</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              navigation.navigate("TextScreen", { name, categoryID })
            }
            style={styles.category}
          >
            <Text style={styles.categoryTitle}>Text</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              navigation.navigate("ConnectScreen", { name, categoryID })
            }
            style={styles.category}
          >
            <Text style={styles.categoryTitle}>Connect Task</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              navigation.navigate("MemoScreen", { name, categoryID })
            }
            style={styles.category}
          >
            <Text style={styles.categoryTitle}>MemoGame</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              navigation.navigate("GapsScreen", { name, categoryID })
            }
            style={styles.category}
          >
            <Text style={styles.categoryTitle}>Gaps Task</Text>
          </Pressable>
        </View>
      </ScrollView>
      {user && (
        <View style={layout.navbarWrapper}>
          <Navbar user={user} navigation={navigation} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  categoriesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  category: {
    width: "48%",
    padding: 10,
    alignItems: "center",
    marginVertical: 10,
    height: 100,
    justifyContent: "center",
    backgroundColor: colors.orange,
    borderColor: colors.lightorange,
    borderRadius: 25,
    borderWidth: 2,
  },
  categoryTitle: {
    color: colors.white,
    fontFamily: "ABeeZee",
    fontSize: 16,
  },
});
