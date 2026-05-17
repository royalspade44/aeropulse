import {
  ArrowLeft,
  ArrowRight,
  EnvelopeSimple,
  ShieldCheck,
  Spinner,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { apiRequest } from "../../config/api";
import BoutiqueButton from "../common/boutique/BoutiqueButton";
import BoutiqueInput from "../common/boutique/BoutiqueInput";

export default function RegisterEmailStep({
  formData,
  errors: externalErrors,
  onFieldChange,
  detectedRole,
  detectedRoleLabel,
  onNext,
  onBack,
}) {
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const isVerified = formData.emailVerified;
  const hasSecret = Boolean(formData.registrationSecret);

  // Combine external and email errors
  const finalEmailError = externalErrors.email || emailError;

  // Real-time verification when 6 digits are reached
  useEffect(() => {
    if (otpCode.length === 6 && hasSecret && !isVerified && !loading) {
      handleVerifyCode();
    }
  }, [otpCode]);

  const handleStartVerification = async () => {
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setEmailError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    setEmailError("");

    try {
      const response = await apiRequest("/auth/register/start", {
        method: "POST",
        body: JSON.stringify({ email: formData.email }),
      });

      if (response.secret) {
        onFieldChange("registrationSecret", response.secret);
        onFieldChange("provisioningUri", response.provisioningUri);
        if (response.verifiedCode) {
          onFieldChange("emailVerified", true);
        }
      } else {
        setEmailError(response.message || "Failed to initialize verification.");
      }
    } catch (err) {
      setEmailError(err.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    setOtpError("");

    try {
      const response = await apiRequest("/auth/register/verify", {
        method: "POST",
        body: JSON.stringify({
          email: formData.email,
          code: otpCode,
          secret: formData.registrationSecret,
        }),
      });

      if (response.registrationProgress || response.sessionToken) {
        onFieldChange("emailVerified", true);
        setOtpCode("");
      } else {
        setOtpError(response.message || "Verification failed.");
      }
    } catch (err) {
      setOtpError(err.message || "Verification failed. Check your code.");
      setOtpCode(""); // Clear code on failure
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bq-reg-step bq-fade-in">
      <div className="bq-reg-header">
        <h3 className="bq-reg-title">Email Verification</h3>
        <p className="bq-reg-desc">
          Verify your email to receive your security secret.
        </p>
      </div>

      <BoutiqueInput
        label="Email Address"
        icon={EnvelopeSimple}
        type="email"
        placeholder="you@example.com"
        value={formData.email}
        onChange={(e) => {
          onFieldChange("email", e.target.value);
          if (emailError) setEmailError("");
        }}
        disabled={hasSecret || isVerified || loading}
        status={isVerified ? "success" : finalEmailError ? "error" : null}
        errorMessage={finalEmailError}
        inlineAction={
          isVerified ? (
            <div className="bq-verified-badge">
              <ShieldCheck size={18} weight="fill" />
            </div>
          ) : (
            !hasSecret && (
              <button
                type="button"
                className="bq-reg-inline-btn"
                onClick={handleStartVerification}
                disabled={loading || !formData.email}
              >
                {loading ? <Spinner className="bq-spin" size={16} /> : "Verify"}
              </button>
            )
          )
        }
      />

      {/* TOTP SETUP PANE */}
      {hasSecret && !isVerified && (
        <div className="bq-otp-pane bq-slide-down">
          <p className="bq-otp-instruction">
            Enter the 6-digit security code from your authenticator app to
            complete verification.
          </p>

          <BoutiqueInput
            label="Enter 6-Digit Code"
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
            onClick={() => {
              onFieldChange("registrationSecret", "");
              onFieldChange("provisioningUri", "");
              setOtpError("");
            }}
          >
            Change Email
          </button>
        </div>
      )}

      {detectedRole !== "customer" && (
        <div className="bq-reg-role-pill">
          Role detected: <strong>{detectedRoleLabel}</strong>
        </div>
      )}

      <div className="bq-reg-actions">
        <BoutiqueButton variant="ghost" onClick={onBack} disabled={loading}>
          <ArrowLeft size={18} weight="bold" /> Back
        </BoutiqueButton>
        <BoutiqueButton onClick={onNext} disabled={loading || !isVerified}>
          Continue <ArrowRight size={18} weight="bold" />
        </BoutiqueButton>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-reg-step { display: flex; flex-direction: column; gap: 24px; width: 100%; }
        .bq-reg-header { margin-bottom: 8px; }
        .bq-reg-title { font-size: 24px; font-weight: 800; margin: 0; }
        .bq-reg-desc { font-size: 15px; margin-top: 8px; opacity: 0.8; }

        .bq-reg-inline-btn {
          padding: 8px 16px; background: var(--field-accent); color: white;
          border: none; border-radius: 50px; font-size: 11px;
          font-weight: 800; cursor: pointer; transition: all 0.2s;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .bq-reg-inline-btn:hover:not(:disabled) { filter: brightness(1.1); transform: scale(1.05); }

        .bq-otp-pane {
          background: #f8fafc; padding: 24px; border-radius: 20px;
          display: flex; flex-direction: column; gap: 24px; border: 1.5px solid #e2e8f0;
        }

        .bq-otp-instruction { font-size: 13px; line-height: 1.6; margin: 0; opacity: 0.7; }
        .bq-otp-cancel { background: none; border: none; font-size: 12px; cursor: pointer; text-decoration: underline; opacity: 0.6; }
        .bq-otp-cancel:hover { opacity: 1; }

        .bq-reg-role-pill {
          background: #f1f5f9; padding: 12px 20px; border-radius: 12px;
          font-size: 14px; opacity: 0.8;
        }

        .bq-reg-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; }
      `,
        }}
      />
    </div>
  );
}
