import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList, Text, View } from "react-native";

import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import TechButton from "../../components/technician/TechButton";
import TechnicianScreen, { TechHero } from "../../components/technician/TechnicianScreen";
import { COLORS, FONT, RADIUS, SPACING } from "../../constants/theme";
import { useUserContext } from "../../context/UserContext";
import { getDisplayName } from "../../services/profileService";
import { TASK_STATUS, getTasksByTechnician } from "../../services/taskStorage";

export default function TechnicianHome() {
  const router = useRouter();
  const { current } = useUserContext();
  const [activeTasks, setActiveTasks] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      if (!current?.id) return;
      getTasksByTechnician(current.id)
        .then((tasks) =>
          setActiveTasks(tasks.filter((task) => task.status === TASK_STATUS.IN_PROGRESS)),
        )
        .catch(() => {});
    }, [current]),
  );

  const renderItem = ({ item }) => (
    <Card
      style={{
        marginBottom: SPACING.sm,
        borderLeftWidth: 4,
        borderLeftColor: COLORS.tech,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: RADIUS.md,
            backgroundColor: COLORS.techLight,
            alignItems: "center",
            justifyContent: "center",
            marginRight: SPACING.sm,
          }}
        >
          <Ionicons name="snow-sharp" size={22} color={COLORS.tech} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.textPrimary, fontWeight: FONT.black, fontSize: FONT.lg }}>
            {item.unitName || item.title || "Active AC Unit"}
          </Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: FONT.sm, marginTop: 2 }}>
            {item.customerName || "Customer"} • {item.address || "No address"}
          </Text>
          <Text style={{ color: COLORS.textSecondary, fontSize: FONT.sm, marginTop: 2 }}>
            {item.issueType || item.serviceType || item.description || "Service work order"}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: SPACING.sm, marginTop: SPACING.sm }}>
        <TechButton
          title="Details"
          onPress={() => router.push(`/technician/task/${item.id}/information`)}
          leftIcon={<Ionicons name="information-circle-sharp" size={18} color={COLORS.surface} />}
          style={{ flex: 1 }}
        />
        <TechButton
          title="Service Notes"
          onPress={() => router.push(`/technician/task/${item.id}/unit/log/select`)}
          leftIcon={<Ionicons name="document-text-sharp" size={18} color={COLORS.tech} />}
          variant="secondary"
          style={{ flex: 1 }}
        />
      </View>
    </Card>
  );

  return (
    <TechnicianScreen
      title="Active Work"
      subtitle={`Current work orders for ${getDisplayName(current)}`}
      icon="home-sharp"
      scroll={false}
      contentContainerStyle={{ paddingTop: SPACING.md }}
    >
      <FlatList
        data={activeTasks}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <TechHero
            eyebrow="Active Work Orders"
            title={activeTasks.length ? "AC units in service" : "No active work orders"}
            subtitle="Started work orders appear here."
            icon="briefcase-sharp"
          />
        }
        ListEmptyComponent={
          <Card>
            <EmptyState
              title="No active work orders"
              message="Start a work order from My Work Orders to see the AC unit here."
              icon="checkmark-done-sharp"
              iconColor={COLORS.tech}
              action={<TechButton title="Go to Work Orders" onPress={() => router.push("/technician/tasks")} />}
            />
          </Card>
        }
      />
    </TechnicianScreen>
  );
}
