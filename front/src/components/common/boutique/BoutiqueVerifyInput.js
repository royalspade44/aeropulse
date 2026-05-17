import { ShieldCheck, Spinner } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../../config/api";
import BoutiqueInput from "./BoutiqueInput";

/**
 * BOUTIQUE VERIFY INPUT
 * Specialized input for fields requiring OTP verification.
 * Automatically manages OTP request, real-time verification, and persistent success state.
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
  onDebugOtp, // Callback for dev OTP display
  validator, // Custom heuristic validator
  ...props
}) {
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Real-time verification when 6 digits are reached
  useEffect(() => {
    if (otpCode.length === 6 && otpSent && !loading && !verified) {
      handleVerifyOtp();
    }
  }, [otpCode, otpSent, loading, verified]);

  const heuristic = useMemo(() => {
    if (!value) return { status: null };
    if (validator) {
      const result = validator(value);
      if (!result.valid) {
        if (
          value.length >= 11 ||
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

    try {
      const body = { action, channel };
      if (action === "register_phone") body.phone = value;
      else body.messenger_handle = value;

      const response = await apiRequest("/auth/request-otp", {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (response.debugCode && onDebugOtp) {
        onDebugOtp(response.debugCode);
      }
      setOtpSent(true);
    } catch (err) {
      setError(err.message || "Failed to send verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError("");

    try {
      const body = { action, code: otpCode };
      if (action === "register_phone") body.phone = value;
      else body.messenger_handle = value;

      await apiRequest("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify(body),
      });

      onVerifiedChange(true);
      setOtpSent(false);
      setOtpCode("");
    } catch (err) {
      setError(err.message || "Invalid code. Please try again.");
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
        onChange={(e) => onValueChange(e.target.value)}
        disabled={verified || otpSent || loading}
        status={
          verified ? "success" : error && otpSent ? "error" : heuristic.status
        }
        errorMessage={heuristic.reason || error}
        inlineAction={
          <>
            {!verified && !otpSent && (
              <button
                type="button"
                className="bq-reg-inline-btn"
                onClick={handleRequestOtp}
                disabled={loading || heuristic.status === "error" || !value}
              >
                {loading ? <Spinner className="bq-spin" size={16} /> : "Verify"}
              </button>
            )}
            {verified && (
              <div className="bq-verified-badge">
                <ShieldCheck size={18} weight="fill" />
              </div>
            )}
          </>
        }
        {...props}
      />

      {otpSent && (
        <div className="bq-otp-pane bq-slide-down">
          <BoutiqueInput
            label={`Enter code sent to ${value}`}
            icon={ShieldCheck}
            placeholder="000000"
            maxLength="6"
            value={otpCode}
            onChange={(e) =>
              setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            status={error ? "error" : null}
            errorMessage={error}
            style={{
              letterSpacing: "0.5em",
              textAlign: "center",
              fontWeight: "800",
              fontSize: "18px",
              fontFamily: "monospace",
            }}
            inlineAction={
              loading && (
                <div className="bq-verified-badge">
                  <Spinner className="bq-spin" size={18} />
                </div>
              )
            }
          />
          <button
            type="button"
            className="bq-otp-cancel"
            onClick={() => setOtpSent(false)}
          >
            Change {label}
          </button>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-verify-input { display: flex; flex-direction: column; gap: 12px; width: 100%; }

        .bq-reg-inline-btn {
          padding: 8px 16px; background: var(--field-accent); color: white;
          border: none; border-radius: 50px; font-size: 11px;
          font-weight: 800; cursor: pointer; transition: all 0.2s;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .bq-reg-inline-btn:hover:not(:disabled) { filter: brightness(1.1); transform: scale(1.05); }

        .bq-otp-pane {
          background: #f8fafc; padding: 24px; border-radius: 20px;
          display: flex; flex-direction: column; gap: 12px; border: 1.5px solid #e2e8f0;
        }

        .bq-otp-cancel {
          background: none; border: none; font-size: 12px;
          font-weight: 700; cursor: pointer; text-decoration: underline; text-align: center;
          opacity: 0.6;
        }
        .bq-otp-cancel:hover { opacity: 1; }
      `,
        }}
      />
    </div>
  );
}
