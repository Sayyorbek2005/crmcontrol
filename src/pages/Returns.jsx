import { translateText as tx } from "../locales/translateText";
import { useLanguage as useUILanguage } from "../context/LanguageContext";
import './Returns.css';
import { useState } from "react";
import { createPortal } from "react-dom";
import { Search, RotateCcw, AlertCircle, CheckCircle, X, Plus } from "lucide-react";
import { useToast } from "../context/ToastContext";

const reasonOptions = [
  "Nosoz / ishlamaydi",
  "Sifat muammosi",
  "Hajm/o'lcham to'g'ri kelmadi",
  "Noto'g'ri mahsulot yetkazildi",
  "Mijoz fikri o'zgardi",
  "Boshqa",
];

const statusMap = {
  approved: {
    label: "Qabul qilindi",
    bg: "var(--success-light)",
    color: "var(--success)",
    icon: CheckCircle,
  },
  pending: {
    label: "Kutilmoqda",
    bg: "var(--warning-light)",
    color: "var(--warning)",
    icon: AlertCircle,
  },
  rejected: {
    label: "Rad etildi",
    bg: "var(--danger-light)",
    color: "var(--danger)",
    icon: X,
  },
};

export default function Returns() {
  useUILanguage();
  const { success, info } = useToast();
  const [returnsList, setReturnsList] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("crm_returns") || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");

  const updateReturnStatus = (id, status) => {
    const updated = returnsList.map((item) => item.id === id ? { ...item, status } : item);
    setReturnsList(updated);
    localStorage.setItem("crm_returns", JSON.stringify(updated));
    if (status === "approved") success("Qaytarish qabul qilindi", id);
    else info("Qaytarish rad etildi", id);
  };

  const filtered = returnsList.filter(
    (r) =>
      r.customer.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase())
  );

  const totalReturned = returnsList
    .filter((r) => r.status === "approved")
    .reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary-color">{tx("Qaytarilgan mahsulotlar")}</h1>
          <p className="text-sm mt-0.5 text-muted-color">{tx("Qaytarilgan tovarlar va refund so'rovlari")}</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={15} />{tx(" Qaytarish qo'shish")}</button>
      </div>

      {/* Stats */}
      <div className="returns-stats grid grid-cols-4 gap-4">
        {[
          {
            label: "Jami qaytarishlar",
            value: returnsList.length,
            color: "var(--brand)",
          },
          {
            label: "Qabul qilingan",
            value: returnsList.filter((r) => r.status === "approved").length,
            color: "var(--success)",
          },
          {
            label: "Kutilmoqda",
            value: returnsList.filter((r) => r.status === "pending").length,
            color: "var(--warning)",
          },
          {
            label: "Umumiy Qaytarilgan summa",
            value: (totalReturned / 1000000).toFixed(2) + " mln so'm",
            color: "var(--danger)",
          },
        ].map((s) => (
          <div key={s.label} className="returns-stat-card card p-4">
            <div
              className="returns-stat-value text-xl font-display font-bold mb-1"
              style={{ color: s.color }}
            >
              {tx(s.value)}
            </div>
            <div className="returns-stat-label text-xs text-faint-color">{tx(s.label)}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="returns-table-card card-flat rounded-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b-subtle">
          <div className="search-box-wrapper flex items-center gap-2 rounded-xl px-3 py-2.5">
            <Search size={14} className="text-faint-color" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tx("Qaytarish qidirish...")}
              className="bg-transparent outline-none text-sm flex-1 text-primary-color"
            />
          </div>
        </div>

        <div className="returns-table-scroll" role="region" aria-label={tx("Qaytarishlar jadvali")} tabIndex="0">
        <table className="returns-table w-full">
          <thead>
            <tr className="table-header-row">
              {[
                "ID",
                "Sotuv",
                "Mijoz",
                "Mahsulot",
                "Sabab",
                "Summa",
                "Sana",
                "Manzil",
                "Holat",
                "",
              ].map((h, i) => (
                <th
                  key={i}
                  className="text-left px-5 py-3 text-xs font-semibold text-faint-color"
                >
                  {tx(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const st = statusMap[r.status];
              const Icon = st.icon;
              return (
                <tr key={r.id} className="border-t table-row-hover">
                  <td className="px-5 py-3.5 font-mono text-xs font-semibold text-muted-color">
                    {r.id}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-faint-color">
                    {tx(r.saleId)}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-medium text-primary-color">
                    {r.customer}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-secondary-color">
                    {r.product}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-color">
                    {tx(r.reason)}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-danger-color">
                    -{tx(r.amount.toLocaleString())}{tx(" so'm")}</td>
                  <td className="px-5 py-3.5 text-xs text-faint-color">
                    {tx(Number.isNaN(new Date(r.date).getTime()) ? r.date : new Date(r.date).toLocaleDateString("uz-UZ"))}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-color">
                    {tx(r.deliveryAddress || "—")}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold w-fit"
                      style={{
                        background: st.bg,
                        color: st.color,
                      }}
                    >
                      <Icon size={10} />
                      {tx(st.label)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {r.status === "pending" && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateReturnStatus(r.id, "approved")}
                          className="px-2 py-1 rounded-lg text-xs font-semibold action-btn-success"
                        >{tx("Qabul")}</button>
                        <button
                          onClick={() => updateReturnStatus(r.id, "rejected")}
                          className="px-2 py-1 rounded-lg text-xs font-semibold action-btn-danger"
                        >{tx("Rad")}</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* Portal orqali chiqariladigan modal */}
      {showModal &&
        createPortal(
          <div className="crm-content-modal">
            <div className="modal-card">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display font-bold text-lg text-primary-color">{tx("Qaytarish qo'shish")}</h2>
                  <p className="text-xs mt-0.5 text-muted-color">{tx("Qaytarilgan mahsulot ma'lumotlari")}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl hover:opacity-70 text-faint-color"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Sotuv ID", placeholder: "S-XXXX" },
                  { label: "Mahsulot nomi", placeholder: "Mahsulot nomi" },
                  { label: "Mijoz", placeholder: "Mijoz ismi" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-xs font-semibold mb-1.5 text-secondary-color">
                      {tx(f.label)}
                    </label>
                    <input placeholder={tx(f.placeholder)} className="input-base" />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-secondary-color">{tx("Sabab")}</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="input-base"
                  >
                    <option value="">{tx("Sabab tanlang")}</option>
                    {reasonOptions.map((o) => (
                      <option key={o} value={o}>{tx(o)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-secondary-color">{tx("Summa")}</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={tx("0")}
                    className="input-base"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-ghost flex-1"
                >{tx("Bekor qilish")}</button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    success("Qaytarish qo'shildi");
                  }}
                  className="btn-primary flex-1 justify-center"
                >
                  <RotateCcw size={14} />{tx(" Saqlash")}</button>
              </div>
            </div>
          </div>,
          document.getElementById("main-modal-root")
        )}
    </div>
  );
}
