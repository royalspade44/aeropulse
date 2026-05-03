import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Text } from "react-native";

import CustomerScreen from "../../../../../../components/customer/CustomerScreen";
import Button from "../../../../../../components/ui/Button";
import Card from "../../../../../../components/ui/Card";
import TextField from "../../../../../../components/ui/TextField";
import { COLORS, FONT, SPACING } from "../../../../../../constants/theme";
import { useUserContext } from "../../../../../../context/UserContext";
import {
  getServiceRequestById,
  updateServiceRequestStatus,
} from "../../../../../../services/serviceRequestStorage";
import { claimUnitForUserByCode } from "../../../../../../services/unitStorage";

function extractTaggedValue(rawValue, tag) {
  const match = String(rawValue || "").match(
    new RegExp(`${tag}:([^|]+)`, "i"),
  );
  return match?.[1]?.trim() || "";
}

export default function ConsumeDeliveryQrScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { current } = useUserContext();
  const [request, setRequest] = useState(null);
  const [rawValue, setRawValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getServiceRequestById(id).then((item) => {
        if (active) setRequest(item);
      });
      return () => {
        active = false;
      };
    }, [id]),
  );

  const isDeliveryRequest = String(
    request?.serviceType || request?.issueType || "",
  ).toLowerCase() === "delivery";

  const handleConsume = async () => {
    if (!request) return;

    if (!isDeliveryRequest) {
      Alert.alert(
        "Unavailable",
        "Delivery QR code confirmation is only available for delivery service requests.",
      );
      return;
    }

    if (!rawValue.trim()) {
      Alert.alert("Required", "Paste or scan the delivery QR code value.");
      return;
    }

    const taggedRequestId = extractTaggedValue(rawValue, "REQUEST");
    const unitLookupValue =
      extractTaggedValue(rawValue, "UNIT") ||
      extractTaggedValue(rawValue, "SERIAL") ||
      rawValue.trim();

    if (taggedRequestId && String(taggedRequestId) !== String(id)) {
      Alert.alert("Mismatched QR Code", "This QR code belongs to another service request.");
      return;
    }

    setSubmitting(true);
    try {
      const claim = await claimUnitForUserByCode(unitLookupValue, current?.id);

      if (claim.status === "not_found") {
        Alert.alert(
          "AC Unit Not Found",
          "The QR code did not match any registered or deliverable AC unit.",
        );
        return;
      }

      await updateServiceRequestStatus(
        request.id,
        "Completed",
        "Customer",
        "Customer confirmed delivery using the technician QR code.",
      );

      Alert.alert(
        "Delivery Confirmed",
        "The delivery request has been marked complete.",
        [
          {
            text: "Back to Request",
            onPress: () => router.replace(`/customer/requests/${request.id}`),
          },
        ],
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomerScreen
      title="Confirm Delivery"
      subtitle="Use the technician QR code to confirm delivery"
      onBack={() => router.back()}
      withBottomNav={false}
    >
      <Card>
        <Text
          style={{
            color: COLORS.textPrimary,
            fontWeight: FONT.black,
            fontSize: FONT.lg,
            marginBottom: SPACING.sm,
          }}
        >
          Delivery Request
        </Text>
        <Text style={{ color: COLORS.textSecondary }}>
          Service type: {request?.serviceType || request?.issueType || "Unknown"}
        </Text>
        <Text style={{ color: COLORS.textSecondary, marginTop: 2 }}>
          AC Unit: {request?.unitName || "Unassigned"}
        </Text>
      </Card>

      <Card>
        <TextField
          label="QR Code Value"
          value={rawValue}
          onChangeText={setRawValue}
          placeholder="Paste or scan the technician QR code here"
          multiline
          style={{ minHeight: 100, textAlignVertical: "top" }}
        />
        <Button
          title={submitting ? "Confirming..." : "Confirm Delivery"}
          onPress={handleConsume}
          loading={submitting}
          disabled={submitting}
        />
      </Card>
    </CustomerScreen>
  );
}
