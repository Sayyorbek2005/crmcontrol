import { styles } from './ustolarStyles';
import { translateText as tx } from "../locales/translateText";
import { useLanguage as useUILanguage } from "../context/LanguageContext";
import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Wrench,
  Plus,
  Search,
  Phone,
  Wallet,
  Edit3,
  Trash2,
  Star,
  Award,
  Sparkles,
  ShieldCheck,
  X,
  CheckCircle,
  Gift,
  AlertTriangle,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const USTALAR_STORAGE_KEY = "crm_ustalar";

const readUstalar = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(USTALAR_STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export default function Ustolar() {
  useUILanguage();
  const { dark } = useTheme();
  const modalRoot = document.getElementById("main-modal-root");

  const [ustolar, setUstolar] = useState(readUstalar);

  useEffect(() => {
    try {
      localStorage.setItem(USTALAR_STORAGE_KEY, JSON.stringify(ustolar));
    } catch {
      // Local saqlash ishlamasa, sahifa ochiq turgan paytdagi ro'yxat saqlanadi.
    }
  }, [ustolar]);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedUsta, setSelectedUsta] = useState(null);
  const [bonusAmount, setBonusAmount] = useState("");
  const [editingUsta, setEditingUsta] = useState(null);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "+998 ",
    specialty: "",
    percentage: 30,
    balance: 0,
    status: "active",
    rating: 5.0,
  });

  // ======================================================
  // THEME COLORS
  // ======================================================

  const colors = dark
    ? {
        page: "#0b0f19",
        card: "#111827",
        cardSecondary: "#0b0f19",
        border: "#1f2937",
        borderStrong: "#374151",
        text: "#f8fafc",
        textSecondary: "#cbd5e1",
        muted: "#94a3b8",
        mutedDark: "#64748b",
        input: "#0b0f19",
        header: "#1f2937",
        buttonSecondary: "#1f2937",
        modal: "#111827",
        option: "#1e293b",
      }
    : {
        page: "#f5f7fb",
        card: "#ffffff",
        cardSecondary: "#f8fafc",
        border: "#e2e8f0",
        borderStrong: "#cbd5e1",
        text: "#0f172a",
        textSecondary: "#334155",
        muted: "#64748b",
        mutedDark: "#94a3b8",
        input: "#ffffff",
        header: "#f1f5f9",
        buttonSecondary: "#f1f5f9",
        modal: "#ffffff",
        option: "#ffffff",
      };

  // ======================================================
  // TOAST
  // ======================================================

  const showToast = (message, type = "success") => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "success",
      });
    }, 3000);
  };

  // ======================================================
  // PHONE FORMAT
  // ======================================================

  const handlePhoneChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");

    if (val.startsWith("998")) {
      val = val.slice(3);
    }

    val = val.slice(0, 9);

    let formatted = "+998 ";

    if (val.length > 0) {
      formatted += val.substring(0, 2) + " ";
    }

    if (val.length > 2) {
      formatted += val.substring(2, 5) + " ";
    }

    if (val.length > 5) {
      formatted += val.substring(5, 7) + " ";
    }

    if (val.length > 7) {
      formatted += val.substring(7, 9);
    }

    setFormData({
      ...formData,
      phone: formatted.trim(),
    });
  };

  // ======================================================
  // SEARCH + FILTER
  // ======================================================

  const filteredUstolar = ustolar.filter((u) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      u.name.toLowerCase().includes(searchText) ||
      u.specialty.toLowerCase().includes(searchText) ||
      u.phone.includes(search);

    const matchesStatus =
      filterStatus === "all" ||
      u.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // ======================================================
  // OPEN ADD / EDIT MODAL
  // ======================================================

  const handleOpenModal = (usta = null) => {
    if (usta) {
      setEditingUsta(usta);

      setFormData({
        name: usta.name,
        phone: usta.phone,
        specialty: usta.specialty,
        percentage: usta.percentage,
        balance: usta.balance,
        status: usta.status,
        rating: usta.rating,
      });
    } else {
      setEditingUsta(null);

      setFormData({
        name: "",
        phone: "+998 ",
        specialty: "",
        percentage: 30,
        balance: 0,
        status: "active",
        rating: 5.0,
      });
    }

    setIsModalOpen(true);
  };

  // ======================================================
  // SAVE USTA
  // ======================================================

  const handleSave = (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      formData.phone.length < 17
    ) {
      showToast(
        "Iltimos, ism va telefon raqamini to‘liq kiriting!",
        "error"
      );
      return;
    }

    if (editingUsta) {
      setUstolar(
        ustolar.map((u) =>
          u.id === editingUsta.id
            ? {
                ...formData,
                id: u.id,
                completedWorks: u.completedWorks,
                rating: u.rating,
              }
            : u
        )
      );

      showToast(
        "Usta ma’lumotlari muvaffaqiyatli yangilandi!"
      );
    } else {
      const newUsta = {
        ...formData,
        id: Date.now(),
        completedWorks: 0,
      };

      setUstolar([newUsta, ...ustolar]);

      showToast(
        "Yangi usta muvaffaqiyatli qo‘shildi!"
      );
    }

    setIsModalOpen(false);
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleOpenDeleteModal = (usta) => {
    setSelectedUsta(usta);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedUsta) {
      setUstolar(
        ustolar.filter(
          (u) => u.id !== selectedUsta.id
        )
      );

      showToast(
        "Usta ro‘yxatdan o‘chirildi!",
        "error"
      );

      setIsDeleteModalOpen(false);
      setSelectedUsta(null);
    }
  };

  // ======================================================
  // BONUS
  // ======================================================

  const handleOpenBonusModal = (usta) => {
    setSelectedUsta(usta);
    setBonusAmount("");
    setIsBonusModalOpen(true);
  };

  const handleGiveBonus = (e) => {
    e.preventDefault();

    const amount = Number(bonusAmount);

    if (!amount || amount <= 0) {
      showToast(
        "Iltimos, to‘g‘ri bonus miqdorini kiriting!",
        "error"
      );
      return;
    }

    setUstolar(
      ustolar.map((u) =>
        u.id === selectedUsta.id
          ? {
              ...u,
              balance:
                Number(u.balance) + amount,
            }
          : u
      )
    );

    setIsBonusModalOpen(false);

    showToast(
      `${selectedUsta.name}ga ${amount.toLocaleString()} so‘m bonus qo‘shildi!`
    );
  };

  return (
    <div
      style={{
        ...styles.pageWrapper,
        backgroundColor: colors.page,
        color: colors.text,
      }}
    >
      {/* ======================================================
          TOAST
      ====================================================== */}

      <div
        style={{
          ...styles.toast,
          ...(toast.show
            ? styles.toastShow
            : {}),
          background:
            toast.type === "error"
              ? "#ef4444"
              : "#10b981",
        }}
      >
        <CheckCircle size={16} />
        <span>{tx(toast.message)}</span>
      </div>

      <div style={styles.container}>

        {/* ======================================================
            BANNER
        ====================================================== */}

        <div
          className="ustolar-banner"
          style={styles.banner}
        >
          <div style={styles.bannerContent}>
            <div style={styles.bannerBadge}>
              <Sparkles size={12} />{tx("Mutaxassislar boshqaruvi")}</div>

            <h1 style={styles.bannerTitle}>{tx("Ustalar jamoasi")}</h1>

            <p style={styles.bannerDesc}>{tx("Balans va xizmat foiz stavkalarini qulay nazorat qiling.")}</p>
          </div>

          <button
            style={styles.bannerBtn}
            onClick={() => handleOpenModal()}
          >
            <Plus size={16} />
            <span>{tx("Usta qo‘shish")}</span>
          </button>
        </div>

        {/* ======================================================
            STATS
        ====================================================== */}

        <div
          style={styles.statsGrid}
          data-ustolar-stats="true"
        >
          <div
            style={{
              ...styles.statCard,
              background: colors.card,
              borderColor: colors.border,
            }}
          >
            <div style={styles.statInfo}>
              <span
                style={{
                  ...styles.statLabel,
                  color: colors.muted,
                }}
              >{tx("Jami ustalar")}</span>

              <h2
                style={{
                  ...styles.statValue,
                  color: colors.text,
                }}
              >
                {tx(ustolar.length)}
              </h2>
            </div>

            <div
              style={{
                ...styles.statIcon,
                background:
                  "rgba(99, 102, 241, 0.15)",
                color: "#818cf8",
              }}
            >
              <Wrench size={18} />
            </div>
          </div>

          <div
            style={{
              ...styles.statCard,
              background: colors.card,
              borderColor: colors.border,
            }}
          >
            <div style={styles.statInfo}>
              <span
                style={{
                  ...styles.statLabel,
                  color: colors.muted,
                }}
              >{tx("Faol statusda")}</span>

              <h2
                style={{
                  ...styles.statValue,
                  color: colors.text,
                }}
              >
                {
                  tx(ustolar.filter(
                    (u) =>
                      u.status === "active"
                  ).length)
                }
              </h2>
            </div>

            <div
              style={{
                ...styles.statIcon,
                background:
                  "rgba(16, 185, 129, 0.15)",
                color: "#34d399",
              }}
            >
              <ShieldCheck size={18} />
            </div>
          </div>

          <div
            style={{
              ...styles.statCard,
              background: colors.card,
              borderColor: colors.border,
            }}
          >
            <div style={styles.statInfo}>
              <span
                style={{
                  ...styles.statLabel,
                  color: colors.muted,
                }}
              >{tx("Umumiy balans")}</span>

              <h2
                style={{
                  ...styles.statValue,
                  color: colors.text,
                  fontSize: "15px",
                }}
              >
                {tx(ustolar
                  .reduce(
                    (acc, u) =>
                      acc +
                      Number(u.balance),
                    0
                  )
                  .toLocaleString())}{" "}
                <span
                  style={{
                    fontSize: "10px",
                    color: colors.muted,
                  }}
                >{tx("so‘m")}</span>
              </h2>
            </div>

            <div
              style={{
                ...styles.statIcon,
                background:
                  "rgba(168, 85, 247, 0.15)",
                color: "#c084fc",
              }}
            >
              <Wallet size={18} />
            </div>
          </div>
        </div>

        {/* ======================================================
            SEARCH
        ====================================================== */}

        <div
          style={{
            ...styles.filterCard,
            background: colors.card,
            borderColor: colors.border,
          }}
        >
          <div style={styles.searchBox}>
            <Search
              size={16}
              style={styles.searchIcon}
            />

            <input
              type="text"
              placeholder={tx("Ism yoki telefon qidirish...")}
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              style={{
                ...styles.searchInput,
                backgroundColor:
                  colors.input,
                borderColor:
                  colors.borderStrong,
                color: colors.text,
              }}
            />
          </div>

          <div
            style={styles.filterBtnsWrapper}
          >
            <button
              style={{
                ...styles.filterBtn,
                background:
                  filterStatus === "all"
                    ? "#6366f1"
                    : colors.cardSecondary,
                color:
                  filterStatus === "all"
                    ? "#fff"
                    : colors.muted,
                borderColor:
                  filterStatus === "all"
                    ? "#6366f1"
                    : colors.borderStrong,
              }}
              onClick={() =>
                setFilterStatus("all")
              }
            >{tx("Barchasi")}</button>

            <button
              style={{
                ...styles.filterBtn,
                background:
                  filterStatus === "active"
                    ? "#059669"
                    : colors.cardSecondary,
                color:
                  filterStatus === "active"
                    ? "#fff"
                    : colors.muted,
                borderColor:
                  filterStatus === "active"
                    ? "#059669"
                    : colors.borderStrong,
              }}
              onClick={() =>
                setFilterStatus("active")
              }
            >{tx("Faol")}</button>

            <button
              style={{
                ...styles.filterBtn,
                background:
                  filterStatus === "inactive"
                    ? "#dc2626"
                    : colors.cardSecondary,
                color:
                  filterStatus === "inactive"
                    ? "#fff"
                    : colors.muted,
                borderColor:
                  filterStatus === "inactive"
                    ? "#dc2626"
                    : colors.borderStrong,
              }}
              onClick={() =>
                setFilterStatus("inactive")
              }
            >{tx("Nofaol")}</button>
          </div>
        </div>

        {/* ======================================================
            CARDS
        ====================================================== */}

        <div
          style={styles.grid}
          data-ustolar-grid="true"
        >
          {filteredUstolar.length > 0 ? (
            filteredUstolar.map((usta) => (
              <div
                key={usta.id}
                style={{
                  ...styles.card,
                  background: colors.card,
                  borderColor: colors.border,
                }}
              >
                {/* CARD HEADER */}

                <div
                  style={{
                    ...styles.cardHeader,
                    background: dark
                      ? "linear-gradient(135deg, #1f2937 0%, #111827 100%)"
                      : "linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%)",
                    borderColor: colors.border,
                  }}
                >
                  <div
                    style={{
                      ...styles.avatar,
                      background: dark
                        ? "#374151"
                        : "#e0e7ff",
                      color: dark
                        ? "#f8fafc"
                        : "#4f46e5",
                      borderColor:
                        colors.card,
                    }}
                  >
                    {tx(usta.name.charAt(0))}
                  </div>

                  <div style={styles.ratingBadge}>
                    <Star
                      size={10}
                      style={{
                        fill: "#fbbf24",
                        color: "#fbbf24",
                      }}
                    />

                    <span>
                      {tx(usta.rating || "5.0")}
                    </span>
                  </div>

                  <div>
                    {usta.status ===
                    "active" ? (
                      <span
                        style={
                          styles.badgeActive
                        }
                      >{tx("Faol")}</span>
                    ) : (
                      <span
                        style={
                          styles.badgeInactive
                        }
                      >{tx("Nofaol")}</span>
                    )}
                  </div>
                </div>

                {/* CARD BODY */}

                <div style={styles.cardBody}>
                  <div>
                    <h3
                      style={{
                        ...styles.ustaName,
                        color: colors.text,
                      }}
                    >
                      {usta.name}
                    </h3>

                    <p
                      style={
                        styles.ustaSpecialty
                      }
                    >
                      <Award size={12} />
                      {tx(usta.specialty ||
                        "Mutaxassislik yo‘q")}
                    </p>

                    <p
                      style={{
                        ...styles.ustaPhone,
                        color: colors.muted,
                      }}
                    >
                      <Phone size={11} />
                      {usta.phone}
                    </p>
                  </div>

                  {/* METRICS */}

                  <div
                    style={{
                      ...styles.metricsGrid,
                      background:
                        colors.cardSecondary,
                      borderColor:
                        colors.border,
                    }}
                  >
                    <div
                      style={
                        styles.metricItem
                      }
                    >
                      <span
                        style={{
                          ...styles.metricTitle,
                          color:
                            colors.mutedDark,
                        }}
                      >{tx("Foiz")}</span>

                      <strong
                        style={
                          styles.metricValue
                        }
                      >
                        {tx(usta.percentage)}%
                      </strong>
                    </div>

                    <div
                      style={
                        styles.metricItem
                      }
                    >
                      <span
                        style={{
                          ...styles.metricTitle,
                          color:
                            colors.mutedDark,
                        }}
                      >{tx("Ishlar")}</span>

                      <strong
                        style={{
                          ...styles.metricValue,
                          color: colors.text,
                        }}
                      >
                        {tx(usta.completedWorks)}{tx(" ta")}</strong>
                    </div>
                  </div>

                  {/* FOOTER */}

                  <div
                    style={{
                      ...styles.cardFooter,
                      borderColor:
                        colors.border,
                    }}
                  >
                    <div>
                      <span
                        style={{
                          ...styles.metricTitle,
                          color:
                            colors.mutedDark,
                        }}
                      >{tx("Balans")}</span>

                      <strong
                        style={{
                          ...styles.metricValue,
                          fontSize: "13px",
                          color:
                            usta.balance < 0
                              ? "#f87171"
                              : colors.text,
                        }}
                      >
                        {tx(Number(
                          usta.balance
                        ).toLocaleString())}{" "}{tx("so‘m")}</strong>
                    </div>

                    <div
                      style={
                        styles.actionBtns
                      }
                    >
                      {/* BONUS */}

                      <button
                        style={{
                          ...styles.iconBtn,
                          color: "#c084fc",
                          borderColor:
                            "rgba(168, 85, 247, 0.3)",
                          background:
                            "rgba(168, 85, 247, 0.1)",
                        }}
                        onClick={() =>
                          handleOpenBonusModal(
                            usta
                          )
                        }
                        title={tx("Bonus qo‘shish")}
                      >
                        <Gift size={14} />
                      </button>

                      {/* EDIT */}

                      <button
                        style={{
                          ...styles.iconBtn,
                          color: dark
                            ? "#94a3b8"
                            : "#475569",
                          borderColor:
                            colors.borderStrong,
                          background:
                            colors.cardSecondary,
                        }}
                        onClick={() =>
                          handleOpenModal(
                            usta
                          )
                        }
                        title={tx("Tahrirlash")}
                      >
                        <Edit3 size={14} />
                      </button>

                      {/* DELETE */}

                      <button
                        style={{
                          ...styles.iconBtn,
                          color: "#f87171",
                          borderColor:
                            "rgba(248, 113, 113, 0.3)",
                          background:
                            "rgba(248, 113, 113, 0.1)",
                        }}
                        onClick={() =>
                          handleOpenDeleteModal(
                            usta
                          )
                        }
                        title={tx("O‘chirish")}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div
              style={{
                ...styles.emptyState,
                background: colors.card,
                borderColor: colors.border,
              }}
            >
              <Wrench
                size={32}
                style={{
                  color: colors.mutedDark,
                  marginBottom: "6px",
                }}
              />

              <p
                style={{
                  color: colors.muted,
                  fontSize: "13px",
                  fontWeight: 500,
                  margin: 0,
                }}
              >{tx("Hech qanday usta topilmadi.")}</p>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================
          ADD / EDIT MODAL
      ====================================================== */}

      {isModalOpen && modalRoot && createPortal(
        <div
          className="crm-content-modal"
          style={styles.modalOverlay}
          onClick={() =>
            setIsModalOpen(false)
          }
        >
          <div
            style={{
              ...styles.modalContent,
              background: colors.modal,
              borderColor: colors.border,
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              style={{
                ...styles.modalClose,
                background:
                  colors.buttonSecondary,
                color: colors.muted,
              }}
              onClick={() =>
                setIsModalOpen(false)
              }
            >
              <X size={16} />
            </button>

            <h2
              style={{
                ...styles.modalTitle,
                color: colors.text,
              }}
            >
              {tx(editingUsta
                ? "Ustani tahrirlash"
                : "Yangi usta qo‘shish")}
            </h2>

            <p
              style={{
                ...styles.modalSub,
                color: colors.muted,
              }}
            >{tx("Ma’lumotlarni to‘ldiring va saqlang.")}</p>

            <form
              onSubmit={handleSave}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div>
                <label
                  style={{
                    ...styles.label,
                    color:
                      colors.textSecondary,
                  }}
                >{tx("F.I.O. (ismi)")}</label>

                <input
                  type="text"
                  required
                  placeholder={tx("Masalan: Sardor Rahimov")}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  style={{
                    ...styles.input,
                    background:
                      colors.input,
                    borderColor:
                      colors.borderStrong,
                    color: colors.text,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    ...styles.label,
                    color:
                      colors.textSecondary,
                  }}
                >{tx("Telefon raqami")}</label>

                <input
                  type="text"
                  required
                  maxLength="17"
                  placeholder={tx("+998 90 123 45 67")}
                  value={formData.phone}
                  onChange={
                    handlePhoneChange
                  }
                  style={{
                    ...styles.input,
                    background:
                      colors.input,
                    borderColor:
                      colors.borderStrong,
                    color: colors.text,
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    ...styles.label,
                    color:
                      colors.textSecondary,
                  }}
                >{tx("Mutaxassisligi")}</label>

                <input
                  type="text"
                  placeholder={tx("Masalan: Mebel ustasi")}
                  value={formData.specialty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specialty:
                        e.target.value,
                    })
                  }
                  style={{
                    ...styles.input,
                    background:
                      colors.input,
                    borderColor:
                      colors.borderStrong,
                    color: colors.text,
                  }}
                />
              </div>

              <div
                style={
                  styles.twoColumns
                }
              >
                <div>
                  <label
                    style={{
                      ...styles.label,
                      color:
                        colors.textSecondary,
                    }}
                  >{tx("Foiz (%)")}</label>

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={
                      formData.percentage
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        percentage:
                          Number(
                            e.target.value
                          ),
                      })
                    }
                    style={{
                      ...styles.input,
                      background:
                        colors.input,
                      borderColor:
                        colors.borderStrong,
                      color: colors.text,
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      ...styles.label,
                      color:
                        colors.textSecondary,
                    }}
                  >{tx("Balans (so‘m)")}</label>

                  <input
                    type="number"
                    value={
                      formData.balance
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        balance:
                          Number(
                            e.target.value
                          ),
                      })
                    }
                    style={{
                      ...styles.input,
                      background:
                        colors.input,
                      borderColor:
                        colors.borderStrong,
                      color: colors.text,
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    ...styles.label,
                    color:
                      colors.textSecondary,
                  }}
                >{tx("Status")}</label>

                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status:
                        e.target.value,
                    })
                  }
                  style={{
                    ...styles.input,
                    background:
                      colors.input,
                    borderColor:
                      colors.borderStrong,
                    color: colors.text,
                  }}
                >
                  <option
                    value="active"
                    style={{
                      background:
                        colors.option,
                      color:
                        colors.text,
                    }}
                  >{tx("Faol")}</option>

                  <option
                    value="inactive"
                    style={{
                      background:
                        colors.option,
                      color:
                        colors.text,
                    }}
                  >{tx("Nofaol")}</option>
                </select>
              </div>

              <div
                style={
                  styles.modalButtons
                }
              >
                <button
                  type="button"
                  style={{
                    ...styles.btnCancel,
                    background:
                      colors.buttonSecondary,
                    borderColor:
                      colors.borderStrong,
                    color:
                      colors.textSecondary,
                  }}
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                >{tx("Bekor qilish")}</button>

                <button
                  type="submit"
                  style={
                    styles.btnSubmit
                  }
                >{tx("Saqlash")}</button>
              </div>
            </form>
          </div>
        </div>
      , modalRoot)}

      {/* ======================================================
          BONUS MODAL
      ====================================================== */}

      {isBonusModalOpen && modalRoot && createPortal(
        <div
          className="crm-content-modal"
          style={styles.modalOverlay}
          onClick={() =>
            setIsBonusModalOpen(false)
          }
        >
          <div
            style={{
              ...styles.modalContent,
              background: colors.modal,
              borderColor: colors.border,
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              style={{
                ...styles.modalClose,
                background:
                  colors.buttonSecondary,
                color: colors.muted,
              }}
              onClick={() =>
                setIsBonusModalOpen(false)
              }
            >
              <X size={16} />
            </button>

            <h2
              style={{
                ...styles.modalTitle,
                color: colors.text,
              }}
            >{tx("Bonus berish")}</h2>

            <p
              style={{
                ...styles.modalSub,
                color: colors.muted,
              }}
            >
              <b>{selectedUsta?.name}</b>{" "}{tx("balansiga qo‘shimcha bonus qo‘shish.")}</p>

            <form
              onSubmit={handleGiveBonus}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div>
                <label
                  style={{
                    ...styles.label,
                    color:
                      colors.textSecondary,
                  }}
                >{tx("Bonus miqdori (so‘m)")}</label>

                <input
                  type="number"
                  min="1"
                  required
                  placeholder={tx("Masalan: 100000")}
                  value={bonusAmount}
                  onChange={(e) =>
                    setBonusAmount(
                      e.target.value
                    )
                  }
                  style={{
                    ...styles.input,
                    background:
                      colors.input,
                    borderColor:
                      colors.borderStrong,
                    color: colors.text,
                  }}
                />
              </div>

              <div
                style={
                  styles.modalButtons
                }
              >
                <button
                  type="button"
                  style={{
                    ...styles.btnCancel,
                    background:
                      colors.buttonSecondary,
                    borderColor:
                      colors.borderStrong,
                    color:
                      colors.textSecondary,
                  }}
                  onClick={() =>
                    setIsBonusModalOpen(
                      false
                    )
                  }
                >{tx("Bekor qilish")}</button>

                <button
                  type="submit"
                  style={{
                    ...styles.btnSubmit,
                    background: "#8b5cf6",
                  }}
                >{tx("Bonus qo‘shish")}</button>
              </div>
            </form>
          </div>
        </div>
      , modalRoot)}

      {/* ======================================================
          DELETE MODAL
      ====================================================== */}

      {isDeleteModalOpen && modalRoot && createPortal(
        <div
          className="crm-content-modal"
          style={styles.modalOverlay}
          onClick={() =>
            setIsDeleteModalOpen(false)
          }
        >
          <div
            style={{
              ...styles.modalContent,
              background: colors.modal,
              borderColor: colors.border,
              textAlign: "center",
              maxWidth: "320px",
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div
              style={
                styles.deleteIconBox
              }
            >
              <AlertTriangle
                size={24}
                color="#f87171"
              />
            </div>

            <h2
              style={{
                ...styles.modalTitle,
                color: colors.text,
                marginBottom: "6px",
              }}
            >{tx("Ustani o‘chirish")}</h2>

            <p
              style={{
                ...styles.modalSub,
                color: colors.muted,
                marginBottom: "16px",
              }}
            >
              <b>{selectedUsta?.name}</b>{" "}{tx("ni ro‘yxatdan o‘chirmoqchimisiz? Bu amalni ortga qaytarib bo‘lmaydi.")}</p>

            <div
              style={{
                display: "flex",
                gap: "8px",
              }}
            >
              <button
                type="button"
                style={{
                  ...styles.btnCancel,
                  background:
                    colors.buttonSecondary,
                  borderColor:
                    colors.borderStrong,
                  color:
                    colors.textSecondary,
                }}
                onClick={() =>
                  setIsDeleteModalOpen(
                    false
                  )
                }
              >{tx("Yo‘q")}</button>

              <button
                type="button"
                style={{
                  ...styles.btnSubmit,
                  background: "#ef4444",
                }}
                onClick={
                  handleConfirmDelete
                }
              >{tx("Ha, o‘chirish")}</button>
            </div>
          </div>
        </div>
      , modalRoot)}
    </div>
  );
}

// ======================================================
// STYLES
// ======================================================

// ======================================================
// RESPONSIVE
// ======================================================

if (
  typeof window !== "undefined" &&
  !document.getElementById(
    "ustolar-responsive-style"
  )
) {
  const mediaStyle =
    document.createElement("style");

  mediaStyle.id =
    "ustolar-responsive-style";

  mediaStyle.innerHTML = `
    /* =========================================
       TABLET
    ========================================= */

    @media (min-width: 640px) {
      div[data-ustolar-grid="true"] {
        grid-template-columns:
          repeat(2, minmax(0, 1fr)) !important;
      }

      div[data-ustolar-stats="true"] {
        grid-template-columns:
          repeat(3, minmax(0, 1fr)) !important;
      }

      .ustolar-banner {
        flex-direction: row !important;
        align-items: center !important;
        justify-content: space-between !important;
      }

      .ustolar-banner button {
        align-self: center !important;
        flex-shrink: 0 !important;
      }
    }

    /* =========================================
       DESKTOP
    ========================================= */

    @media (min-width: 1024px) {
      div[data-ustolar-grid="true"] {
        grid-template-columns:
          repeat(3, minmax(0, 1fr)) !important;
      }
    }

    /* =========================================
       KICHIK TELEFON
    ========================================= */

    @media (max-width: 420px) {
      .ustolar-two-columns {
        grid-template-columns: 1fr !important;
      }

      .ustolar-banner {
        gap: 10px !important;
      }

      .ustolar-banner button {
        width: 100% !important;
      }

      div[data-ustolar-stats="true"] {
        grid-template-columns: 1fr !important;
      }
    }
  `;

  document.head.appendChild(mediaStyle);
}
