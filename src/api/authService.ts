import apiClient from "./apiClient";

// 로그인 데이터 타입 정의
interface LoginRequest {
  email: string;
  password: string;
  role: "OWNER";
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  grantType: string;
}

export const login = async (data: LoginRequest): Promise<TokenResponse> => {
  const response = await apiClient.post<TokenResponse>(
    "/api/owners/login",
    data,
  );
  return response.data;
};

// 회원가입 요청 데이터 타입 정의
export interface SignupRequest {
  email: string;
  username: string;
  password: string;
}

/**
 * 회원가입 API
 */
export const signup = async (data: SignupRequest): Promise<number> => {
  const response = await apiClient.post<number>("/api/owners/signup", data);
  return response.data;
};

/**
 * 로그아웃 API
 */
export const logout = async (): Promise<number> => {
  const response = await apiClient.post<number>("/api/auth/logout");
  return response.data;
};

// 내 정보 조회 응답 데이터 타입 정의
// export interface UserProfileResponse {
//   id: number;
//   email: string;
//   username: string; // 백엔드 DTO 및 DB 필드명과 일치
// }

// /**
//  * 로그인한 유저 본인의 프로필 정보 조회 API
//  * @returns {UserProfileResponse} 유저 정보 객체
//  */
// export const fetchMyProfile = async (): Promise<UserProfileResponse> => {
//   // 백엔드 내 정보 조회 엔드포인트 주소 입력 (예시: /api/customers/me)
//   const response =
//     await apiClient.get<UserProfileResponse>("/api/customers/me");
//   return response.data;
// };
