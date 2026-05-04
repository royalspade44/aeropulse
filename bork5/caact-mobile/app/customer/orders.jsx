import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Linking, Text, View } from "react-native";

import CustomerScreen from "../../components/customer/CustomerScreen";
import CustomerSectionHeader from "../../components/customer/CustomerSectionHeader";
import AppHero from "../../components/ui/AppHero";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import IconRow from "../../components/ui/IconRow";
import StatusChip from "../../components/ui/StatusChip";
import { COLD_AIR_WEBSITE } from "../../constants/company";
import { COLORS, SPACING } from "../../constants/theme";
import { useUserContext } from "../../context/UserContext";
import { fetchMyOrders } from "../../services/api";
import { getOrdersByUser } from "../../services/orderStorage";

function statusColor(status = "") {
  const value = status.toLowerCase();
  if (value.includes("approved") || value.includes("released") || value.includes("delivered")) {
    return COLORS.success;
  }
  if (value.includes("rejected") || value.includes("cancelled") || value.includes("failed")) {
    return COLORS.danger;
  }
  return COLORS.warning;
}

export default function CustomerOrdersScreen() {
  const { current, token } = useUserContext();
  const [orders, setOrders] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
        const result = token
          ? await fetchMyOrders(token)
          : { success: false, orders: [] };

        const nextOrders = result.success
          ? result.orders
          : await getOrdersByUser(current);

        if (active) setOrders(nextOrders);
      };

      load();
      return () => {
        active = false;
      };
    }, [current, token]),
  );

  return (
    <CustomerScreen title="Orders" subtitle="Website purchases and delivery updates">
      <AppHero
        eyebrow="Order Center"
        title={`${orders.length} website order${orders.length === 1 ? "" : "s"}`}
        subtitle="Track payment, delivery, and related service requests."
        icon="receipt-sharp"
        color={COLORS.primaryDark}
      />

      {orders.length === 0 ? (
        <Card>
          <EmptyState
            title="No orders yet"
            message="You have not placed any website orders yet. Visit coldair-act.online to buy your next AC unit."
            icon="cart-sharp"
            iconColor={COLORS.primary}
            action={
              <Button
                title="Buy at coldair-act.online"
                onPress={() => Linking.openURL(COLD_AIR_WEBSITE)}
                leftIcon={<Ionicons name="globe-sharp" size={18} color={COLORS.surface} />}
              />
            }
          />
        </Card>
      ) : (
        orders.map((order) => {
          const color = statusColor(`${order.status} ${order.deliveryStatus}`);
          return (
            <Card key={order.id}>
              <CustomerSectionHeader
                title={`Order #${String(order.id).slice(-6).toUpperCase()}`}
                right={<StatusChip label={order.status} color={color} />}
              />
              <View style={{ marginBottom: SPACING.sm }}>
                  <Text
                    style={{
                      color: COLORS.textSecondary,
                    }}
                  >
                    PHP {Number(order.total || 0).toFixed(2)}
                  </Text>
              </View>

              <IconRow
                icon="bicycle-sharp"
                title="Delivery"
                subtitle={order.deliveryStatus}
                color={COLORS.primary}
              />
              <IconRow
                icon="card-sharp"
                title="Payment"
                subtitle={order.paymentStatus}
                color={COLORS.success}
              />
              {order.serviceRequestId ? (
                <IconRow
                  icon="construct-sharp"
                  title="Related service request"
                  subtitle={order.serviceRequestId}
                  color={COLORS.warning}
                />
              ) : null}
            </Card>
          );
        })
      )}
    </CustomerScreen>
  );
}
