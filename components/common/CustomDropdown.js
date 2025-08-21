// components/common/CustomDropdown.js
import React, { useState, useRef } from "react";
import { View, Text, Pressable, StyleSheet, FlatList, Keyboard, Modal } from "react-native";
import Animated, { useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const CustomDropdown = ({ items = [], value, onChange, placeholder = "Selecione...", colors }) => {
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState(null);
  const dropdownButtonRef = useRef(null);

  const animatedStyle = useAnimatedStyle(() => {
    const listHeight = Math.min(items.length * 48, 48 * 5);
    return {
      height: withTiming(open ? listHeight : 0, {
        duration: 250,
        easing: Easing.out(Easing.exp),
      }),
    };
  });
  
  const animatedOpacity = useAnimatedStyle(() => {
    return {
      opacity: withTiming(open ? 1 : 0, { duration: 200 }),
    };
  });

  const selectedLabel = items.find((i) => i.value === value)?.label;

  const handleOpen = () => {
    Keyboard.dismiss();
    // CORREÇÃO: Usando 'measureInWindow' para obter as coordenadas corretas da tela.
    dropdownButtonRef.current?.measureInWindow((x, y, width, height) => {
      setLayout({
        width,
        pageX: x,
        pageY: y + height, // A posição Y correta para o menu aparecer abaixo do botão
      });
      setOpen(true);
    });
  };

  const handleSelectItem = (selectedValue) => {
    onChange(selectedValue);
    setOpen(false);
  };

  return (
    <>
      <Pressable
        ref={dropdownButtonRef}
        style={[styles.selector, { backgroundColor: colors.inputBackground }]}
        onPress={handleOpen}
      >
        <Text style={{ color: selectedLabel ? colors.text : colors.textLight, fontSize: 16 }} numberOfLines={1}>
          {selectedLabel || placeholder}
        </Text>
        <Ionicons
          name={"chevron-down-outline"}
          size={20}
          color={colors.textLight}
        />
      </Pressable>

      <Modal visible={open} transparent={true} animationType="none">
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)} />
        
        {layout && (
          <Animated.View
            style={[
              styles.dropdown,
              {
                backgroundColor: colors.cardBackground,
                top: layout.pageY + 4, // Usando a posição Y corrigida
                left: layout.pageX,
                width: layout.width,
              },
              animatedStyle,
              animatedOpacity,
            ]}
          >
            <FlatList
              data={items}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelectItem(item.value)}
                  style={({ pressed }) => [
                    styles.item,
                    { backgroundColor: pressed ? colors.primary + "20" : "transparent" },
                    value === item.value ? { backgroundColor: colors.primary + "33" } : {},
                  ]}
                >
                  <Text style={{ color: colors.text, fontSize: 16 }}>{item.label}</Text>
                  {value === item.value && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </Pressable>
              )}
            />
          </Animated.View>
        )}
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selector: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  dropdown: {
    position: "absolute",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
  },
});

export default CustomDropdown;