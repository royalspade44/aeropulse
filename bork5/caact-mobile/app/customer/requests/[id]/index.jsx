import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Text, View } from "react-native";

import CustomerScreen from "../../../../components/customer/CustomerScreen";
import CustomerSectionHeader from "../../../../components/customer/CustomerSectionHeader";
import Button from "../../../../components/ui/Button";
import Card from "../../../../components/ui/Card";
import DetailRow from "../../../../components/ui/DetailRow";
import StatusChip from "../../../../components/ui/StatusChip";
import { COLORS, FONT, SPACING } from "../../../../constants/theme";
import { useUserContext } from "../../../../context/UserContext";
import { getTaskById } from "../../../../services/taskStorage";
import {
  cancelServiceRequest,
  getServiceRequestById,
} from "../../../../services/serviceRequestStorage";

export default function RequestDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { current } = useUserContext();
  const [request, setRequest] = useState(null);
  const [linkedTask, setLinkedTask] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const loadData = useCallback(async () => {
    const nextRequest = await getServiceRequestById(id);

    if (!nextRequest || String(nextRequest.userId) !== String(current?.id)) {
      setRequest(null);
      setLinkedTask(null);
      return;
    }

    setRequest(nextRequest);
    if (nextRequest.linkedTaskId) {
      const task = await getTaskById(nextRequest.linkedTaskId);
      setLinkedTask(task);
    } else {
      setLinkedTask(null);
    }
  }, [current?.id, id]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      loadData().catch(() => {
        if (active) {
          Alert.alert("Error", "Unable to load request details.");
        }
      });

      return () => {
        active = false;
      };
    }, [loadData]),
  );

  const canCancel =
    request &&
    !["In Progress", "Completed", "Cancelled"].includes(String(request.status));
  const isDeliveryRequest = String(
    request?.serviceType || request?.issueType || "",
  ).toLowerCase() === "delivery";

  const handleCancel = async () => {
    if (!request) return;
    setCancelling(true);
    try {
      await cancelServiceRequest(
        request.id,
        current?.alias || current?.email || "Customer",
      );
      await loadData();
      Alert.alert("Request Cancelled", "Your request has been cancelled.");
    } catch (error) {
      Alert.alert("Unable to Cancel", error?.message || "Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  if (!request) {
    return (
      <CustomerScreen
        title="Service Request Details"
        subtitle="Loading request information"
        onBack={() => router.back()}
        withBottomNav={false}
      >
        <Card>
          <Text style={{ color: COLORS.textSecondary }}>
            Service request not found or no longer accessible.
          </Text>
        </Card>
      </CustomerScreen>
    );
  }

  return (
    <CustomerScreen
      title="Service Request Details"
      subtitle={`Status: ${request.status}`}
      onBack={() => router.back()}
      withBottomNav={false}
    >
      <Card>
        <CustomerSectionHeader
          title={request.serviceType || request.issueType || "Service Request"}
          right={<StatusChip label={request.status} color={COLORS.primary} />}
        />
        <DetailRow label="AC Unit" value={request.unitName || "No AC unit selected"} />
        <DetailRow label="Preferred Schedule" value={request.preferredDate || "Not yet scheduled"} />
        <DetailRow label="Technician" value={request.assignedTechnicianName || "Not yet assigned"} />
        <DetailRow label="Address" value={request.address || "No address provided"} multiline />
        <Text style={{ color: COLORS.textPrimary, marginTop: SPACING.md }}>
          {request.issueDescription || request.concern || "No details provided."}
        </Text>
      </Card>

      {linkedTask ? (
        <Card>
          <CustomerSectionHeader title="Assigned Work Order" />
          <DetailRow label="Work Order" value={linkedTask.title || linkedTask.issueType || "Service Work Order"} />
          <DetailRow label="Work Order Status" value={linkedTask.status} />
          {linkedTask.completionNotes ? (
            <Text style={{ color: COLORS.textPrimary, marginTop: SPACING.sm }}>
              {linkedTask.completionNotes}
            </Text>
          ) : null}
        </Card>
      ) : null}

      <Card>
        <CustomerSectionHeader title="Timeline" />
        {(request.timeline || []).map((event) => (
          <View
            key={event.id}
            style={{
              borderTopWidth: 1,
              borderTopColor: COLORS.border,
              paddingVertical: SPACING.sm,
            }}
          >
            <Text style={{ color: COLORS.textPrimary, fontWeight: FONT.bold }}>
              {event.title}
            </Text>
            <Text style={{ color: COLORS.textSecondary, marginTop: 2 }}>
              {event.description || "No description"}
            </Text>
            <Text style={{ color: COLORS.textMuted, marginTop: 2 }}>
              {`${event.actor} - ${new Date(event.timestamp).toLocaleString()}`}
            </Text>
          </View>
        ))}
      </Card>

      {isDeliveryRequest ? (
        <Button
          title="Confirm Delivery with QR Code"
          variant="secondary"
          onPress={() =>
            router.push(`/customer/requests/${request.id}/unit/log/consume-qr`)
          }
        />
      ) : null}

      {canCancel ? (
        <Button
          title={cancelling ? "Cancelling..." : "Cancel Service Request"}
          variant="danger"
          onPress={handleCancel}
          loading={cancelling}
          disabled={cancelling}
        />
      ) : null}
    </CustomerScreen>
  );
}
