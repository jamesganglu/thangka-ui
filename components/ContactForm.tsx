"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function ContactForm() {
  const t = useTranslations("contact");
  const inquiryTypes = t.raw("inquiryTypes") as string[];

  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    inquiryType: inquiryTypes[0] ?? "",
    firstName: "",
    lastName: "",
    email: "",
    artworkName: "",
    referenceNo: "",
    message: "",
  });

  if (submitted) {
    return (
      <div className="form-success">
        <h3 className="form-success-title">
          {t("successTitle")}
        </h3>
        <p className="form-success-message">{t("successMessage")}</p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
      <label className="form-label">{t("inquiryType")}</label>
      <select
        value={form.inquiryType}
        onChange={(e) => setForm({ ...form, inquiryType: e.target.value })}
        className="form-field-input form-field-select"
        required
      >
        {inquiryTypes.map((type) => <option key={type} value={type}>{type}</option>)}
      </select>

      <div className="form-row-2col">
        <div>
          <label className="form-label">{t("firstName")}</label>
          <input type="text" placeholder={t("firstNamePlaceholder")} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="form-field-input" required />
        </div>
        <div>
          <label className="form-label">{t("lastName")}</label>
          <input type="text" placeholder={t("lastNamePlaceholder")} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="form-field-input" required />
        </div>
      </div>

      <label className="form-label">{t("emailAddress")}</label>
      <input type="email" placeholder={t("emailPlaceholder")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="form-field-input" required />

      <div className="form-row-2col">
        <div>
          <label className="form-label">{t("artworkName")}</label>
          <input type="text" placeholder={t("artworkNamePlaceholder")} value={form.artworkName} onChange={(e) => setForm({ ...form, artworkName: e.target.value })} className="form-field-input" />
        </div>
        <div>
          <label className="form-label">{t("referenceNo")}</label>
          <input type="text" placeholder={t("referenceNoPlaceholder")} value={form.referenceNo} onChange={(e) => setForm({ ...form, referenceNo: e.target.value })} className="form-field-input" />
        </div>
      </div>

      <label className="form-label">{t("message")}</label>
      <textarea placeholder={t("messagePlaceholder")} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className="form-field-input form-field-textarea" required />

      <p className="form-disclaimer">
        {t("disclaimer")}
      </p>

      <button type="submit" className="btn-primary">{t("submit")}</button>
    </form>
  );
}
