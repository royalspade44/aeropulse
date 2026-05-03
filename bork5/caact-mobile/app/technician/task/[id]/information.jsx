import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import TechButton from "../../../../components/technician/TechButton";
import Card from "../../../../components/ui/Card";
import InfoCard from "../../../../components/ui/InfoCard";
import PageHeader from "../../../../components/ui/PageHeader";
import { COLORS, FONT, SPACING } from "../../../../constants/theme";
import { calculateUnitHealthScore } from "../../../../services/acHealthScoreService";
import { getServiceRequestsByUser } from "../../../../services/serviceRequestStorage";
import { getTaskById, TASK_STATUS } from "../../../../services/taskStorage";
import { getUnitByCode } from "../../../../services/unitStorage";
import { getServiceLogsByUnit } from "../../../../services/unitServiceLogStorage";

function money(value) {
  return `PHP ${Number(value || 0).toFixed(2)}`;
}

export default function TaskInformationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [task, setTask] = useState(null);
  const [unit, setUnit] = useState(null);
  const [requests, setRequests] = useState([]);
  const [logs, setLogs] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      async function load() {
        const loadedTask = await getTaskById(id);
        const loadedUnit = loadedTask?.unitId
          ? await getUnitByCode(loadedTask.unitId)
          : null;
        const loadedRequests = loadedTask?.customerId
          ? await getServiceRequestsByUser(loadedTask.customerId)
          : [];
        const loadedLogs = loadedUnit?.id ? await getServiceLogsByUnit(loadedUnit.id) : [];
        if (active) {
          setTask(loadedTask);
          setUnit(loadedUnit);
          setRequests(loadedRequests);
          setLogs(loadedLogs);
        }
      }
      load();
      return () => {
        active = false;
      };
    }, [id]),
  );

  const health = unit
    ? calculateUnitHealthScore({
        unit,
        requests: requests.filter(
          (request) =>
            String(request.unitId || "") === String(unit.id) ||
            String(request.unitName || "").toLowerCase() ===
              String(unit.unitName || "").toLowerCase(),
        ),
        tasks: task ? [task] : [],
      })
    : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView
        contentContainerStyle={{
          padding: SPACING.md,
          paddingBottom: 96,
        }}
      >
        <PageHeader
          title="Work Order Details"
          subtitle={task?.title || task?.issueType || `Work Order #${String(id).slice(0, 8)}`}
          color={COLORS.tech}
          onBack={() => router.back()}
        />

        <Card>
          <InfoCard label="Status" value={task?.status || "Unknown"} />
          <InfoCard label="Customer" value={task?.customerName || "Unknown"} />
          <InfoCard label="Address" value={task?.address || "Not provided"} />
          <InfoCard label="Schedule" value={task?.scheduledDate || "Unscheduled"} />
          <InfoCard label="Service Concern" value={task?.description || task?.concern || "None"} />
        </Card>

        <Card>
          <Text
            style={{
              color: COLORS.textPrimary,
              fontWeight: FONT.black,
              fontSize: FONT.lg,
              marginBottom: SPACING.sm,
            }}
          >
            AC Unit Details
          </Text>
          <InfoCard label="AC Unit" value={unit?.unitName || task?.unitName || "Unassigned"} />
          <InfoCard label="Brand / Model" value={[unit?.brand, unit?.model].filter(Boolean).join(" / ") || "Not provided"} />
          <InfoCard label="Serial" value={unit?.serialNumber || "Not provided"} />
          <InfoCard label="Warranty Status" value={unit?.installationDate ? "Check purchase date and warranty terms" : "Unknown"} />
          {health && (
            <InfoCard
              label="Maintenance Status"
              value={`${health.score} - ${health.label}. ${health.recommendation}`}
            />
          )}
        </Card>

        <Card>
          <Text
            style={{
              color: COLORS.textPrimary,
              fontWeight: FONT.black,
              fontSize: FONT.lg,
              marginBottom: SPACING.sm,
            }}
          >
            Service Report
          </Text>
          <InfoCard label="Before" value={task?.beforeCondition || "No report yet"} />
          <InfoCard label="Findings" value={task?.findings || "No findings yet"} />
          <InfoCard label="Resolution" value={task?.resolution || "No resolution yet"} />
          <InfoCard label="Total Cost" value={money(task?.totalServiceCost)} />
        </Card>

        <Card>
          <Text
            style={{
              color: COLORS.textPrimary,
              fontWeight: FONT.black,
              fontSize: FONT.lg,
              marginBottom: SPACING.sm,
            }}
          >
            Service History
          </Text>
          <Text style={{ color: COLORS.textSecondary, marginBottom: SPACING.sm }}>
            {logs.length} service note(s) and {requests.length} related service request(s) found.
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm }}>
            {!!task?.unitId && (
              <TechButton
                title="View Service Notes"
                onPress={() => router.push(`/technician/task/${task.id}/unit/log/select`)}
                size="sm"
              />
            )}
            {task?.status === TASK_STATUS.IN_PROGRESS && !!task?.unitId && (
              <TechButton
                title="Add Service Note"
                onPress={() => router.push(`/technician/task/${task.id}/unit/log/insert`)}
                size="sm"
                variant="secondary"
              />
            )}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
