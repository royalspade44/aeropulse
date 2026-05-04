import { useRouter } from "expo-router";
import { useState } from "react";
import { Text } from "react-native";

import { CustomerHealthPanel, CustomerMaintenancePanel } from "../../components/customer/CustomerHealthPanels";
import CustomerScreen from "../../components/customer/CustomerScreen";
import QrCameraScanner from "../../components/technician/QrCameraScanner";
import AppHero from "../../components/ui/AppHero";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import EmptyState from "../../components/ui/EmptyState";
import IconRow from "../../components/ui/IconRow";
import { COLORS, FONT, SPACING } from "../../constants/theme";
import { useUserContext } from "../../context/UserContext";
import {
  buildNextRecommendedMaintenance,
  calculateUnitHealthScore,
} from "../../services/acHealthScoreService";
import { lookupUnitContext } from "../../services/qrLookupService";

export default function CustomerScanQrScreen() {
  const router = useRouter();
  const { token } = useUserContext();
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (rawValue) => {
    const value = String(rawValue || "").trim();
    if (!value) return;

    setLoading(true);
    try {
      const data = await lookupUnitContext(value, { token });
      setResult(data);
      setCode(value);
    } finally {
      setLoading(false);
    }
  };

  const health = result?.health || null;
  const fallbackHealth = result?.unit
    ? calculateUnitHealthScore({
        unit: result.unit,
        requests: result.requests,
        tasks: result.tasks,
      })
    : null;
  const activeHealth = health || fallbackHealth;
  const maintenance = activeHealth ? buildNextRecommendedMaintenance(activeHealth) : null;

  return (
    <CustomerScreen title="Scan QR" subtitle="Scan your AC unit QR code to see its health">
      <AppHero
        eyebrow="AI Health"
        title="Scan an AC unit QR code"
        subtitle="OpenAI is used when available. If the server key is missing, the app falls back to the local health model."
        icon="qr-code-sharp"
      />

      <QrCameraScanner active={!loading} onScanned={handleScan} />

      {code ? (
        <Card>
          <IconRow icon="scan-sharp" title="Last scanned code" subtitle={code} color={COLORS.primary} />
        </Card>
      ) : null}

      {!result?.unit ? (
        <Card>
          <EmptyState
            title="No QR scan yet"
            message="Scan a unit QR code to see the health summary and maintenance guidance."
          />
        </Card>
      ) : (
        <>
          <Card>
            <Text style={{ color: COLORS.textPrimary, fontWeight: FONT.black, marginBottom: SPACING.xs }}>
              {result.unit.unitName || "AC Unit"}
            </Text>
            <Text style={{ color: COLORS.textSecondary, marginBottom: SPACING.sm }}>
              {[result.unit.brand, result.unit.model].filter(Boolean).join(" / ") || "Brand and model not set"}
            </Text>
            <CustomerHealthPanel health={activeHealth} />
          </Card>

          {maintenance ? (
            <Card>
              <CustomerMaintenancePanel maintenance={maintenance} />
            </Card>
          ) : null}

          <Card>
            <Button title="View Unit Details" onPress={() => router.push(`/customer/units/${result.unit.id}`)} />
          </Card>
        </>
      )}
    </CustomerScreen>
  );
}