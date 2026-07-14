import { login } from "@/src/api/authService";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  const router = useRouter();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();

  useEffect(() => {
    const checkAutoLogin = async () => {
      try {
        let token = null;
        if (Platform.OS === "web") {
          token = localStorage.getItem("userToken");
        } else {
          token = await SecureStore.getItemAsync("userToken");
        }

        if (token) {
          console.log("자동 로그인 성공! 토큰 감지됨.");
          router.replace("/(tabs)");
          return;
        }
      } catch (error) {
        console.error("토큰 검증 실패:", error);
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkAutoLogin();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      if (Platform.OS === "web") {
        alert("이메일과 비밀번호를 모두 입력해주세요.");
      } else {
        Alert.alert("알림", "이메일과 비밀번호를 모두 입력해주세요.");
      }
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await login({
        email,
        password,
        role: "OWNER",
      });

      if (Platform.OS === "web") {
        localStorage.setItem("userToken", result.accessToken);
      } else {
        await SecureStore.setItemAsync("userToken", result.accessToken);
      }

      console.log("Owner Access Token:", result.accessToken);

      if (Platform.OS === "web") {
        alert("로그인 되었습니다.");

        if (redirect) {
          router.replace(decodeURIComponent(redirect) as any);
        } else {
          router.replace("/(tabs)");
        }
      } else {
        Alert.alert("성공", "로그인 되었습니다.", [
          {
            text: "확인",
            onPress: () => {
              if (redirect) {
                router.replace(decodeURIComponent(redirect) as any);
              } else {
                router.replace("/");
              }
            },
          },
        ]);
      }
    } catch (error: any) {
      console.error(error);
      if (Platform.OS === "web") {
        alert("로그인 정보가 올바르지 않습니다.");
      } else {
        Alert.alert("오류", "로그인 정보가 올바르지 않습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCheckingToken) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#2AC1BC" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.navButton} />
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/(tabs)");
            }
          }}
          style={styles.navButton}
        >
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Dream Order 사장님 로그인</Text>

        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          onSubmitEditing={handleLogin}
          returnKeyType="done"
        />

        <View style={styles.roleContainer}>
          <Text style={styles.roleText}>접속 유형: 사장님 (Owner)</Text>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, isSubmitting && styles.disabledButton]}
          onPress={handleLogin}
          disabled={isSubmitting}
        >
          <Text style={styles.loginButtonText}>
            {isSubmitting ? "로그인 중..." : "로그인"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => router.push("/auth/signup")}
        >
          <Text style={styles.signupButtonText}>회원가입 하러가기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: Platform.OS === "ios" ? 40 : 10,
  },
  navButton: { padding: 8, minWidth: 40 },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e2e2",
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 12,
    borderRadius: 8,
    fontSize: 15,
    backgroundColor: "#fafafa",
  },
  roleContainer: { paddingVertical: 8, alignItems: "center", marginBottom: 20 },
  roleText: { color: "#e74c3c", fontSize: 13, fontWeight: "bold" },
  loginButton: {
    backgroundColor: "#2AC1BC",
    height: 52,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  disabledButton: { backgroundColor: "#a5e5e2" },
  loginButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  signupButton: { height: 50, justifyContent: "center", alignItems: "center" },
  signupButtonText: {
    color: "#888",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
