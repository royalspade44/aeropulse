import {
  ArrowLeft,
  ArrowRight,
  MessengerLogo,
  Phone,
} from "@phosphor-icons/react";
import { validatePhMobileHeuristic } from "../../utils/phMobileValidation";
import BoutiqueButton from "../common/boutique/BoutiqueButton";
import {
  BQ_COLORS,
  BQ_FONTS,
  BQ_WEIGHTS,
} from "../common/boutique/BoutiqueTheme";
import BoutiqueVerifyInput from "../common/boutique/BoutiqueVerifyInput";

/**
 * Heuristic for Messenger handles: Alphanumeric and dots, min 3 chars.
 */
const validateMessengerHeuristic = (val) => {
  if (!val || val.length < 3)
    return { valid: false, reason: "Minimum 3 characters required" };
  if (!/^[a-zA-Z0-9.]+$/.test(val))
    return {
      valid: false,
      reason: "Invalid format (use alphanumeric and dots only)",
    };
  return { valid: true };
};

export default function RegisterContactStep({
  formData,
  onFieldChange,
  onNext,
  onBack,
}) {
  const isComplete = formData.phoneVerified && formData.messengerVerified;

  return (
    <div className="bq-reg-step bq-fade-in">
      <div className="bq-reg-header">
        <h3 className="bq-reg-title">Contact Verification</h3>
        <p className="bq-reg-desc">
          Verify your identity across multiple channels to secure your account.
        </p>
      </div>

      <div className="bq-reg-contact-fields">
        {/* PHONE VERIFICATION */}
        <BoutiqueVerifyInput
          label="Phone Number"
          icon={Phone}
          type="tel"
          placeholder="09XXXXXXXXX"
          value={formData.phone}
          onValueChange={(val) =>
            onFieldChange("phone", val.replace(/\D/g, "").slice(0, 11))
          }
          verified={formData.phoneVerified}
          onVerifiedChange={(val) => onFieldChange("phoneVerified", val)}
          action="register_phone"
          channel="sms"
          validator={validatePhMobileHeuristic}
        />

        {/* MESSENGER VERIFICATION */}
        <BoutiqueVerifyInput
          label="FB Messenger Handle"
          icon={MessengerLogo}
          placeholder="username"
          value={formData.messengerHandle}
          onValueChange={(val) => onFieldChange("messengerHandle", val.trim())}
          verified={formData.messengerVerified}
          onVerifiedChange={(val) => onFieldChange("messengerVerified", val)}
          action="register_messenger"
          channel="messenger"
          validator={validateMessengerHeuristic}
        />
      </div>

      <div className="bq-reg-actions">
        <BoutiqueButton variant="ghost" onClick={onBack}>
          <ArrowLeft size={18} weight="bold" /> Back
        </BoutiqueButton>
        <BoutiqueButton onClick={onNext} disabled={!isComplete}>
          Continue <ArrowRight size={18} weight="bold" />
        </BoutiqueButton>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-reg-step { display: flex; flex-direction: column; gap: 32px; width: 100%; }

        .bq-reg-header { margin-bottom: 8px; }
        .bq-reg-title { font-family: ${BQ_FONTS.heading}; font-size: 28px; font-weight: ${BQ_WEIGHTS.bold}; color: ${BQ_COLORS.ink}; margin: 0; }
        .bq-reg-desc { font-size: 16px; color: ${BQ_COLORS.inkMuted}; margin-top: 8px; font-weight: ${BQ_WEIGHTS.medium}; }

        .bq-reg-contact-fields { display: flex; flex-direction: column; gap: 32px; }

        .bq-reg-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; }
      `,
        }}
      />
    </div>
  );
}
