import { getShopOrders, OrderResponse } from "@/src/api/orderService";
import { getOwnerShops, ShopSummaryResponse } from "@/src/api/shopService";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store"; // 모바일 토큰 확인용
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Order {
  id: string;
  orderNumber: string;
  menuName: string;
  totalPrice: number;
  status: "PENDING" | "PREPARING" | "COMPLETED";
  createdAt: string;
}

export default function OwnerMainScreen() {
  // 가게 관련 상태
  const [shops, setShops] = useState<ShopSummaryResponse[]>([]);
  const [selectedShop, setSelectedShop] = useState<ShopSummaryResponse | null>(
    null,
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 🌟 주문 및 로딩 상태 (OrderResponse 인터페이스로 교체)
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoadingShops, setIsLoadingShops] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // 1. 화면 진입 시 사장님의 소유 매장 목록 조회
  useEffect(() => {
    const fetchShops = async () => {
      try {
        // 🌟 [안전장치] 현재 저장된 토큰이 있는지 먼저 확인
        const token =
          Platform.OS === "web"
            ? localStorage.getItem("userToken")
            : await SecureStore.getItemAsync("userToken");

        // 토큰이 없으면 아직 로그인 안 한 상태이므로 가게 조회를 하지 않고 조용히 리턴
        if (!token) {
          setIsLoadingShops(false);
          setIsLoadingOrders(false); // 💡 주문 로딩도 함께 꺼주어 인디케이터 무한 루프 방지
          return;
        }

        setIsLoadingShops(true);
        const shopList = await getOwnerShops();
        setShops(shopList);

        if (shopList.length > 0) {
          setSelectedShop(shopList[0]);
        }
      } catch (error: any) {
        // 🌟 apiClient 인터셉터가 401을 처리하므로, 여기서는 401이 아닌 다른 에러일 때만 팝업을 띄웁니다.
        if (error.response?.status !== 401) {
          const errorMsg = "가게 목록을 불러오는데 실패했습니다.";
          if (Platform.OS === "web") alert(errorMsg);
          else Alert.alert("오류", errorMsg);
        } else {
          console.log("[Main] 401 Unauthorized 감지 - 인터셉터가 처리합니다.");
        }
      } finally {
        setIsLoadingShops(false);
      }
    };

    fetchShops();
  }, []);

  // 2. 선택된 가게가 바뀔 때마다 해당 매장의 주문 내역을 조회
  useEffect(() => {
    if (!selectedShop) return;

    const fetchOrders = async () => {
      try {
        setIsLoadingOrders(true);
        console.log(
          `현재 선택된 매장 ID [${selectedShop.shopId}]의 실시간 주문을 조회합니다.`,
        );

        // 🌟 하드코딩 setTimeout을 걷어내고 실제 API 호출 적용!
        const data = await getShopOrders(selectedShop.shopId);
        setOrders(data);
      } catch (error: any) {
        if (error.response?.status !== 401) {
          const errorMsg = "주문 목록을 가져오는데 실패했습니다.";
          if (Platform.OS === "web") alert(errorMsg);
          else Alert.alert("오류", errorMsg);
        }
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [selectedShop]);

  // 🌟 백엔드 OrderStatus Enum의 모든 한글 문구 대응
  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "접수 대기";
      case "ACCEPTED":
        return "접수 완료";
      case "PREPARING":
        return "조리 중";
      case "DELIVERING":
        return "배달 중";
      case "COMP":
        return "완료";
      case "CANCEL":
        return "취소됨";
      default:
        return status;
    }
  };

  // 🌟 컴포넌트 렌더링 아이템 (OrderResponse 타입 지정 및 orderId 반영)
  const renderOrderItem = ({ item }: { item: OrderResponse }) => (
    <View style={styles.orderCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderNumber}>주문번호 {item.orderNumber}</Text>
        <Text style={styles.orderTime}>{item.createdAt}</Text>
      </View>
      <Text style={styles.menuName} numberOfLines={2}>
        {item.menuName}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.totalPrice}>
          {item.totalPrice.toLocaleString()}원
        </Text>
        {/* 스타일 대응을 위해 기존 키값 혹은 기본 폴백 처리 */}
        <View
          style={[styles.statusBadge, styles[item.status] || styles.PENDING]}
        >
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
    </View>
  );

  if (isLoadingShops) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2AC1BC" />
        <Text style={{ marginTop: 10, color: "#666" }}>
          매장 정보를 확인 중입니다...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 🏢 상단 헤더 및 매장 선택 드롭다운 (기존 유지) */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.dropdownSelector}
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          activeOpacity={0.7}
        >
          <Text style={styles.headerTitle}>
            {selectedShop ? selectedShop.shopName : "등록된 매장 없음"}
          </Text>
          <Ionicons
            name={isDropdownOpen ? "chevron-up" : "chevron-down"}
            size={20}
            color="#333"
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>
        <Text style={styles.headerSubtitle}>오늘 들어온 실시간 주문 현황</Text>

        {/* 🔽 드롭다운 리스트 컴포넌트 */}
        {isDropdownOpen && (
          <View style={styles.dropdownMenu}>
            {shops.map((shop) => (
              <TouchableOpacity
                key={shop.shopId}
                style={[
                  styles.dropdownItem,
                  selectedShop?.shopId === shop.shopId &&
                    styles.selectedDropdownItem,
                ]}
                onPress={() => {
                  setSelectedShop(shop);
                  setIsDropdownOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    selectedShop?.shopId === shop.shopId &&
                      styles.selectedDropdownItemText,
                  ]}
                >
                  {shop.shopName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* 📋 주문서 출력 영역 */}
      {isLoadingOrders ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2AC1BC" />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.orderId.toString()} // 🌟 백엔드 스펙에 맞춰 item.id -> item.orderId로 변경
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>현재 접수된 주문이 없습니다.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", zIndex: 1 },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9e9e9",
    marginTop: Platform.OS === "android" ? 30 : 0,
    position: "relative",
    zIndex: 10,
  },
  dropdownSelector: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#333" },
  headerSubtitle: { fontSize: 13, color: "#888", marginTop: 4 },

  dropdownMenu: {
    position: "absolute",
    top: 65,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedDropdownItem: { backgroundColor: "#f0faf9" },
  dropdownItemText: { fontSize: 16, color: "#555" },
  selectedDropdownItemText: { color: "#2AC1BC", fontWeight: "bold" },

  listContainer: { padding: 16, zIndex: 1 },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  orderNumber: { fontSize: 16, fontWeight: "bold", color: "#2AC1BC" },
  orderTime: { fontSize: 13, color: "#999" },
  menuName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#444",
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalPrice: { fontSize: 16, fontWeight: "bold", color: "#222" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "bold" },

  // 🎨 배지 색상 스타일 맵
  PENDING: { backgroundColor: "#e74c3c" }, // 대기: 빨간색
  ACCEPTED: { backgroundColor: "#3498db" }, // 접수완료: 파란색
  PREPARING: { backgroundColor: "#f39c12" }, // 조리중: 주황색
  DELIVERING: { backgroundColor: "#9b59b6" }, // 배달중: 보라색
  COMP: { backgroundColor: "#2ecc71" }, // 완료: 초록색
  CANCEL: { backgroundColor: "#7f8c8d" }, // 취소: 회색

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: { color: "#999", fontSize: 15 },
});
