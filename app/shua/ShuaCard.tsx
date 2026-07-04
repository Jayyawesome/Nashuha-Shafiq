"use client";

import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarBlank,
  CaretLeft,
  CaretRight,
  Clock,
  EnvelopeSimple,
  Gift,
  MapPin,
  MusicNotes,
  NavigationArrow,
  Pause,
  Phone,
  Play,
  WhatsappLogo,
  X,
} from "@phosphor-icons/react";
import { buildYouTubeControllerUrl } from "@/src/lib/music";
import {
  PersistentYouTubePlayer,
  type YouTubeControllerHandle,
  type YouTubePlaybackState,
} from "@/src/components/preview/PersistentYouTubePlayer";
import { attendanceOptions, seedWishes, type AttendanceStatus, type RsvpSubmission } from "@/src/lib/rsvp";
import styles from "./page.module.css";

type DockPanel = "time" | "location" | "rsvp" | "gift" | "contact" | "music";
type CountdownParts = { days: number; hours: number; minutes: number; seconds: number };
type RsvpFormState = { name: string; attendance: AttendanceStatus; pax: number; phone: string; wish: string };

const musicUrl = "https://youtu.be/ZeFpigRaXbI?si=HgKqlOVWbGeV0twY";
const musicStartAt = "01:53";
const eventDateTime = "2026-08-22T12:00:00+08:00";

const designAssets = {
  opening: "/templates/shua/uploaded-design/Opening%20Gate%20Background.png",
  main: "/templates/shua/uploaded-design/Main%20Page.png",
  backgroundSecond: "/templates/shua/uploaded-design/Background%20Second%20Page.png",
  backgroundLast: "/templates/shua/uploaded-design/Background%20Last%20page.png",
};

const eventDetails = {
  title: "Majlis Perkahwinan Nashuha & Shafiq",
  dateISO: "2026-08-22",
  dateLabel: "Sabtu, 22 Ogos 2026",
  startTime: "12:00",
  endTime: "16:00",
  timeLabel: "12 tengah hari - 4 petang",
  venueName: "Kulim Golf Resort & Country",
  venueAddress: "Persiaran Kulim Golf, Kulim Hi-Tech Park, 09000 Kulim, Kedah",
};

const contacts = [
  { name: "Sarina", relation: "Ibu", phone: "0194778469" },
  { name: "Jeffri", relation: "Bapa", phone: "0135895304" },
  { name: "Syazwani", relation: "Kakak", phone: "0194013804" },
];

const giftDetails = {
  title: "Money Gift",
  recipient: "Fatin Nashuha Binti Jeffri",
  bank: "Maklumat akaun akan dikemaskini",
  note: "Untuk hadiah atau pertanyaan, sila hubungi pihak keluarga melalui WhatsApp.",
};

const galleryImages = [
  { src: designAssets.opening, label: "Bukaan", alt: "Latar pembukaan kad perkahwinan Nashuha dan Shafiq." },
  { src: designAssets.main, label: "Kad Utama", alt: "Kad utama perkahwinan Nashuha dan Shafiq." },
  { src: designAssets.backgroundSecond, label: "Jemputan", alt: "Latar jemputan kedua dengan hiasan bunga." },
  { src: designAssets.backgroundLast, label: "Penutup", alt: "Latar penutup kad perkahwinan Nashuha dan Shafiq." },
];

const initialForm: RsvpFormState = {
  name: "",
  attendance: "Hadir",
  pax: 1,
  phone: "",
  wish: "",
};

function malaysiaPhoneLinks(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const international = digits.startsWith("0") ? `60${digits.slice(1)}` : digits;
  return {
    tel: `tel:+${international}`,
    whatsapp: `https://wa.me/${international}`,
  };
}

function calendarDetails() {
  const date = eventDetails.dateISO.replaceAll("-", "");
  const start = eventDetails.startTime.replace(":", "") + "00";
  const end = eventDetails.endTime.replace(":", "") + "00";
  const location = `${eventDetails.venueName}, ${eventDetails.venueAddress}`;
  const google = new URL("https://calendar.google.com/calendar/render");
  google.searchParams.set("action", "TEMPLATE");
  google.searchParams.set("text", eventDetails.title);
  google.searchParams.set("dates", `${date}T${start}/${date}T${end}`);
  google.searchParams.set("location", location);
  google.searchParams.set("details", "Jemputan perkahwinan Fatin Nashuha Binti Jeffri dan Mohamad Shafiq Bin Mohd Shakri.");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${date}T${start}`,
    `DTEND:${date}T${end}`,
    `SUMMARY:${eventDetails.title}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return { google: google.toString(), ics };
}

function downloadCalendar() {
  const { ics } = calendarDetails();
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "nashuha-shafiq.ics";
  anchor.click();
  URL.revokeObjectURL(url);
}

function mapLinks() {
  const query = encodeURIComponent(`${eventDetails.venueName}, ${eventDetails.venueAddress}`);
  return {
    google: `https://www.google.com/maps/search/?api=1&query=${query}`,
    waze: `https://waze.com/ul?q=${query}&navigate=yes`,
  };
}

function getCountdownParts(): CountdownParts {
  const remaining = Math.max(0, new Date(eventDateTime).getTime() - Date.now());
  const secondsTotal = Math.floor(remaining / 1000);
  return {
    days: Math.floor(secondsTotal / 86400),
    hours: Math.floor((secondsTotal % 86400) / 3600),
    minutes: Math.floor((secondsTotal % 3600) / 60),
    seconds: secondsTotal % 60,
  };
}

function formatTwoDigits(value: number) {
  return String(value).padStart(2, "0");
}

export function ShuaCard() {
  const [active, setActive] = useState<DockPanel | null>(null);
  const [opened, setOpened] = useState(false);
  const [musicState, setMusicState] = useState<YouTubePlaybackState>("loading");
  const [countdown, setCountdown] = useState<CountdownParts>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [wishes, setWishes] = useState<RsvpSubmission[]>(seedWishes);
  const [rsvpForm, setRsvpForm] = useState<RsvpFormState>(initialForm);
  const [rsvpStatus, setRsvpStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const playerRef = useRef<YouTubeControllerHandle>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const validMusic = useMemo(() => Boolean(buildYouTubeControllerUrl(musicUrl, musicStartAt, "")), []);
  const links = useMemo(() => mapLinks(), []);

  const closeSheet = useCallback(() => {
    setActive(null);
    requestAnimationFrame(() => lastTrigger.current?.focus());
  }, []);

  const openSheet = (panel: DockPanel, trigger: HTMLButtonElement) => {
    lastTrigger.current = trigger;
    setActive((current) => (current === panel ? null : panel));
  };

  const openInvitation = () => {
    setOpened(true);
    playerRef.current?.play();
  };

  const updateRsvpForm = (patch: Partial<RsvpFormState>) => {
    setRsvpForm((current) => ({ ...current, ...patch }));
  };

  const submitRsvp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRsvpStatus("");
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rsvpForm),
      });
      const result = (await response.json()) as { submission?: RsvpSubmission; submissions?: RsvpSubmission[]; error?: string };
      if (!response.ok || result.error) throw new Error(result.error || "RSVP tidak dapat dihantar.");
      if (result.submissions?.length) setWishes(result.submissions);
      else if (result.submission) setWishes((current) => [result.submission as RsvpSubmission, ...current].slice(0, 8));
      setRsvpForm(initialForm);
      setRsvpStatus("Terima kasih. RSVP anda telah disimpan ke Excel.");
    } catch (error) {
      setRsvpStatus(error instanceof Error ? error.message : "RSVP tidak dapat dihantar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setCountdown(getCountdownParts());
    const timer = window.setInterval(() => setCountdown(getCountdownParts()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/rsvp", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((result: { submissions?: RsvpSubmission[] } | null) => {
        if (!cancelled && result?.submissions?.length) setWishes(result.submissions);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSheet();
    };
    window.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(() => sheetRef.current?.focus());
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active, closeSheet]);

  const trapFocus = (event: React.KeyboardEvent) => {
    if (event.key !== "Tab" || !sheetRef.current) return;
    const focusable = Array.from(
      sheetRef.current.querySelectorAll<HTMLElement>(
        'button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),select:not(:disabled)',
      ),
    );
    if (!focusable.length) return;
    if (event.shiftKey && document.activeElement === focusable[0]) {
      event.preventDefault();
      focusable.at(-1)?.focus();
    } else if (!event.shiftKey && document.activeElement === focusable.at(-1)) {
      event.preventDefault();
      focusable[0].focus();
    }
  };

  return (
    <main className={styles.page} id="main-content">
      <div className={styles.deviceShell}>
        <div className={styles.deviceCore}>
          <PersistentYouTubePlayer
            ref={playerRef}
            youtubeUrl={musicUrl}
            startAt={musicStartAt}
            endAt=""
            onStateChange={setMusicState}
          />

          <article className={styles.card} aria-label="Kad jemputan perkahwinan Nashuha dan Shafiq">
            <section className={styles.openingPage} data-opened={opened} aria-labelledby="shua-opening-title">
              <img
                className={`${styles.fullImage} ${styles.openingRevealImage}`}
                src={designAssets.main}
                width={1080}
                height={1920}
                alt=""
                aria-hidden="true"
              />
              <div className={styles.gatePanels} aria-hidden="true">
                <span className={`${styles.gatePanel} ${styles.gateLeft}`} />
                <span className={`${styles.gatePanel} ${styles.gateRight}`} />
              </div>
              <div className={styles.openingContent}>
                <div className={styles.openingSeal}>
                  <h1 id="shua-opening-title">
                    <span>Nashuha</span>
                    <span aria-hidden="true">&amp;</span>
                    <span>Shafiq</span>
                  </h1>
                </div>
                <button type="button" className={styles.openButton} data-opened={opened} onClick={openInvitation}>
                  {opened ? "View Invitation" : "Open The Invitation"}
                </button>
              </div>
            </section>

            {opened ? (
              <>
                <section className={styles.invitationTextPage} aria-labelledby="shua-detail-title">
                  <img className={styles.fullImage} src={designAssets.backgroundSecond} width={1080} height={1920} alt="" aria-hidden="true" />
                  <InvitationCopy />
                </section>

                <section className={styles.eventFlowPage} aria-labelledby="shua-flow-title">
                  <img className={styles.fullImage} src={designAssets.backgroundSecond} width={1080} height={1920} alt="" aria-hidden="true" />
                  <div className={styles.flowContent}>
                    <h2 id="shua-flow-title" className={styles.flowTitle}>
                      Butiran Majlis
                    </h2>

                    <section className={styles.kadSection} aria-labelledby="shua-time-title">
                      <p id="shua-time-title" className={styles.sectionLabel}>
                        Tarikh &amp; Masa
                      </p>
                      <strong>{eventDetails.dateLabel}</strong>
                      <span>{eventDetails.timeLabel}</span>
                    </section>

                    <section className={`${styles.kadSection} ${styles.eventCard}`} aria-labelledby="shua-location-title">
                      <p id="shua-location-title" className={styles.sectionLabel}>
                        Lokasi
                      </p>
                      <h3>{eventDetails.venueName}</h3>
                      <span>{eventDetails.venueAddress}</span>
                    </section>

                    <section className={`${styles.kadSection} ${styles.countdownSection}`} aria-labelledby="shua-countdown-title">
                      <p id="shua-countdown-title" className={styles.sectionLabel}>
                        Countdown
                      </p>
                      <CountdownView countdown={countdown} />
                    </section>

                    <section className={`${styles.kadSection} ${styles.gallerySection}`} aria-labelledby="shua-gallery-title">
                      <p id="shua-gallery-title" className={styles.sectionLabel}>
                        Galeri
                      </p>
                      <HorizontalImageStack />
                    </section>

                    <WishesPreview wishes={wishes} headingId="shua-wishes-title" />
                  </div>
                </section>

                <section className={styles.closingPage} aria-labelledby="shua-rsvp-preview-title">
                  <img className={styles.fullImage} src={designAssets.backgroundLast} width={1080} height={1920} alt="" aria-hidden="true" />
                  <div className={styles.closingContent}>
                    <p className={styles.sectionEyebrow}>Kehadiran anda amat bermakna</p>
                    <h2 id="shua-rsvp-preview-title">RSVP &amp; Gift</h2>
                    <p>
                      Sahkan kehadiran dan tinggalkan ucapan. Ucapan terbaru akan dipaparkan di kad ini dan disimpan ke Excel.
                    </p>
                    <div className={styles.closingGrid}>
                      <button type="button" className={styles.inlineAction} onClick={(event) => openSheet("rsvp", event.currentTarget)}>
                        <EnvelopeSimple size={18} weight="light" /> RSVP
                      </button>
                      <button type="button" className={styles.inlineAction} onClick={(event) => openSheet("gift", event.currentTarget)}>
                        <Gift size={18} weight="light" /> Gift
                      </button>
                    </div>
                  </div>
                </section>
              </>
            ) : null}
          </article>

          {active && opened ? (
            <div className={styles.sheetBackdrop} onPointerDown={(event) => event.target === event.currentTarget && closeSheet()}>
              <section
                id="shua-action-sheet"
                ref={sheetRef}
                className={styles.sheet}
                role="dialog"
                aria-modal="true"
                aria-label={sheetTitle(active)}
                tabIndex={-1}
                onKeyDown={trapFocus}
                onPointerDown={(event) => event.stopPropagation()}
              >
                <header className={styles.sheetHeader}>
                  <div>
                    <small>Jemputan</small>
                    <h2>{sheetTitle(active)}</h2>
                  </div>
                  <button className={styles.sheetClose} type="button" aria-label={`Tutup ${sheetTitle(active)}`} onClick={closeSheet}>
                    <X size={18} weight="light" />
                  </button>
                </header>
                <SheetContent
                  active={active}
                  musicState={musicState}
                  onMusicPlay={() => playerRef.current?.play()}
                  onMusicPause={() => playerRef.current?.pause()}
                  googleMap={links.google}
                  waze={links.waze}
                  rsvpForm={rsvpForm}
                  rsvpStatus={rsvpStatus}
                  isSubmitting={isSubmitting}
                  updateRsvpForm={updateRsvpForm}
                  submitRsvp={submitRsvp}
                  wishes={wishes}
                />
              </section>
            </div>
          ) : null}

          {opened && validMusic ? (
            <button
              ref={active === "music" ? lastTrigger : undefined}
              className={`${styles.musicDock} ${active === "music" ? styles.activeDock : ""}`}
              type="button"
              aria-label="Lagu"
              aria-expanded={active === "music"}
              aria-controls="shua-action-sheet"
              onClick={(event) => openSheet("music", event.currentTarget)}
            >
              <MusicNotes size={22} weight="fill" />
            </button>
          ) : null}

          {opened ? (
            <nav className={styles.dock} aria-label="Menu jemputan">
              <DockButton active={active === "time"} icon={<Clock size={18} weight="light" />} label="Masa" onClick={(event) => openSheet("time", event.currentTarget)} />
              <DockButton active={active === "location"} icon={<MapPin size={18} weight="light" />} label="Lokasi" onClick={(event) => openSheet("location", event.currentTarget)} />
              <DockButton active={active === "rsvp"} icon={<EnvelopeSimple size={18} weight="light" />} label="RSVP" onClick={(event) => openSheet("rsvp", event.currentTarget)} />
              <DockButton active={active === "gift"} icon={<Gift size={18} weight="light" />} label="Gift" onClick={(event) => openSheet("gift", event.currentTarget)} />
              <DockButton active={active === "contact"} icon={<Phone size={18} weight="light" />} label="Hubungi" onClick={(event) => openSheet("contact", event.currentTarget)} />
            </nav>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function sheetTitle(active: DockPanel) {
  if (active === "time") return "Tarikh & Masa";
  if (active === "location") return "Lokasi Majlis";
  if (active === "rsvp") return "RSVP";
  if (active === "gift") return "Gift";
  if (active === "contact") return "Hubungi Kami";
  return "Lagu Pilihan";
}

function DockButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button
      type="button"
      className={active ? styles.activeDock : ""}
      aria-expanded={active}
      aria-controls="shua-action-sheet"
      onClick={onClick}
    >
      {icon}
      <small>{label}</small>
    </button>
  );
}

function InvitationCopy() {
  return (
    <div className={styles.invitationPanel}>
      <p className={styles.hostNames}>
        <span>Jeffri Bin Mat Jaafar</span>
        <span>&amp;</span>
        <span>Sarina Binti Mat Din @ Samsudin</span>
      </p>
      <h2 id="shua-detail-title">Walimatulurus</h2>
      <p className={styles.invitePoem}>
        Setepak sirih, sekacip pinang, semekar senyuman, seikhlas hati
        <br />
        Dengan penuh kesyukuran ke hadrat Ilahi
      </p>
      <p className={styles.guestInvite}>Mengundang Dato&apos; / Datin / Tuan / Puan / Encik / Cik</p>
      <p className={styles.guestDots}>.......................................................................................................................</p>
      <p className={styles.inviteNote}>ke majlis perkahwinan anakanda kami</p>
      <p className={styles.coupleNames}>
        <span>Fatin Nashuha Binti Jeffri</span>
        <span>&amp;</span>
        <span>Mohamad Shafiq Bin Mohd Shakri</span>
      </p>
    </div>
  );
}

function CountdownView({ countdown }: { countdown: CountdownParts }) {
  const items = [
    ["Hari", countdown.days],
    ["Jam", countdown.hours],
    ["Minit", countdown.minutes],
    ["Saat", countdown.seconds],
  ] as const;
  return (
    <div className={styles.countdownGrid} aria-label="Countdown ke majlis">
      {items.map(([label, value]) => (
        <div key={label}>
          <strong>{label === "Hari" ? value : formatTwoDigits(value)}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function HorizontalImageStack() {
  const [active, setActive] = useState(0);
  const [offset, setOffset] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const syncOffset = useCallback((index: number) => {
    const track = trackRef.current;
    const target = track?.children.item(index) as HTMLElement | null;
    const first = track?.children.item(0) as HTMLElement | null;
    if (!track || !target || !first) {
      setOffset(0);
      return;
    }

    setOffset(Math.max(0, target.offsetLeft - first.offsetLeft));
  }, []);

  useEffect(() => {
    syncOffset(active);
  }, [active, syncOffset]);

  useEffect(() => {
    const onResize = () => syncOffset(active);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active, syncOffset]);

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(galleryImages.length - 1, index));
    setActive(next);
    syncOffset(next);
  };

  return (
    <section
      className={styles.horizontalImageStack}
      role="region"
      aria-label="Galeri gambar Shua"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          goTo(active - 1);
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          goTo(active + 1);
        }
      }}
    >
      <div ref={trackRef} className={styles.horizontalImageTrack} style={{ marginLeft: `-${offset}px` }}>
        {galleryImages.map((image) => (
          <figure key={image.label} className={styles.horizontalImageFigure}>
            <img src={image.src} width={1080} height={1920} alt={image.alt} loading="lazy" />
            <figcaption>{image.label}</figcaption>
          </figure>
        ))}
      </div>
      <div className={styles.horizontalImageFooter}>
        <span aria-live="polite">
          {active + 1} / {galleryImages.length}
        </span>
        <div>
          <button type="button" aria-label="Foto sebelumnya" disabled={active === 0} onClick={() => goTo(active - 1)}>
            <CaretLeft size={18} weight="bold" />
          </button>
          <button type="button" aria-label="Foto seterusnya" disabled={active === galleryImages.length - 1} onClick={() => goTo(active + 1)}>
            <CaretRight size={18} weight="bold" />
          </button>
        </div>
      </div>
    </section>
  );
}

function WishesPreview({ wishes, headingId }: { wishes: RsvpSubmission[]; headingId: string }) {
  const recentWishes = wishes.slice(0, 3);
  return (
    <section className={`${styles.kadSection} ${styles.wishesPreview}`} aria-labelledby={headingId}>
      <p id={headingId} className={styles.sectionLabel}>
        Wishes from RSVP
      </p>
      {recentWishes.length ? (
        recentWishes.map((wish) => (
          <article key={`${wish.timestamp}-${wish.name}`}>
            <p>&quot;{wish.wish || "Semoga majlis berjalan lancar."}&quot;</p>
            <strong>{wish.name}</strong>
          </article>
        ))
      ) : (
        <p>Ucapan tetamu akan dipaparkan di sini selepas RSVP dihantar.</p>
      )}
    </section>
  );
}

function SheetContent({
  active,
  musicState,
  onMusicPlay,
  onMusicPause,
  googleMap,
  waze,
  rsvpForm,
  rsvpStatus,
  isSubmitting,
  updateRsvpForm,
  submitRsvp,
  wishes,
}: {
  active: DockPanel;
  musicState: YouTubePlaybackState;
  onMusicPlay: () => void;
  onMusicPause: () => void;
  googleMap: string;
  waze: string;
  rsvpForm: RsvpFormState;
  rsvpStatus: string;
  isSubmitting: boolean;
  updateRsvpForm: (patch: Partial<RsvpFormState>) => void;
  submitRsvp: (event: FormEvent<HTMLFormElement>) => void;
  wishes: RsvpSubmission[];
}) {
  if (active === "time") {
    const calendar = calendarDetails();
    return (
      <div className={styles.sheetStack}>
        <div className={styles.eventSummary}>
          <CalendarBlank size={28} weight="light" />
          <div>
            <strong>{eventDetails.dateLabel}</strong>
            <span>{eventDetails.timeLabel}</span>
          </div>
        </div>
        <div className={styles.sheetActions}>
          <button type="button" className={styles.gradientAction} onClick={downloadCalendar}>
            <CalendarBlank size={18} weight="light" /> Muat turun kalendar
          </button>
          <a className={styles.gradientAction} href={calendar.google} target="_blank" rel="noreferrer">
            <CalendarBlank size={18} weight="light" /> Google Calendar
          </a>
        </div>
      </div>
    );
  }

  if (active === "location") {
    return (
      <div className={styles.sheetStack}>
        <strong>{eventDetails.venueName}</strong>
        <p>{eventDetails.venueAddress}</p>
        <div className={styles.sheetActions}>
          <a className={styles.gradientAction} href={googleMap} target="_blank" rel="noreferrer">
            <MapPin size={18} weight="light" /> Google Maps
          </a>
          <a className={styles.gradientAction} href={waze} target="_blank" rel="noreferrer">
            <NavigationArrow size={18} weight="light" /> Waze
          </a>
        </div>
      </div>
    );
  }

  if (active === "rsvp") {
    return (
      <div className={styles.rsvpSheet}>
        <form className={styles.rsvpForm} onSubmit={submitRsvp}>
          <label>
            <span>Nama</span>
            <input
              required
              name="name"
              value={rsvpForm.name}
              maxLength={80}
              autoComplete="name"
              onChange={(event) => updateRsvpForm({ name: event.target.value })}
            />
          </label>
          <label>
            <span>Kehadiran</span>
            <select
              name="attendance"
              value={rsvpForm.attendance}
              onChange={(event) => updateRsvpForm({ attendance: event.target.value as AttendanceStatus })}
            >
              {attendanceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Jumlah pax</span>
            <input
              name="pax"
              type="number"
              min={1}
              max={10}
              value={rsvpForm.pax}
              onChange={(event) => updateRsvpForm({ pax: Math.min(10, Math.max(1, Number(event.target.value) || 1)) })}
            />
          </label>
          <label>
            <span>No telefon</span>
            <input
              name="phone"
              type="tel"
              value={rsvpForm.phone}
              maxLength={30}
              autoComplete="tel"
              onChange={(event) => updateRsvpForm({ phone: event.target.value })}
            />
          </label>
          <label className={styles.fullField}>
            <span>Ucapan</span>
            <textarea
              name="wish"
              value={rsvpForm.wish}
              maxLength={240}
              rows={4}
              placeholder="Tulis ucapan ringkas..."
              onChange={(event) => updateRsvpForm({ wish: event.target.value })}
            />
          </label>
          <button type="submit" className={styles.gradientAction} disabled={isSubmitting}>
            <EnvelopeSimple size={18} weight="light" /> {isSubmitting ? "Menyimpan..." : "Hantar RSVP"}
          </button>
        </form>
        {rsvpStatus ? (
          <p className={styles.statusText} role="status">
            {rsvpStatus}
          </p>
        ) : null}
        <WishesPreview wishes={wishes} headingId="shua-rsvp-sheet-wishes-title" />
      </div>
    );
  }

  if (active === "gift") {
    const family = malaysiaPhoneLinks(contacts[0].phone);
    return (
      <div className={styles.giftSheet}>
        <div className={styles.giftCard}>
          <Gift size={32} weight="light" />
          <div>
            <strong>{giftDetails.title}</strong>
            <span>{giftDetails.recipient}</span>
          </div>
        </div>
        <div className={styles.giftInfo}>
          <span>Bank / DuitNow</span>
          <strong>{giftDetails.bank}</strong>
          <p>{giftDetails.note}</p>
        </div>
        <a className={styles.gradientAction} href={family.whatsapp} target="_blank" rel="noreferrer">
          <WhatsappLogo size={18} weight="light" /> Hubungi Sarina
        </a>
      </div>
    );
  }

  if (active === "contact") {
    return (
      <div className={styles.contactList}>
        {contacts.map((contact) => {
          const contactLinks = malaysiaPhoneLinks(contact.phone);
          return (
            <article key={contact.name}>
              <div>
                <strong>{contact.name}</strong>
                <span>
                  {contact.relation} - {contact.phone}
                </span>
              </div>
              <div className={styles.contactActions}>
                <a className={styles.roundAction} href={contactLinks.tel} aria-label={`Panggil ${contact.name}`}>
                  <Phone size={18} weight="light" />
                </a>
                <a className={styles.roundAction} href={contactLinks.whatsapp} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${contact.name}`}>
                  <WhatsappLogo size={18} weight="light" />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  const musicLabels: Record<YouTubePlaybackState, string> = {
    invalid: "Pautan YouTube tidak sah.",
    loading: "Memuatkan pemain...",
    ready: "Pemain sedia.",
    playing: "Lagu sedang dimainkan.",
    paused: "Lagu dijeda.",
    blocked: "Autoplay disekat. Tekan Play untuk memulakan lagu.",
    ended: "Lagu telah tamat.",
    error: "Pemain YouTube tidak dapat dimuatkan.",
  };

  return (
    <div className={styles.musicSheet}>
      <MusicNotes size={30} weight="fill" />
      <p role="status">{musicLabels[musicState]}</p>
      {musicState === "playing" ? (
        <button type="button" className={styles.gradientAction} onClick={onMusicPause}>
          <Pause size={18} weight="fill" /> Pause
        </button>
      ) : (
        <button
          type="button"
          className={styles.gradientAction}
          disabled={musicState === "invalid" || musicState === "loading" || musicState === "error"}
          onClick={onMusicPlay}
        >
          <Play size={18} weight="fill" /> Play
        </button>
      )}
    </div>
  );
}
