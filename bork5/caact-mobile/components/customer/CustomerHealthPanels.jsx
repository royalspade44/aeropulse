import { Text, View } from "react-native";

import { COLORS, FONT, RADIUS, SPACING } from "../../constants/theme";
import { getHealthColor } from "../../services/acHealthScoreService";
import Card from "../ui/Card";
import DetailRow from "../ui/DetailRow";
import StatusChip from "../ui/StatusChip";

export function CustomerHealthPanel({ health }) {
  if (!health) return null;

  return (
    <Card>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: SPACING.sm,
        }}
      >
        <View>
          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: FONT.sm,
              fontWeight: FONT.bold,
            }}
          >
            Health Score
          </Text>
          <Text
            style={{
              color: health.color,
              fontSize: 34,
              fontWeight: FONT.black,
            }}
          >
            {health.score}
          </Text>
        </View>
        <StatusChip label={health.label} color={health.color} />
      </View>
      <Text style={{ color: COLORS.textPrimary, fontWeight: FONT.bold }}>
        {health.recommendation}
      </Text>
      <View
        style={{
          height: 8,
          borderRadius: RADIUS.full,
          backgroundColor: COLORS.border,
          overflow: "hidden",
          marginTop: SPACING.md,
        }}
      >
        <View
          style={{
            width: `${health.score}%`,
            height: "100%",
            backgroundColor: getHealthColor(health.score),
          }}
        />
      </View>
    </Card>
  );
}

export function CustomerMaintenancePanel({ maintenance }) {
  if (!maintenance) return null;

  return (
    <Card>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: SPACING.sm,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: COLORS.textSecondary,
              fontSize: FONT.sm,
              fontWeight: FONT.bold,
            }}
          >
            Next Recommended Maintenance
          </Text>
          <Text
            style={{
              color: COLORS.textPrimary,
              fontSize: FONT.xl,
              fontWeight: FONT.black,
              marginTop: 2,
            }}
          >
            {maintenance.date || maintenance.label}
          </Text>
        </View>
        <StatusChip label={maintenance.urgency} color={maintenance.color} />
      </View>
      <Text style={{ color: COLORS.textPrimary, fontWeight: FONT.bold }}>
        {maintenance.label}
      </Text>
      <Text
        style={{
          color: COLORS.textSecondary,
          fontSize: FONT.sm,
          marginTop: SPACING.xs,
        }}
      >
        {maintenance.message}
      </Text>
      {maintenance.intervalMonths ? (
        <DetailRow
          label="Recommended Interval"
          value={`Every ${maintenance.intervalMonths} month(s)`}
        />
      ) : null}
    </Card>
  );
}
