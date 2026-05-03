import { useMemo } from "react";
import { View } from "react-native";

import QRCode from "qrcode-terminal/vendor/QRCode";
import QRErrorCorrectLevel from "qrcode-terminal/vendor/QRCode/QRErrorCorrectLevel";

function buildQrModules(value) {
  if (!value) return [];

  const qr = new QRCode(-1, QRErrorCorrectLevel.M);
  qr.addData(value);
  qr.make();
  return qr.modules || [];
}

export default function QrCodeMatrix({
  value,
  size = 184,
  darkColor = "#0F172A",
  lightColor = "#FFFFFF",
}) {
  const modules = useMemo(() => buildQrModules(value), [value]);
  const moduleCount = modules.length;

  if (!moduleCount) {
    return (
      <View
        style={{
          width: size,
          height: size,
          backgroundColor: lightColor,
          borderWidth: 1,
          borderColor: "#E2E8F0",
        }}
      />
    );
  }

  const quietZone = 4;
  const cellSize = size / (moduleCount + quietZone * 2);
  const quietCells = Array.from({ length: quietZone });

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Authenticator app QR code"
      style={{
        width: size,
        height: size,
        backgroundColor: lightColor,
        padding: cellSize * quietZone,
      }}
    >
      {quietCells.map((_, index) => (
        <View key={`top-${index}`} />
      ))}
      {modules.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={{ flexDirection: "row" }}>
          {row.map((isDark, colIndex) => (
            <View
              key={`${rowIndex}-${colIndex}`}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: isDark ? darkColor : lightColor,
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}
