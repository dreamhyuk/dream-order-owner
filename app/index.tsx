import { Redirect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";

export default function Index() {
  const [isChecking, setIsChecking] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const checkToken = async () => {
      try {
        let token = null;
        if (Platform.OS === "web") {
          token = localStorage.getItem("userToken");
        } else {
          token = await SecureStore.getItemAsync("userToken");
        }

        // 토큰이 존재하면 true, 없으면 false
        setHasToken(!!token);
      } catch (e) {
        console.error("토큰 로드 실패:", e);
      } finally {
        setIsChecking(false);
      }
    };

    checkToken();
  }, []);

  // 토큰을 검사하는 동안 로딩 표시
  if (isChecking) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#2AC1BC" />
      </View>
    );
  }

  // 🌟 핵심 분기 처리
  // 토큰이 있으면 탭 폴더 내부의 메인인 /(tabs)로 가고, 없으면 로그인 화면으로 튕깁니다.
  if (hasToken) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/auth/login" />;
  }
}
