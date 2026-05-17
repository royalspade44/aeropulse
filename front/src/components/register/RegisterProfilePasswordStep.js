import {
  ArrowRight,
  Buildings,
  LockKey,
  ShieldCheck,
  User,
  UserCircle,
  WarningDiamond,
  X,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import zxcvbn from "zxcvbn";
import { BRANCHES } from "../../domain/branches/branches";
import { defaultAliasFromEmail } from "../../domain/register/defaultAliasFromEmail";
import { validateProfileAndSecurityStep } from "../../domain/register/validateRegistrationProfile";
import BoutiqueButton from "../common/boutique/BoutiqueButton";
import BoutiqueInput from "../common/boutique/BoutiqueInput";

export default function RegisterProfilePasswordStep({
  formData,
  errors: externalErrors,
  onFieldChange,
  detectedRole,
  detectedRoleLabel,
  onNext,
  onBack,
}) {
  const [localErrors, setLocalErrors] = useState({});

  // Combine external and local errors
  const errors = { ...externalErrors, ...localErrors };

  const nameRegex = /^[a-zA-Z\u00C0-\u017F\s]*$/;

  const handleNameChange = (field, value) => {
    if (nameRegex.test(value)) {
      // Auto-capitalize: capitalize first letter of each word
      const capitalized = value
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      onFieldChange(field, capitalized);
      if (localErrors[field]) {
        setLocalErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    }
  };

  const aliasPlaceholder = useMemo(() => {
    return formData.email ? defaultAliasFromEmail(formData.email) : "juan.dc";
  }, [formData.email]);

  const passwordStrength = useMemo(() => {
    if (!formData.password)
      return { score: 0, label: "Empty", color: "#94a3b8" };
    const result = zxcvbn(formData.password);
    const score = Math.floor(result.guesses_log10 * 10);

    if (score <= 0) return { score, label: "Bad", color: "#ef4444" };
    if (score < 40) return { score, label: "Poor", color: "#f97316" };
    if (score < 65) return { score, label: "Weak", color: "#eab308" };
    if (score < 100) return { score, label: "Good", color: "#22c55e" };
    return { score, label: "Excellent", color: "#10b981" };
  }, [formData.password]);

  const passwordsMatch = useMemo(() => {
    if (!formData.confirmPassword) return null;
    return formData.password === formData.confirmPassword;
  }, [formData.password, formData.confirmPassword]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalErrors({});
    const { errors: vErrors, valid } = validateProfileAndSecurityStep(formData);
    if (valid) onNext();
    else setLocalErrors(vErrors);
  };

  return (
    <form className="bq-reg-step bq-fade-in" onSubmit={handleSubmit}>
      <div className="bq-reg-header">
        <h3 className="bq-reg-title">Profile & Security</h3>
        <p className="bq-reg-desc">
          Set your account details and contact information.
        </p>
      </div>

      <div className="bq-reg-form-grid">
        <BoutiqueInput
          label="First Name"
          icon={User}
          placeholder="Juan"
          value={formData.firstName}
          onChange={(e) => handleNameChange("firstName", e.target.value)}
          status={errors.firstName ? "error" : null}
          errorMessage={errors.firstName}
          required
        />

        <BoutiqueInput
          label="Last Name"
          icon={User}
          placeholder="Dela Cruz"
          value={formData.lastName}
          onChange={(e) => handleNameChange("lastName", e.target.value)}
          status={errors.lastName ? "error" : null}
          errorMessage={errors.lastName}
          required
        />

        <div className="full-width">
          <BoutiqueInput
            label="Sign-In Alias (Optional)"
            icon={UserCircle}
            placeholder={aliasPlaceholder}
            value={formData.alias}
            onChange={(e) => {
              onFieldChange("alias", e.target.value);
              if (localErrors.alias)
                setLocalErrors((prev) => {
                  const n = { ...prev };
                  delete n.alias;
                  return n;
                });
            }}
            status={errors.alias ? "error" : null}
            errorMessage={errors.alias}
            hint="At least 6 characters, at most 36."
          />
        </div>

        {detectedRole !== "customer" && (
          <div className="full-width">
            <BoutiqueInput
              label="Branch Assignment"
              icon={Buildings}
              type="select"
              placeholder="Select your branch"
              value={formData.branch || ""}
              options={BRANCHES}
              onChange={(e) => {
                onFieldChange("branch", e.target.value);
                if (localErrors.branch)
                  setLocalErrors((prev) => {
                    const n = { ...prev };
                    delete n.branch;
                    return n;
                  });
              }}
              status={errors.branch ? "error" : null}
              errorMessage={errors.branch}
              required
            />
          </div>
        )}

        <div className="full-width">
          <BoutiqueInput
            label="Password"
            icon={LockKey}
            type="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => {
              onFieldChange("password", e.target.value);
              if (localErrors.password)
                setLocalErrors((prev) => {
                  const n = { ...prev };
                  delete n.password;
                  return n;
                });
            }}
            status={
              errors.password
                ? "error"
                : passwordStrength.score >= 65
                  ? "success"
                  : null
            }
            errorMessage={errors.password}
            style={{ fontFamily: "monospace" }}
            required
          />
        </div>

        <div className="full-width">
          <BoutiqueInput
            label="Confirm Password"
            icon={LockKey}
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => {
              onFieldChange("confirmPassword", e.target.value);
              if (localErrors.confirmPassword)
                setLocalErrors((prev) => {
                  const n = { ...prev };
                  delete n.confirmPassword;
                  return n;
                });
            }}
            status={
              errors.confirmPassword
                ? "error"
                : passwordsMatch === true
                  ? "success"
                  : null
            }
            errorMessage={errors.confirmPassword}
            style={{ fontFamily: "monospace" }}
            required
          >
            {/* Password Strength Meter */}
            <div className="bq-password-strength">
              <div className="bq-strength-meta">
                <span className="bq-strength-label">
                  Strength:{" "}
                  <strong style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </strong>
                </span>
                <span className="bq-strength-score">
                  {passwordStrength.score} / 100
                </span>
              </div>
              <div className="bq-strength-bar-bg">
                <div
                  className="bq-strength-bar-fill"
                  style={{
                    width: `${Math.min(100, Math.max(5, passwordStrength.score))}%`,
                    backgroundColor: passwordStrength.color,
                  }}
                />
              </div>
            </div>

            {/* Real-time Match Indicator */}
            {formData.confirmPassword &&
              passwordsMatch !== null &&
              !errors.confirmPassword && (
                <div
                  className={`bq-match-indicator ${passwordsMatch ? "success" : "error"}`}
                >
                  {passwordsMatch ? (
                    <>
                      <ShieldCheck size={14} weight="fill" /> Passwords match
                    </>
                  ) : (
                    <>
                      <WarningDiamond size={14} weight="bold" /> Passwords do
                      not match
                    </>
                  )}
                </div>
              )}
          </BoutiqueInput>
        </div>
      </div>

      <div className="bq-reg-actions">
        <BoutiqueButton variant="cancel" onClick={onBack}>
          <X size={18} weight="bold" /> Cancel
        </BoutiqueButton>
        <BoutiqueButton type="submit">
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
        .bq-reg-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .bq-reg-form-grid .full-width { grid-column: span 2; }

        .bq-password-strength { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
        .bq-strength-meta { display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 700; }
        .bq-strength-label { color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        .bq-strength-score { color: #94a3b8; }
        .bq-strength-bar-bg { height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
        .bq-strength-bar-fill { height: 100%; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 3px; }

        .bq-match-indicator { margin-top: 8px; display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; transition: all 0.3s ease; }
        .bq-match-indicator.success { color: #10b981; }
        .bq-match-indicator.error { color: #ef4444; }

        .bq-reg-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; }

        @media (max-width: 640px) {
          .bq-reg-form-grid { grid-template-columns: 1fr; }
          .bq-reg-form-grid .full-width { grid-column: span 1; }
        }
      `,
        }}
      />
    </form>
  );
}
