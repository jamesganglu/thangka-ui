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

  const inputStyle: React.CSSProperties = {
    width: "100%", border: "none", borderBottom: "1px solid #E8E3DC", background: "transparent",
    padding: "10px 0", fontFamily: "'Inter', sans-serif", fontSize: "14px", color: "#2B2520",
    outline: "none", transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Cinzel', serif", fontSize: "10px", letterSpacing: "0.12em",
    textTransform: "uppercase" as const, color: "#A9A39C", display: "block",
    marginBottom: "4px", marginTop: "20px",
  };

  if (submitted) {
    return (
      <div style={{ padding: "60px 40px", textAlign: "center", background: "#FBFAF7", border: "1px solid #E8E3DC" }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "28px", marginBottom: "12px" }}>
          {t("successTitle")}
        </h3>
        <p style={{ color: "#6F6A63", fontSize: "14px" }}>{t("successMessage")}</p>
      </div>
    );
  }

  return (
    <form style={{ background: "#FBFAF7", border: "1px solid #E8E3DC", padding: "40px" }} onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
      <label style={labelStyle}>{t("inquiryType")}</label>
      <select
        value={form.inquiryType}
        onChange={(e) => setForm({ ...form, inquiryType: e.target.value })}
        style={{ ...inputStyle, cursor: "pointer", appearance: "none" as const, backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236F6A63' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 4px center", paddingRight: "24px" }}
        required
      >
        {inquiryTypes.map((type) => <option key={type} value={type}>{type}</option>)}
      </select>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div>
          <label style={labelStyle}>{t("firstName")}</label>
          <input type="text" placeholder={t("firstNamePlaceholder")} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} style={inputStyle} required />
        </div>
        <div>
          <label style={labelStyle}>{t("lastName")}</label>
          <input type="text" placeholder={t("lastNamePlaceholder")} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} style={inputStyle} required />
        </div>
      </div>

      <label style={labelStyle}>{t("emailAddress")}</label>
      <input type="email" placeholder={t("emailPlaceholder")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} required />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <div>
          <label style={labelStyle}>{t("artworkName")}</label>
          <input type="text" placeholder={t("artworkNamePlaceholder")} value={form.artworkName} onChange={(e) => setForm({ ...form, artworkName: e.target.value })} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>{t("referenceNo")}</label>
          <input type="text" placeholder={t("referenceNoPlaceholder")} value={form.referenceNo} onChange={(e) => setForm({ ...form, referenceNo: e.target.value })} style={inputStyle} />
        </div>
      </div>

      <label style={labelStyle}>{t("message")}</label>
      <textarea placeholder={t("messagePlaceholder")} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} style={{ ...inputStyle, resize: "vertical" }} required />

      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", color: "#A9A39C", marginTop: "16px", marginBottom: "24px" }}>
        {t("disclaimer")}
      </p>

      <button type="submit" className="btn-primary">{t("submit")}</button>
    </form>
  );
}
