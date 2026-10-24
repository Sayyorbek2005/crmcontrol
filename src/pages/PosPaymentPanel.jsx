import { translateText as tx } from "../locales/translateText";
import { useLanguage as useUILanguage } from "../context/LanguageContext";
import React, { useState } from "react";
import { FiCheckCircle, FiShoppingCart, FiX, FiCreditCard, FiCalendar } from "react-icons/fi";
import { startsWithCapital, formatDateInputValue } from './posHelpers';

export function PaymentSuccessAnimation({ amount, remainingDebt }) {
  useUILanguage();
  return (
    <div className="pos-faceid-backdrop" role="dialog" aria-modal="true" aria-label={tx("To'lov tasdiqlanmoqda")}>
      <div className="pos-faceid-modal">
        <div className="pos-faceid-orb" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <circle className="pos-faceid-track" cx="60" cy="60" r="46" />
            <circle className="pos-faceid-scan" cx="60" cy="60" r="46" />
            <path className="pos-faceid-check" d="M38 61.5 53 76 83 44" />
          </svg>
        </div>
        <div className="pos-faceid-copy">
          <strong>{tx("To'lov qabul qilindi")}</strong>
          <span>{tx(amount.toLocaleString())}{tx(" so'm")}</span>
          {remainingDebt > 0 && <small>{tx("Qolgan qarz: ")}{tx(remainingDebt.toLocaleString())}{tx(" so'm")}</small>}
        </div>
      </div>
    </div>
  );
}

export function PosPaymentPanel({
  cart,
  total,
  paymentAmount,
  setPaymentAmount,
  method,
  setMethod,
  cardForm,
  setCardForm,
  debtDueDate,
  setDebtDueDate,
  error,
  setError,
  completed,
  paidAmount,
  onConfirm,
  onClose,
}) {
  useUILanguage();
  const [showProducts, setShowProducts] = useState(true);
  const saleTotal = Math.round(total);
  const enteredAmount = paymentAmount === ""
    ? saleTotal
    : Math.min(saleTotal, Math.max(0, Number(paymentAmount) || 0));
  const remaining = Math.max(0, saleTotal - (completed ? paidAmount : enteredAmount));
  const firstNameWarning = cardForm.firstName.trim() && !startsWithCapital(cardForm.firstName);
  const lastNameWarning = cardForm.lastName.trim() && !startsWithCapital(cardForm.lastName);
  const updateCard = (field, value) => {
    setCardForm((current) => ({ ...current, [field]: value }));
    setError("");
  };

  return (
    <section className="pos-cart-section pos-order-panel pos-payment-panel" aria-label={tx("To'lovni qabul qilish")}>
      <div className="pos-payment-header">
        <h2>{tx("To'lovni qabul qilish")}</h2>
        <button type="button" onClick={onClose} aria-label={tx("To'lov oynasini yopish")}><FiX size={18} /></button>
      </div>

      <div className="pos-payment-body">
        <div className="pos-payment-summary">
          <div className="pos-payment-products-head">
            <span className="pos-payment-icon"><FiShoppingCart size={19} /></span>
            <div><strong>{tx("Olingan tovarlar")}</strong><small>{tx(cart.length)}{tx(" ta mahsulot")}</small></div>
            <button type="button" onClick={() => setShowProducts((open) => !open)} aria-expanded={showProducts}>{tx("Batafsil ")}<span aria-hidden="true">{tx(showProducts ? "⌄" : "›")}</span>
            </button>
          </div>
          {showProducts && (
            <ol className="pos-payment-products-list">
              {cart.map((item, index) => (
                <li key={item.cartKey}>
                  <span className="pos-payment-product-index">{tx(index + 1)}.</span>
                  <span>{item.name}</span>
                  <span>{tx(item.qty)}{tx(" dona")}</span>
                  <strong>{tx((item.price * item.qty).toLocaleString())}{tx(" so'm")}</strong>
                </li>
              ))}
            </ol>
          )}
          <div className="pos-payment-totals">
            <div><span>{tx("Jami to'lov")}</span><strong>{tx(saleTotal.toLocaleString())}{tx(" so'm")}</strong></div>
            <div><span>{tx("To'langan")}</span><strong className="is-paid">{tx((completed ? paidAmount : enteredAmount).toLocaleString())}{tx(" so'm")}</strong></div>
            <div className="is-remaining"><span>{tx("Qolgan qarz")}</span><strong>{tx(remaining.toLocaleString())}{tx(" so'm")}</strong></div>
          </div>
        </div>

        <div className="pos-payment-fieldset">
          <strong>{tx("To'lovni kiriting")}</strong>
          <label className="pos-payment-amount-input">
            <input
              type="text"
              inputMode="numeric"
              value={paymentAmount ? Number(paymentAmount).toLocaleString("uz-UZ") : ""}
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, "");
                if (digits === "") setPaymentAmount("");
                else setPaymentAmount(String(Math.min(saleTotal, Math.max(0, Number(digits)))));
                setError("");
              }}
              placeholder={tx("Oldindan to'lov (ixtiyoriy)")}
              disabled={completed}
              aria-label={tx("To'lanadigan summa")}
            />
            <span>{tx("so'm")}</span>
          </label>
          <div className="pos-payment-calculation">
            <span>{tx("To'lovdan keyingi qarz")}</span>
            <strong>{tx(remaining.toLocaleString())}{tx(" so'm")}</strong>
          </div>
          <small>{tx("Bo'sh qoldirilsa, buyurtma to'liq to'langan deb saqlanadi. Qisman to'lov kiritsangiz, qolgani qarzga yoziladi.")}</small>
        </div>

        <div className="pos-payment-fieldset pos-payment-due-date">
          <strong>{tx("Qaytarish muddati")}</strong>
          <label>
            <FiCalendar size={15} aria-hidden="true" />
            <input
              type="date"
              min={formatDateInputValue(new Date())}
              value={debtDueDate}
              onChange={(event) => {
                setDebtDueDate(event.target.value);
                setError("");
              }}
              disabled={completed || remaining === 0}
              required={remaining > 0}
            />
          </label>
          <small>{tx("Qolgan qarz shu sanagacha to'lanishi kerak")}</small>
        </div>

        <div className="pos-payment-fieldset">
          <strong>{tx("To'lov usuli")}</strong>
          <div className="pos-payment-choices">
            <button type="button" className={method === "cash" ? "is-active" : ""} aria-pressed={method === "cash"} onClick={() => { setMethod("cash"); setError(""); }} disabled={completed}>{tx("Naqd")}</button>
            <button type="button" className={method === "card" ? "is-active" : ""} aria-pressed={method === "card"} onClick={() => { setMethod("card"); setError(""); }} disabled={completed}><FiCreditCard size={15} />{tx(" Karta")}</button>
          </div>
        </div>

        {method === "card" && (
          <div className="pos-payment-card-fields">
            <strong>{tx("Karta ma'lumotlari")}</strong>
            <label>{tx("Karta raqami")}<input inputMode="numeric" autoComplete="off" value={cardForm.number} onChange={(event) => updateCard("number", event.target.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "))} placeholder={tx("1234 5678 9012 3456")} disabled={completed} />
            </label>
            <div className="pos-payment-name-row">
              <label>{tx("Ism")}<input value={cardForm.firstName} onChange={(event) => updateCard("firstName", event.target.value)} placeholder={tx("Karta egasining ismi")} disabled={completed} aria-invalid={!!firstNameWarning} />
                {firstNameWarning && <span role="alert">{tx("Ism bosh harf bilan boshlanishi kerak.")}</span>}
              </label>
              <label>{tx("Familiya")}<input value={cardForm.lastName} onChange={(event) => updateCard("lastName", event.target.value)} placeholder={tx("Familiya")} disabled={completed} aria-invalid={!!lastNameWarning} />
                {lastNameWarning && <span role="alert">{tx("Familiya bosh harf bilan boshlanishi kerak.")}</span>}
              </label>
            </div>
            <p>{tx("Bu yerda bankdan pul yechilmaydi; to'lov faqat CRMga qayd etiladi. Karta raqami saqlanmaydi.")}</p>
          </div>
        )}
        {error && <p className="pos-payment-error" role="alert">{tx(error)}</p>}
      </div>

      <div className="pos-payment-footer">
        {completed ? (
          <div className="pos-payment-complete" role="status"><FiCheckCircle size={18} /><strong>{tx(paidAmount === 0 ? "Qarz qayd etildi" : "To'lov qabul qilindi")}</strong><small>{tx(paidAmount === 0 ? "Sotuv qarz sifatida saqlandi." : "To'lov muvaffaqiyatli qayd etildi.")}</small></div>
        ) : (
          <button type="button" className="pos-payment-submit" onClick={onConfirm} disabled={saleTotal <= 0}><FiCheckCircle size={18} /> {tx(enteredAmount === 0 ? "Qarzga rasmiylashtirish" : "To'lovni qabul qilish")}</button>
        )}
      </div>
    </section>
  );
}
