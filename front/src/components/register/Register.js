import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../../config/api";
import { useUser } from "../../context/UserContext";
import {
  detectRoleFromEmail,
  getRoleLabel,
} from "../../domain/register/detectRoleFromEmail";
import { validateRegistrationProfile } from "../../domain/register/validateRegistrationProfile";
import { BQ_COLORS } from "../common/boutique/BoutiqueTheme";

import BoutiqueAuthHeader from "../common/boutique/BoutiqueAuthHeader";
import BoutiqueAuthLayout from "../common/boutique/BoutiqueAuthLayout";
import RegisterContactStep from "./RegisterContactStep";
import RegisterEmailStep from "./RegisterEmailStep";
import RegisterLegalConsentsStep from "./RegisterLegalConsentsStep";
import RegisterLocationStep from "./RegisterLocationStep";
import RegisterProfilePasswordStep from "./RegisterProfilePasswordStep";

import {
  loadEncrypted,
  removeEncrypted,
  saveEncrypted,
} from "../../utils/secureStorage";

const STEPS = ["legal", "email", "profile", "contact", "location"];
const STORAGE_KEY = "aeropulse_register_state";

function Register() {
  const { register } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    emailVerified: false,
    alias: "",
    phone: "",
    phoneVerified: false,
    messengerHandle: "",
    messengerVerified: false,
    password: "",
    confirmPassword: "",
    registrationSecret: "",
    provisioningUri: "",
    verifiedCode: "",
    registrationToken: "",
    address: "",
    billingRegion: "",
    billingProvince: "",
    billingCity: "",
    billingBarangay: "",
    billingStreet: "",
    branch: "",
    agreeTermsWarranty: false,
    agreeTermsService: false,
    agreeTermsApp: false,
    agreePrivacyRa10173: false,
    location: {
      coordinates: {
        latitude: null,
        longitude: null,
        accuracy: null,
        timestamp: null,
      },
      address: {
        region: "",
        province: "",
        city: "",
        barangay: "",
        street: "",
        postalCode: "",
      },
      source: "manual",
    },
  });

  useEffect(() => {
    async function init() {
      // Priority 1: Backend Session
      try {
        const response = await apiRequest("/auth/session");
        if (response.session?.registrationProgress) {
          const progress = response.session.registrationProgress;
          const data = { ...progress.formData };

          if (!data.emailVerified) {
            data.email = "";
            data.registrationSecret = "";
            data.provisioningUri = "";
          }
          if (!data.phoneVerified) data.phone = "";
          if (!data.messengerVerified) data.messengerHandle = "";

          setStepIndex(progress.stepIndex || 0);
          setFormData(data);
          return;
        }
      } catch (err) {
        console.error("Failed to fetch registration session:", err);
      }

      // Priority 2: Local Storage Fallback
      const saved = await loadEncrypted(STORAGE_KEY);
      if (saved) {
        setStepIndex(saved.stepIndex || 0);
        setFormData(saved.formData);
      }
    }
    init();
  }, []);

  useEffect(() => {
    const sync = async () => {
      saveEncrypted(STORAGE_KEY, { stepIndex, formData });
      try {
        await apiRequest("/auth/session/registration", {
          method: "POST",
          body: JSON.stringify({ progress: { stepIndex, formData } }),
        });
      } catch (err) {
        // Ignore sync errors
      }
    };

    const timer = setTimeout(sync, 1000);
    return () => clearTimeout(timer);
  }, [stepIndex, formData]);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const detectedRole = useMemo(
    () => detectRoleFromEmail(formData.email),
    [formData.email],
  );
  const detectedRoleLabel = useMemo(
    () => getRoleLabel(detectedRole),
    [detectedRole],
  );

  const handleFieldChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }, []);

  const clearRegistrationSession = async () => {
    const isAnyVerified =
      formData.emailVerified ||
      formData.phoneVerified ||
      formData.messengerVerified;

    if (isAnyVerified) {
      const confirmed = window.confirm(
        "You have verified identity fields. Are you sure you want to cancel? This will clear all your progress.",
      );
      if (!confirmed) return;
    }

    removeEncrypted(STORAGE_KEY);
    try {
      await apiRequest("/auth/session/registration", {
        method: "POST",
        body: JSON.stringify({ progress: null }),
      });
    } catch (err) {
      // Ignore
    }
    navigate("/login");
  };

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const goBack = () => {
    if (stepIndex > 0) {
      setStepIndex((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleFinalSubmit = async () => {
    const { errors: vErrors, valid } = validateRegistrationProfile(
      formData,
      detectedRole,
    );
    if (!valid) {
      setErrors(vErrors);
      return;
    }

    setLoading(true);
    setSubmissionError("");

    try {
      const payload = {
        name_first: formData.firstName,
        name_last: formData.lastName,
        alias: formData.alias,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        messenger_handle: formData.messengerHandle,
        address: formData.address,
        billingAddress: {
          region: formData.billingRegion,
          province: formData.billingProvince,
          city: formData.billingCity,
          barangay: formData.billingBarangay,
          street: formData.billingStreet,
        },
        role: detectedRole,
        branch: formData.branch,
        location: formData.location,
      };

      await register(payload);
      removeEncrypted(STORAGE_KEY);
      navigate("/shop");
    } catch (err) {
      setSubmissionError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const step = STEPS[stepIndex];

  return (
    <BoutiqueAuthLayout>
      <BoutiqueAuthHeader title="Join AeroPulse">
        <div className="bq-reg-step-dots">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`bq-reg-dot ${i === stepIndex ? "active" : ""} ${i < stepIndex ? "done" : ""}`}
            />
          ))}
        </div>
      </BoutiqueAuthHeader>

      <div className="bq-reg-step-container">
        {step === "legal" && (
          <RegisterLegalConsentsStep
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
            onNext={goNext}
            onBack={clearRegistrationSession}
          />
        )}
        {step === "email" && (
          <RegisterEmailStep
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
            detectedRole={detectedRole}
            detectedRoleLabel={detectedRoleLabel}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {step === "profile" && (
          <RegisterProfilePasswordStep
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
            detectedRole={detectedRole}
            detectedRoleLabel={detectedRoleLabel}
            onNext={goNext}
            onBack={clearRegistrationSession}
          />
        )}
        {step === "contact" && (
          <RegisterContactStep
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {step === "location" && (
          <RegisterLocationStep
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
            onNext={handleFinalSubmit}
            onBack={goBack}
            loading={loading}
          />
        )}

        {submissionError && (
          <div className="bq-reg-global-error">{submissionError}</div>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .bq-reg-step-container { display: flex; flex-direction: column; }

        .bq-reg-step-dots { display: flex; gap: 8px; margin-top: 12px; }
        .bq-reg-dot { width: 8px; height: 8px; border-radius: 4px; background: ${BQ_COLORS.border}; transition: all 0.3s; }
        .bq-reg-dot.active { width: 24px; background: ${BQ_COLORS.ink}; }
        .bq-reg-dot.done { background: ${BQ_COLORS.brand}; }

        .bq-reg-global-error { margin-top: 24px; padding: 16px; background: #fffafb; border: 1.5px solid ${BQ_COLORS.danger}; border-radius: 12px; color: ${BQ_COLORS.danger}; font-size: 14px; font-weight: 700; text-align: center; }
      `,
        }}
      />
    </BoutiqueAuthLayout>
  );
}

export default Register;
