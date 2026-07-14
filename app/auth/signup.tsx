import { signup } from "@/src/api/authService";
import { Ionicons } from "@expo/vector-icons"; // 💡 아이콘 임포트 추가
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleSignup = async () => {
    if (
      !email.trim() ||
      !nickname.trim() ||
      !password.trim() ||
      !passwordCheck.trim()
    ) {
      Alert.alert("알림", "모든 필드를 입력해주세요.");
      return;
    }

    if (password !== passwordCheck) {
      Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
      return;
    }

    if (password.length < 4) {
      Alert.alert("오류", "비밀번호는 4자 이상이어야 합니다.");
      return;
    }

    try {
      setIsSubmitting(true);
      await signup({
        email: email.trim(),
        username: nickname.trim(),
        password: password,
      });

      if (Platform.OS === "web") {
        alert("회원가입이 완료되었습니다! 로그인해주세요.");
        router.replace("/auth/login");
      } else {
        Alert.alert(
          "성공",
          "회원가입이 완료되었습니다! 로그인해주세요.",
          [{ text: "확인", onPress: () => router.replace("/auth/login") }],
          { cancelable: false },
        );
      }
    } catch (error: any) {
      console.error("회원가입 에러: ", error);
      const errorMessage =
        error.response?.data?.message || "회원가입에 실패했습니다.";
      Platform.OS === "web"
        ? alert(errorMessage)
        : Alert.alert("오류", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#fff" }}
    >
      {/* 💡 상단 헤더 영역 추가: 로그인 화면으로 돌아가는 뒤로가기(←) 버튼 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={26} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>MyOrderApp 회원가입</Text>

        <TextInput
          style={styles.input}
          placeholder="이메일 계정"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
        />

        <TextInput
          style={styles.input}
          placeholder="닉네임"
          value={nickname}
          onChangeText={setNickname}
          autoCapitalize="none"
          returnKeyType="next"
        />

        <TextInput
          style={styles.input}
          placeholder="비밀번호 (4자 이상)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          returnKeyType="next"
        />

        <TextInput
          style={styles.input}
          placeholder="비밀번호 확인"
          value={passwordCheck}
          onChangeText={setPasswordCheck}
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleSignup}
        />

        <TouchableOpacity
          style={[styles.signupButton, isSubmitting && styles.disabledButton]}
          onPress={handleSignup}
          disabled={isSubmitting}
        >
          <Text style={styles.signupButtonText}>
            {isSubmitting ? "가입 요청 중..." : "회원가입 완료"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: Platform.OS === "ios" ? 40 : 10,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 60,
  },
  title: {
    fontSize: 26,
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
  signupButton: {
    backgroundColor: "#2AC1BC",
    height: 52,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  disabledButton: {
    backgroundColor: "#a5e5e2",
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
