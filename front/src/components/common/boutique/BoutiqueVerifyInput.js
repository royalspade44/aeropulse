import { ShieldCheck, Spinner } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../../config/api";
import BoutiqueInput from "./BoutiqueInput";
import { BQ_COLORS } from "./BoutiqueTheme";

/**
 * BOUTIQUE VERIFY INPUT
 * Unified verification component for Phone and Messenger.
 * Reimplemented to perfectly mirror the proven SMS logic.
 */
export default function BoutiqueVerifyInput({
  label,
  icon,
  type = "text",
  placeholder,
  value,
  onValueChange,
  verified,
  onVerifiedChange,
  action, // 'register_phone' or 'register_messenger'
  channel, // 'sms' or 'messenger'
  validator, // Custom heuristic validator
  ...props
}) {
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState("");

  // Auto-verify on 6th digit
  useEffect(() => {
    if (otpCode.length === 6 && otpSent && !loading && !verified) {
      handleVerifyOtp();
    }
  }, [otpCode]);

  const heuristic = useMemo(() => {
    if (!value) return { status: null };
    if (validator) {
      const result = validator(value);
      if (!result.valid) {
        // Show error if value is substantial enough to be "wrong"
        if (
          value.length > 5 ||
          (value.length >= 2 && result.reason?.includes("start"))
        ) {
          return { status: "error", reason: result.reason };
        }
        return { status: null };
      }
      return { status: "success" };
    }
    return { status: "success" };
  }, [value, validator]);

  const handleRequestOtp = async () => {
    if (heuristic.status === "error") {
      setError(heuristic.reason);
      return;
    }

    setLoading(true);
    setError("");
    setOtpError("");

    try {
      const payload = { action, channel };
      if (action === "register_phone") payload.phone = value;
      else payload.messenger_handle = value;

      const response = await apiRequest("/auth/request-otp", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // Technical logging for local development
      if (response.debugCode) {
        console.log(
          `\n[BOUTIQUE] OTP CODE FOR ${label.toUpperCase()}: ${response.debugCode}\n`,
        );
      }

      setOtpSent(true);
    } catch (err) {
      setError(err.message || "Request failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setOtpError("");

    try {
      const payload = { action, code: otpCode, channel };
      if (action === "register_phone") payload.phone = value;
      else payload.messenger_handle = value;

      await apiRequest("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      onVerifiedChange(true);
      setOtpSent(false);
      setOtpCode("");
    } catch (err) {
      setOtpError(err.message || "Invalid code. Please try again.");
      setOtpCode("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bq-verify-input bq-fade-in">
      <BoutiqueInput
        label={label}
        icon={icon}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          onValueChange(e.target.value);
          if (error) setError("");
        }}
        disabled={verified || otpSent || loading}
        status={verified ? "success" : error ? "error" : heuristic.status}
        errorMessage={error || heuristic.reason}
        inlineAction={
          <>
            {!verified && !otpSent && (
              <button
                type="button"
                className="bq-verify-inline-btn"
                onClick={handleRequestOtp}
                disabled={loading || heuristic.status === "error" || !value}
              >
                {loading ? <Spinner className="bq-spin" size={16} /> : "Verify"}
              </button>
            )}
            {verified && (
              <div className="bq-verified-badge">
                <ShieldCheck size={20} weight="fill" />
              </div>
            )}
          </>
        }
        {...props}
      />

      {otpSent && !verified && (
        <div className="bq-otp-panel bq-slide-down">
          <p className="bq-otp-hint">
            Enter the 6-digit code sent to <strong>{value}</strong>.
          </p>

          <BoutiqueInput
            label="Security Code"
            icon={ShieldCheck}
            placeholder="000000"
            maxLength="6"
            value={otpCode}
            onChange={(e) => {
              setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6));
              if (otpError) setOtpError("");
            }}
            status={otpError ? "error" : null}
            errorMessage={otpError}
            style={{
              letterSpacing: "0.5em",
              textAlign: "center",
              fontWeight: "700",
              fontSize: "20px",
              fontFamily: "monospace",
            }}
            inlineAction={loading && <Spinner className="bq-spin" size={18} />}
          />

          <button
            type="button"
            className="bq-otp-reset"
            onClick={() => {
              setOtpSent(false);
              setOtpError("");
              setOtpCode("");
            }}
          >
            Change {label}
          </button>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-verify-input { display: flex; flex-direction: column; gap: 16px; width: 100%; }

        .bq-verify-inline-btn {
          padding: 8px 18px; background: ${BQ_COLORS.brand}; color: white;
          border: none; border-radius: 50px; font-size: 11px;
          font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          text-transform: uppercase; letter-spacing: 0.08em;
        }
        .bq-verify-inline-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .bq-verify-inline-btn:disabled { background: ${BQ_COLORS.border}; cursor: not-allowed; color: ${BQ_COLORS.inkFaint}; }

        .bq-otp-panel {
          background: ${BQ_COLORS.bg}; padding: 28px; border-radius: 24px;
          display: flex; flex-direction: column; gap: 20px; border: 1px solid ${BQ_COLORS.border};
          animation: bq-slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .bq-otp-hint { font-size: 14px; color: ${BQ_COLORS.inkMuted}; margin: 0; line-height: 1.5; }

        .bq-otp-reset {
          background: none; border: none; font-size: 12px;
          font-weight: 700; cursor: pointer; text-decoration: underline; text-align: center;
          opacity: 0.6; color: ${BQ_COLORS.ink}; transition: opacity 0.2s;
        }
        .bq-otp-reset:hover { opacity: 1; }

        @keyframes bq-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .bq-spin { animation: bq-spin 1s linear infinite; color: ${BQ_COLORS.accent}; }

        @keyframes bq-slide-down { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `,
        }}
      />
    </div>
  );
}
