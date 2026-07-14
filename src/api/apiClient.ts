import axios from "axios";
import * as SecureStore from "expo-secure-store"; // 💡 SecureStore 임포트 추가
import { Platform } from "react-native"; // 💡 플랫폼 확인용 임포트

const baseURL = process.env.EXPO_PUBLIC_API_URL;
console.log("현재 설정된 baseURL:", baseURL);

const apiClient = axios.create({
  baseURL: baseURL,
  timeout: 15000,
  withCredentials: true, // 백엔드에서 설정한 쿠키(Refresh Token)를 주고받기 위해 필수
  headers: {
    "Content-Type": "application/json",
  },
});

// 💡 Request 인터셉터 흐름 정밀 제어
apiClient.interceptors.request.use(
  async (config) => {
    try {
      let token: string | null = null;

      if (Platform.OS === "web") {
        token = localStorage.getItem("userToken");
      } else {
        token = await SecureStore.getItemAsync("userToken");
      }

      if (token) {
        // 💡 config.headers가 undefined일 경우를 대비한 방어 코드
        config.headers = config.headers || {};

        // 🌟 헤더에 Bearer 토큰을 확실하게 주입합니다.
        config.headers.Authorization = `Bearer ${token}`;

        // 디버깅용: 요청이 날아갈 때 토큰이 잘 실렸는지 콘솔에서 확인해 봅니다.
        console.log(
          `[API Request] ${config.method?.toUpperCase()} ${config.url} - Token 주입 완료`,
        );
      } else {
        console.log(
          `[API Request] ${config.method?.toUpperCase()} ${config.url} - 비로그인 상태 (토큰 없음)`,
        );
      }
    } catch (error) {
      console.error("인터셉터에서 토큰 로드 실패:", error);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

//기존에 만들어둔 Response 인터셉터 (그대로 유지)
apiClient.interceptors.response.use(
  (response) => response, // 응답이 성공(200~299)이면 그대로 전달
  (error) => {
    // 서버 에러(401, 404, 500 등)가 발생했을 때 공통 처리
    if (error.response && error.response.status === 401) {
      console.log("인증이 만료되었습니다. 로그인 페이지로 이동합니다.");
      // 여기서 로그아웃 처리나 페이지 이동 로직을 넣기도 합니다.
    }
    return Promise.reject(error);
  },
);

export default apiClient;
