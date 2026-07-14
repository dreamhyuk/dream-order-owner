import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        // 탭바 활성화/비활성화 색상 설정 (배민 민트색 테마 반영)
        tabBarActiveTintColor: "#2AC1BC",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: {
          height: Platform.OS === "web" ? 65 : 60,
          paddingBottom: Platform.OS === "web" ? 10 : 8,
          paddingTop: 8,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#e9e9e9",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        // ❌ 화면 캡처에서 보였던 상단 중복 타이틀(Tab One 헤더)을 제거합니다.
        headerShown: false,
      }}
    >
      {/* 1. 실시간 주문 관리 탭 */}
      <Tabs.Screen
        name="index"
        options={{
          title: "주문 관리",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "receipt" : "receipt-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 2. 메뉴 관리 탭 */}
      <Tabs.Screen
        name="menu"
        options={{
          title: "메뉴 관리",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "cafe" : "cafe-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 3. 가게 설정 및 로그아웃 탭 */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "가게 설정",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
