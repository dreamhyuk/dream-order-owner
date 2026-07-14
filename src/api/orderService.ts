import apiClient from "./apiClient";

// 백엔드 엔티티 구조에 맞게 수정 가능한 주문 데이터 인터페이스
export interface OrderResponse {
  orderId: number; // 백엔드 Long id -> number
  orderNumber: string; // 가독성 좋은 주문번호 (예: "A-101")
  menuName: string; // 백엔드에서 가공한 단일 문자열 (예: "아메리카노 외 2건")
  totalPrice: number; // 백엔드 int -> number (전체 주문 합계 금액)
  // 🌟 백엔드 OrderStatus Enum 값들과 매칭
  status:
    | "PENDING"
    | "ACCEPTED"
    | "PREPARING"
    | "DELIVERING"
    | "COMP"
    | "CANCEL";
  createdAt: string; // 백엔드에서 포맷팅한 시간 문자열 (예: "14:20")
}

/**
 * 특정 매장의 실시간 주문 목록 조회 API
 */
export const getShopOrders = async (
  shopId: number,
): Promise<OrderResponse[]> => {
  // 쿼리 파라미터로 shopId를 넘겨 해당 가게의 주문만 필터링해 가져옵니다.
  const response = await apiClient.get<OrderResponse[]>("/api/owners/orders", {
    params: { shopId },
  });
  return response.data;
};
