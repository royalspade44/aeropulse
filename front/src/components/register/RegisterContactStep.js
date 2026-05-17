import {
  ArrowLeft,
  ArrowRight,
  MessengerLogo,
  Phone,
} from "@phosphor-icons/react";
import { validatePhMobileHeuristic } from "../../utils/phMobileValidation";
import { BQ_COLORS, BQ_FONTS } from "../common/boutique/BoutiqueTheme";
import BoutiqueVerifyInput from "../common/boutique/BoutiqueVerifyInput";

export default function RegisterContactStep({
  formData,
  onFieldChange,
  onNext,
  onBack,
}) {
  const isComplete = formData.phoneVerified && formData.messengerVerified;

  return (
    <div className="bq-reg-step">
      <div className="bq-reg-header">
        <h3 className="bq-reg-title">Contact Verification</h3>
        <p className="bq-reg-desc">
          Verify your phone and messenger handle to continue.
        </p>
      </div>

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
        onValueChange={(val) => onFieldChange("messengerHandle", val)}
        verified={formData.messengerVerified}
        onVerifiedChange={(val) => onFieldChange("messengerVerified", val)}
        action="register_messenger"
        channel="messenger"
      />

      <div className="bq-reg-actions">
        <button
          type="button"
          className="bq-reg-btn bq-reg-btn--ghost"
          onClick={onBack}
        >
          <ArrowLeft size={18} weight="bold" /> Back
        </button>
        <button
          type="button"
          className="bq-reg-btn bq-reg-btn--primary"
          onClick={onNext}
          disabled={!isComplete}
        >
          Continue <ArrowRight size={18} weight="bold" />
        </button>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-reg-step { display: flex; flex-direction: column; gap: 24px; width: 100%; }
        .bq-reg-header { margin-bottom: 8px; }
        .bq-reg-title { font-family: ${BQ_FONTS.heading}; font-size: 24px; font-weight: 800; color: ${BQ_COLORS.ink}; margin: 0; }
        .bq-reg-desc { font-size: 15px; color: ${BQ_COLORS.inkMuted}; margin-top: 8px; }

        .bq-reg-actions { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; }
        .bq-reg-btn {
          padding: 14px 24px; border-radius: 50px;
          font-family: ${BQ_FONTS.heading}; font-weight: 800; font-size: 14px;
          text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer;
          display: flex; align-items: center; gap: 10px; transition: all 0.3s; border: none;
        }
        .bq-reg-btn--primary { background: ${BQ_COLORS.brand}; color: white; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .bq-reg-btn--primary:disabled { opacity: 0.5; cursor: not-allowed; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `,
        }}
      />
    </div>
  );
}
