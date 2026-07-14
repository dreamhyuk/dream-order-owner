import apiClient from "./apiClient";

// 백엔드에서 내려줄 사장님 매장 요약 DTO 타입 정의
export interface ShopSummaryResponse {
  shopId: number;
  shopName: string;
}

/**
 * 사장님이 소유한 매장 목록 전체 조회 API
 */
export const getOwnerShops = async (): Promise<ShopSummaryResponse[]> => {
  const response =
    await apiClient.get<ShopSummaryResponse[]>("/api/owners/shops");
  return response.data;
};
