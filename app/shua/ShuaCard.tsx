"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarBlank,
  Clock,
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
import styles from "./page.module.css";

type DockPanel = "time" | "location" | "contact" | "music";

const musicUrl = "https://www.youtube.com/watch?v=boRd_GXsYWA";

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

export function ShuaCard() {
  const [active, setActive] = useState<DockPanel | null>(null);
  const [musicState, setMusicState] = useState<YouTubePlaybackState>("loading");
  const playerRef = useRef<YouTubeControllerHandle>(null);
  const sheetRef = useRef<HTMLElement>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const validMusic = useMemo(() => Boolean(buildYouTubeControllerUrl(musicUrl, "00:00", "")), []);
  const links = useMemo(() => mapLinks(), []);

  const closeSheet = useCallback(() => {
    setActive(null);
    requestAnimationFrame(() => lastTrigger.current?.focus());
  }, []);

  const openSheet = (panel: DockPanel, trigger: HTMLButtonElement) => {
    lastTrigger.current = trigger;
    setActive((current) => (current === panel ? null : panel));
  };

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
            startAt="00:00"
            endAt=""
            onStateChange={setMusicState}
          />

          <article className={styles.card} aria-label="Kad jemputan perkahwinan Nashuha dan Shafiq">
            <section className={styles.coverPage} aria-labelledby="shua-cover-title">
              <h1 id="shua-cover-title" className={styles.srOnly}>
                Majlis Perkahwinan Nashuha dan Shafiq, Sabtu 22 Ogos 2026, 12 PM hingga 4 PM.
              </h1>
              <img
                className={styles.coverImage}
                src="/templates/shua/4.png"
                width={1080}
                height={1920}
                alt="Kad utama Majlis Perkahwinan Nashuha dan Shafiq dengan bunga merah, tarikh Sabtu 22 Ogos 2026 dan masa 12 PM hingga 4 PM."
              />
            </section>

            <section className={styles.detailPage} aria-labelledby="shua-detail-title">
              <div className={styles.detailInner}>
                <p className={styles.kicker}>Walimatulurus</p>
                <p className={styles.poem}>
                  Setepak sirih, sekacip pinang, semekar senyuman, seikhlas hati
                  <br />
                  Dengan penuh kesyukuran ke hadrat Ilahi
                </p>

                <div className={styles.hosts}>
                  <p>Jeffri Bin Mat Jaafar &</p>
                  <p>Sarina Binti Mat Din @ Samsudin</p>
                </div>

                <div className={styles.inviteLine} aria-hidden="true" />
                <p className={styles.invitation}>Mengundang Dato&apos; / Datin / Tuan / Puan / Encik / Cik</p>
                <p className={styles.invitationSmall}>ke majlis perkahwinan anakanda kami</p>

                <h2 id="shua-detail-title" className={styles.names}>
                  <span>Fatin Nashuha Binti Jeffri</span>
                  <i>&amp;</i>
                  <span>Mohamad Shafiq Bin Mohd Shakri</span>
                </h2>

                <div className={styles.infoGrid}>
                  <div className={styles.qrNote}>
                    <span className={styles.qrBox} aria-hidden="true" />
                    <p>Scan qr code</p>
                    <p>untuk lokasi</p>
                    <p>majlis</p>
                  </div>

                  <div className={styles.infoStack}>
                    <section aria-labelledby="shua-date-heading">
                      <h3 id="shua-date-heading">Tarikh &amp; Masa</h3>
                      <p>{eventDetails.dateLabel}</p>
                      <p>{eventDetails.timeLabel}</p>
                    </section>

                    <section aria-labelledby="shua-location-heading">
                      <h3 id="shua-location-heading">Lokasi</h3>
                      <p>{eventDetails.venueName}</p>
                      <p>{eventDetails.venueAddress}</p>
                    </section>

                    <section aria-labelledby="shua-contact-heading">
                      <h3 id="shua-contact-heading">Hubungi</h3>
                      {contacts.map((contact) => (
                        <p key={contact.name}>
                          {contact.name} ({contact.relation}) : {contact.phone}
                        </p>
                      ))}
                    </section>
                  </div>
                </div>
              </div>
            </section>
          </article>

          {active ? (
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
                />
              </section>
            </div>
          ) : null}

          {validMusic ? (
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

          <nav className={styles.dock} aria-label="Menu jemputan">
            <DockButton active={active === "time"} icon={<Clock size={19} weight="light" />} label="Masa" onClick={(event) => openSheet("time", event.currentTarget)} />
            <DockButton active={active === "location"} icon={<MapPin size={19} weight="light" />} label="Lokasi" onClick={(event) => openSheet("location", event.currentTarget)} />
            <DockButton active={active === "contact"} icon={<Phone size={19} weight="light" />} label="Hubungi" onClick={(event) => openSheet("contact", event.currentTarget)} />
          </nav>
        </div>
      </div>
    </main>
  );
}

function sheetTitle(active: DockPanel) {
  if (active === "time") return "Tarikh & Masa";
  if (active === "location") return "Lokasi Majlis";
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
  icon: React.ReactNode;
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

function SheetContent({
  active,
  musicState,
  onMusicPlay,
  onMusicPause,
  googleMap,
  waze,
}: {
  active: DockPanel;
  musicState: YouTubePlaybackState;
  onMusicPlay: () => void;
  onMusicPause: () => void;
  googleMap: string;
  waze: string;
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

  if (active === "contact") {
    return (
      <div className={styles.contactList}>
        {contacts.map((contact) => {
          const links = malaysiaPhoneLinks(contact.phone);
          return (
            <article key={contact.name}>
              <div>
                <strong>{contact.name}</strong>
                <span>
                  {contact.relation} - {contact.phone}
                </span>
              </div>
              <div className={styles.contactActions}>
                <a className={styles.roundAction} href={links.tel} aria-label={`Panggil ${contact.name}`}>
                  <Phone size={18} weight="light" />
                </a>
                <a className={styles.roundAction} href={links.whatsapp} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${contact.name}`}>
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
