import { ArrowRight, X } from "@phosphor-icons/react";
import { useMemo } from "react";
import BoutiqueButton from "../common/boutique/BoutiqueButton";
import BoutiqueCheckbox from "../common/boutique/BoutiqueCheckbox";
import { BQ_COLORS } from "../common/boutique/BoutiqueTheme";

export default function RegisterLegalConsentsStep({
  formData,
  errors,
  onFieldChange,
  onNext,
  onBack,
}) {
  const consents = [
    {
      id: "agreeTermsWarranty",
      link: "/terms",
      linkText: "warranty terms and conditions",
    },
    {
      id: "agreeTermsService",
      link: "/terms",
      linkText: "service terms and conditions",
    },
    {
      id: "agreeTermsApp",
      link: "/terms",
      linkText: "app terms and conditions",
    },
    {
      id: "agreePrivacyRa10173",
      link: "/privacy",
      linkText: "data privacy disclosure (RA 10173)",
    },
  ];

  const allChecked = useMemo(() => {
    return consents.every((c) => !!formData[c.id]);
  }, [formData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (allChecked) {
      onNext();
    }
  };

  return (
    <form className="bq-reg-step bq-fade-in" onSubmit={handleSubmit}>
      <div className="bq-reg-header">
        <h3 className="bq-reg-title">Terms & Privacy</h3>
        <p className="bq-reg-desc">
          Please review and accept our policies to continue.
        </p>
      </div>

      <div className="bq-reg-consent-list">
        {consents.map((c) => (
          <BoutiqueCheckbox
            key={c.id}
            checked={!!formData[c.id]}
            onChange={(val) => onFieldChange(c.id, val)}
            error={errors[c.id]}
          >
            <span>
              I agree to the{" "}
              <a
                href={c.link}
                target="_blank"
                rel="noreferrer"
                className="bq-reg-link"
              >
                {c.linkText}
              </a>
            </span>
          </BoutiqueCheckbox>
        ))}
      </div>

      <div className="bq-reg-actions">
        <BoutiqueButton type="button" variant="cancel" onClick={onBack}>
          <X size={18} weight="bold" /> Cancel
        </BoutiqueButton>
        <BoutiqueButton type="submit" disabled={!allChecked}>
          Continue <ArrowRight size={18} weight="bold" />
        </BoutiqueButton>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-reg-step { display: flex; flex-direction: column; gap: 24px; width: 100%; height: 100%; }

        .bq-reg-header { margin-bottom: 8px; }
        .bq-reg-title { font-size: 24px; font-weight: 800; margin: 0; }
        .bq-reg-desc { font-size: 15px; margin-top: 8px; opacity: 0.8; }

        .bq-reg-consent-list { display: flex; flex-direction: column; gap: 20px; }

        .bq-reg-link { color: ${BQ_COLORS.brand}; text-decoration: none; font-weight: 700; transition: all 0.2s; }
        .bq-reg-link:hover { text-decoration: underline; opacity: 0.8; }

        .bq-reg-actions { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
      `,
        }}
      />
    </form>
  );
}
