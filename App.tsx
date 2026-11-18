"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, DragEvent, ReactNode } from "react";
import {
  Accessibility,
  BookOpen,
  Brain,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Ear,
  ExternalLink,
  Eye,
  FileText,
  GraduationCap,
  HeartHandshake,
  Link2,
  MonitorPlay,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Upload,
  Users,
  Video,
  Volume2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ============================================================
   ВИДЕО БАПТАУЫ (өз бейнеңізді осы жерден қосыңыз)
   1) Өз файлыңыз болса: оны public/ папкасына video.mp4 деп салып, "/video.mp4" қалдырыңыз.
   2) YouTube немесе Google Drive сілтемесін тікелей осында жазуға болады.
      Мысалы: source: "https://youtu.be/XXXXXXXXXXX"
   ============================================================ */
const DEFAULT_VIDEO_CONFIG: { source: string; title: string } = {
  source: "/video.mp4",
  title: "Бейімделген қысқа бейнеролик (3–5 минут)",
};

const PORTAL_URL = "https://special-edu.kz/";

type Media = { kind: "embed" | "file"; url: string };
type Cat = "sens" | "cog" | "speech" | "asd";
type Program = {
  id: number;
  title: string;
  cat: Cat;
  Icon: LucideIcon;
  field: string;
  summary: string;
  target: string;
  adapt: string[];
  tools: string[];
};

/** YouTube / Drive сілтемесін embed форматына түрлендіреді */
function toEmbed(raw: string): string | null {
  const u = raw.trim();
  const yt = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const dr = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (dr) return `https://drive.google.com/file/d/${dr[1]}/preview`;
  return null;
}

function resolveMedia(raw: string): Media | null {
  const src = raw.trim();
  if (!src) return null;
  const embed = toEmbed(src);
  if (embed) return { kind: "embed", url: embed };
  return { kind: "file", url: src };
}

const PROGRAMS: Program[] = [
  {
    id: 1, title: "Есту қабілеті бұзылған балалар", cat: "sens", Icon: Ear, field: "Сурдопедагогика",
    summary: "Есту-сөйлеу дағдыларын дамыту, ымдау тілі мен дактиль қолдауы.",
    target: "Саңырау, нашар еститін және кохлеарлық имплант қолданатын балалар.",
    adapt: ["Субтитр және визуалды тірек", "Ымдау тілі мен дактильді қолдану", "Дыбыс күшейткіш құралдар, жарықтандыру"],
    tools: ["e-Ымдау", "Дактиль", "Есту-сөйлеу дамыту жиынтықтары"],
  },
  {
    id: 2, title: "Көру қабілеті бұзылған балалар", cat: "sens", Icon: Eye, field: "Тифлопедагогика",
    summary: "Брайль қарпі, кеңістіктік бағдарлау, көру гигиенасы.",
    target: "Көзі көрмейтін және нашар көретін балалар.",
    adapt: ["Жоғары контраст және ірі шрифт", "Рельефті-нүктелі материалдар", "Дыбыстық сипаттама мен бағдарлау"],
    tools: ["Брайль оқулықтары", "Ірі шрифтті ОӘК", "Сөйлеу синтезі"],
  },
  {
    id: 3, title: "Сөйлеу тілі жалпы дамымаған (СТЖД) балалар", cat: "speech", Icon: Volume2, field: "Логопедия",
    summary: "Дыбыстық талдау, сөйлеу тілін түзету, коммуникативтік дағдылар.",
    target: "Сөйлеу тілінің барлық компоненттері кемшін дамыған балалар.",
    adapt: ["Қысқа, нақты нұсқаулар", "Артикуляциялық жаттығулар", "Суретті және символдық тірек"],
    tools: ["Логопедиялық альбомдар", "Дыбыс қою карталары", "Сөйлеу синтезі"],
  },
  {
    id: 4, title: "Тірек-қимыл аппараты бұзылған балалар", cat: "speech", Icon: Accessibility, field: "Кешенді оңалту",
    summary: "Кешенді оңалту, емдік дене шынықтыру (ЕДШ), моториканы дамыту.",
    target: "Қозғалыс функциялары бұзылған, мысалы ЦП диагнозы бар балалар.",
    adapt: ["Қолжетімді физикалық орта", "Жазуға арналған бейімделген құралдар", "Сабақ қарқынын жекелендіру"],
    tools: ["Бейімделген жиһаз", "Моторика жаттығулары", "Компьютерлік қолдау құралдары"],
  },
  {
    id: 5, title: "Психикалық дамуы тежелген (ПДТ) балалар", cat: "cog", Icon: Brain, field: "Түзете-дамыту",
    summary: "Зейін мен есте сақтауды дамыту, сараланған тәсіл.",
    target: "Танымдық белсенділігі және зейіні тұрақсыз балалар.",
    adapt: ["Тапсырманы шағын бөліктерге бөлу", "Жиі ауысатын әрекет түрлері", "Көрнекі мысалдар"],
    tools: ["Түзете-дамыту бағдарламалары", "Дидактикалық ойындар", "Зейін жаттығулары"],
  },
  {
    id: 6, title: "Зияты зақымдалған және күрделі бұзылыстары бар балалар", cat: "cog", Icon: HeartHandshake, field: "Жеке оқу бағдарламасы",
    summary: "Өмірлік маңызды дағдылар мен әлеуметтендіруге бағытталған жеке бағдарлама.",
    target: "Зияты зақымдалған немесе бірнеше бұзылысы бар балалар.",
    adapt: ["Жеке оқу жоспары", "Күнделікті өмір дағдыларын қайталау", "Қарапайым, нақты тапсырмалар"],
    tools: ["Жеке бағдарлама үлгілері", "Өмірлік дағды карточкалары", "Әлеуметтену жаттығулары"],
  },
  {
    id: 7, title: "Аутистік спектр бұзылыстары (АСБ) бар балалар", cat: "asd", Icon: Sparkles, field: "Құрылымдалған оқыту",
    summary: "Құрылымдалған оқыту, визуалды кесте, әлеуметтік өзара әрекеттесуді қолдау.",
    target: "Аутистік спектр бұзылыстары бар балалар.",
    adapt: ["Визуалды күн тәртібі", "Болжамды, тұрақты орта", "Сенсорлық жүктемені азайту"],
    tools: ["Визуалды кестелер", "Әлеуметтік хикаялар", "Коммуникация карточкалары"],
  },
];

const CATS: { id: "all" | Cat; label: string }[] = [
  { id: "all", label: "Барлығы" },
  { id: "sens", label: "Сенсорлық" },
  { id: "cog", label: "Танымдық/Зияткерлік" },
  { id: "speech", label: "Сөйлеу және қимыл" },
  { id: "asd", label: "Аутизм спектрі" },
];

const STATS: { v: string; l: string }[] = [
  { v: "541+", l: "Арнайы білім беру ұйымдары (ҚР бойынша)" },
  { v: "8 бағыт", l: "Даму бұзылыстары бойынша ғылыми зертханалар" },
  { v: "3 деңгей", l: "Үлгілік оқу бағдарламалары (Мектепке дейінгі, Бастауыш, Негізгі орта)" },
  { v: "100%", l: "Тегін цифрлық кітапхана, ОӘК және педагог курстары" },
];

const STRUCTURE: { Icon: LucideIcon; title: string; items: string[] }[] = [
  { Icon: GraduationCap, title: "Үлгілік оқу бағдарламалары", items: ["Мектепке дейінгі — №721 бұйрық", "Бастауыш 0–4 сынып — №51 бұйрық", "Негізгі орта 5–10 сынып — №469 бұйрық"] },
  { Icon: BookOpen, title: "Оқулықтар мен ОӘК (УМК)", items: ["Арнайы мектептер мен сыныптарға арналған оқулықтар", "Бұзылыс түрлері мен сыныптар бойынша жүйеленген"] },
  { Icon: MonitorPlay, title: "Цифрлық ресурстар", items: ["Орталықтың электрондық кітапханасы", "e-Ымдау, Дактиль, Сөйлеу синтезі", "Көру және есту қабілеті бұзылған балаларға арналған"] },
  { Icon: Users, title: "Педагогтер мен ата-аналарға", items: ["Біліктілікті арттыру курстары", "Әдістемелік нұсқаулықтар", "Ата-аналарға кеңес"] },
];

const ORGS: { name: string; note: string }[] = [
  { name: "Арнайы балабақшалар мен сәбилер бақшалары", note: "Ерте жастан түзете-дамыту көмегі." },
  { name: "Арнайы мектептер", note: "Бұзылыс түріне сай бейімделген білім беру." },
  { name: "ПМПК", note: "Психологиялық-медициналық-педагогикалық кеңес: бағыттау және диагностика." },
  { name: "ППТК", note: "Психологиялық-педагогикалық түзеу кабинеттері." },
  { name: "Оңалту орталықтары", note: "Кешенді медициналық-педагогикалық оңалту." },
  { name: "Аутизм орталықтары", note: "АСБ бар балаларға арнайы қолдау." },
];

const CHECKLIST: string[] = [
  "Көрнекілік пен анық визуалды тірек (контраст, артық детальсіз кадр)",
  "Субтитр және баяу, анық дикция (есту/сөйлеу ерекшеліктері үшін)",
  "Ұзақтығы 3–5 минут (зейіннің тұрақтылығын ескеру)",
  "Қарапайым, түсінікті нұсқаулықтар мен интерактивті үзіліс сәттері",
];

const NAV: { id: string; label: string }[] = [
  { id: "intro", label: "Орталық туралы" },
  { id: "programs", label: "Бағдарламалар" },
  { id: "orgs", label: "Инфрақұрылым" },
  { id: "video", label: "Бейімделген бейнеролик" },
  { id: "summary", label: "Қорытынды" },
];

const SLIDES: { id: string; label: string }[] = [
  { id: "intro", label: "Кіріспе" },
  { id: "structure", label: "Сайт құрылымы" },
  { id: "programs", label: "Бағдарламалар" },
  { id: "orgs", label: "Ұйымдар" },
  { id: "video", label: "Бейнеролик" },
  { id: "summary", label: "Қорытынды" },
];

const HC_CSS = `.hc, .hc * { background-color:#000 !important; color:#fff !important; border-color:#fff !important; box-shadow:none !important; background-image:none !important; }
.hc a, .hc a * { color:#ff0 !important; text-decoration:underline; }`;

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-28 px-4 py-10 sm:px-6">
      <h2 className="mb-6 text-2xl font-bold text-slate-900 sm:text-3xl">{title}</h2>
      {children}
    </section>
  );
}

function Toggle({ on, onClick, label, Icon }: { on: boolean; onClick: () => void; label: string; Icon: LucideIcon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-teal-600 ${
        on ? "border-teal-700 bg-teal-700 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function Player({ media, onFail }: { media: Media; onFail?: () => void }) {
  if (media.kind === "embed") {
    return (
      <iframe
        src={media.url}
        title={DEFAULT_VIDEO_CONFIG.title}
        className="aspect-video w-full rounded-xl"
        allow="accelerometer; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    );
  }
  return <video src={media.url} controls playsInline onError={onFail} className="aspect-video w-full rounded-xl bg-black" />;
}

export default function App() {
  const [bigFont, setBigFont] = useState<boolean>(false);
  const [contrast, setContrast] = useState<boolean>(false);
  const [slideMode, setSlideMode] = useState<boolean>(false);
  const [slide, setSlide] = useState<number>(0);
  const [cat, setCat] = useState<"all" | Cat>("all");
  const [query, setQuery] = useState<string>("");
  const [selected, setSelected] = useState<Program | null>(null);
  const [tab, setTab] = useState<"ready" | "link" | "local">("ready");
  const [readyFailed, setReadyFailed] = useState<boolean>(false);
  const [linkInput, setLinkInput] = useState<string>("");
  const [linkMedia, setLinkMedia] = useState<Media | null>(null);
  const [linkError, setLinkError] = useState<string>("");
  const [localUrl, setLocalUrl] = useState<string>("");
  const [dragging, setDragging] = useState<boolean>(false);

  useEffect(() => {
    document.documentElement.style.fontSize = bigFont ? "20px" : "16px";
  }, [bigFont]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setSelected(null);
      const tag = (e.target as HTMLElement).tagName;
      if (!slideMode || tag === "INPUT") return;
      if (e.key === "ArrowRight") setSlide((s) => Math.min(s + 1, SLIDES.length - 1));
      if (e.key === "ArrowLeft") setSlide((s) => Math.max(s - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slideMode]);

  useEffect(() => {
    return () => {
      if (localUrl) URL.revokeObjectURL(localUrl);
    };
  }, [localUrl]);

  const go = (id: string): void => {
    const known = SLIDES.findIndex((s) => s.id === id);
    if (slideMode) {
      setSlide(known >= 0 ? known : 0);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const loadFile = (file: File | undefined): void => {
    if (!file || !file.type.startsWith("video/")) return;
    setLocalUrl(URL.createObjectURL(file));
  };

  const onPick = (e: ChangeEvent<HTMLInputElement>): void => loadFile(e.target.files?.[0]);
  const onDrop = (e: DragEvent<HTMLLabelElement>): void => {
    e.preventDefault();
    setDragging(false);
    loadFile(e.dataTransfer.files[0]);
  };

  const addLink = (): void => {
    const m = resolveMedia(linkInput);
    if (!m) {
      setLinkError("Сілтемені енгізіңіз.");
      return;
    }
    setLinkError("");
    setLinkMedia(m);
  };

  const q = query.trim().toLowerCase();
  const filtered = PROGRAMS.filter(
    (p) => (cat === "all" || p.cat === cat) && (q === "" || `${p.title} ${p.field} ${p.summary}`.toLowerCase().includes(q)),
  );

  const readyMedia = resolveMedia(DEFAULT_VIDEO_CONFIG.source);
  const tabs: { id: "ready" | "link" | "local"; label: string; Icon: LucideIcon }[] = [
    { id: "ready", label: "Дайын бейне", Icon: Play },
    { id: "link", label: "Сілтеме қосу", Icon: Link2 },
    { id: "local", label: "Компьютерден жүктеу", Icon: Upload },
  ];

  const placeholder = (text: string): ReactNode => (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center text-slate-600">
      <Video className="h-10 w-10 text-teal-700" />
      <p className="text-sm">{text}</p>
    </div>
  );

  const sections: Record<string, ReactNode> = {
    intro: (
      <Section id="intro" title="Кіріспе анықтама">
        <div className="rounded-3xl bg-gradient-to-br from-teal-700 to-indigo-900 p-6 text-white sm:p-10">
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
            «Даму бұзылыстары бар оқушыларға арналған білім беру бағдарламалары»
          </h1>
          <p className="mt-4 max-w-3xl text-base text-teal-50 sm:text-lg">
            {PORTAL_URL} — Қазақстан Республикасы Оқу-ағарту министрлігінің «Арнайы және инклюзивті білім беруді дамытудың ұлттық
            ғылыми-практикалық орталығы» (АИБД ҰҒПО, 1992 жылы құрылған, Алматы қ., Байзақов көш. 273 «А») ресми цифрлық порталы.
          </p>
          <a
            href={PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-teal-800 hover:bg-amber-100"
          >
            <ExternalLink className="h-5 w-5" />
            special-edu.kz порталына өту
          </a>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.v} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="text-3xl font-extrabold text-teal-700">{s.v}</div>
              <p className="mt-1 text-sm text-slate-600">{s.l}</p>
            </div>
          ))}
        </div>
      </Section>
    ),
    structure: (
      <Section id="structure" title="1. Сайттың негізгі бөлімдері мен құрылымы">
        <div className="grid gap-4 sm:grid-cols-2">
          {STRUCTURE.map((c) => (
            <div key={c.title} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded-xl bg-teal-50 p-2 text-teal-700">
                  <c.Icon className="h-6 w-6" />
                </span>
                <h3 className="text-lg font-semibold">{c.title}</h3>
              </div>
              <ul className="space-y-2 text-sm text-slate-700">
                {c.items.map((i) => (
                  <li key={i} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    ),
    programs: (
      <Section id="programs" title="2. Даму бұзылыстары бойынша білім беру бағдарламалары">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex flex-1 items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2">
            <Search className="h-5 w-5 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Бағдарламаны іздеу..."
              aria-label="Бағдарламаны іздеу"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {CATS.map((c) => (
              <Toggle key={c.id} on={cat === c.id} onClick={() => setCat(c.id)} label={c.label} Icon={FileText} />
            ))}
          </div>
        </div>
        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">Ештеңе табылмады. Басқа сөз енгізіп көріңіз.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelected(p)}
                className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-teal-600 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                <span className="inline-flex rounded-xl bg-amber-100 p-2 text-amber-800">
                  <p.Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-3 font-semibold text-slate-900">{p.title}</h3>
                <p className="mt-1 text-xs font-medium text-teal-700">{p.field}</p>
                <p className="mt-2 text-sm text-slate-600">{p.summary}</p>
                <span className="mt-3 inline-flex items-center text-sm font-medium text-indigo-800">
                  Толығырақ <ChevronRight className="h-4 w-4" />
                </span>
              </button>
            ))}
          </div>
        )}
      </Section>
    ),
    orgs: (
      <Section id="orgs" title="3. Арнайы білім беру ұйымдарының жүйесі">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ORGS.map((o, i) => (
            <div key={o.name} className="relative rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-indigo-50 p-2 text-indigo-800">
                  <Building2 className="h-6 w-6" />
                </span>
                <h3 className="font-semibold">{o.name}</h3>
              </div>
              <p className="mt-3 text-sm text-slate-600">{o.note}</p>
              {i < ORGS.length - 1 && <ChevronRight className="absolute -right-3 top-1/2 hidden h-5 w-5 text-slate-400 lg:block" />}
            </div>
          ))}
        </div>
      </Section>
    ),
    video: (
      <Section id="video" title="4. Бейімделген қысқа бейнеролик (3–5 минут)">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 lg:col-span-2">
            <div className="mb-4 flex flex-wrap gap-2">
              {tabs.map((t) => (
                <Toggle key={t.id} on={tab === t.id} onClick={() => setTab(t.id)} label={t.label} Icon={t.Icon} />
              ))}
            </div>
            {tab === "ready" &&
              (readyMedia && !readyFailed ? (
                <Player media={readyMedia} onFail={() => setReadyFailed(true)} />
              ) : (
                placeholder("Бейне әлі қосылмаған. public/video.mp4 файлын салыңыз немесе DEFAULT_VIDEO_CONFIG ішіне сілтеме жазыңыз.")
              ))}
            {tab === "link" && (
              <div>
                <div className="mb-3 flex gap-2">
                  <input
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    placeholder="YouTube немесе Google Drive сілтемесі"
                    aria-label="Бейне сілтемесі"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                  <button type="button" onClick={addLink} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">
                    Қосу
                  </button>
                  <button
                    type="button"
                    aria-label="Тазалау"
                    onClick={() => {
                      setLinkInput("");
                      setLinkMedia(null);
                      setLinkError("");
                    }}
                    className="rounded-xl border border-slate-300 px-3 py-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
                {linkError && <p className="mb-2 text-sm text-red-700">{linkError}</p>}
                {linkMedia ? <Player media={linkMedia} /> : placeholder("Сілтемені қойып, «Қосу» батырмасын басыңыз.")}
              </div>
            )}
            {tab === "local" && (
              <div>
                <label
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  className={`mb-3 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center text-sm ${
                    dragging ? "border-teal-600 bg-teal-50" : "border-slate-300 bg-slate-50"
                  }`}
                >
                  <Upload className="h-8 w-8 text-teal-700" />
                  Бейне файлды осында апарып тастаңыз немесе таңдаңыз
                  <input type="file" accept="video/*" onChange={onPick} className="hidden" />
                </label>
                {localUrl ? <Player media={{ kind: "file", url: localUrl }} /> : placeholder("Файл таңдалмаған.")}
              </div>
            )}
          </div>
          <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="mb-3 text-lg font-semibold text-amber-900">Бейнероликтің бейімделу критерийлері (Чек-лист)</h3>
            <ul className="space-y-3 text-sm text-slate-800">
              {CHECKLIST.map((c) => (
                <li key={c} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
                  {c}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </Section>
    ),
    summary: (
      <Section id="summary" title="Қорытынды">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-700">
          <p>
            special-edu.kz порталы даму бұзылыстары бар балалардың білім алуына қажетті бағдарламаларды, оқу-әдістемелік кешендерді,
            цифрлық құралдарды және педагогтерге арналған курстарды бір жерге жинайды. Әр бұзылыс түріне бөлек тәсіл қажет екені
            бағдарламалар каталогынан көрінеді. Бейімделген бейнеролик осы қажеттіліктерді ескеретін нақты мысал ретінде ұсынылады.
          </p>
        </div>
      </Section>
    ),
  };

  const current = SLIDES[slide];

  return (
    <div className={`${contrast ? "hc" : ""} min-h-screen bg-slate-50 text-slate-900`}>
      <style>{HC_CSS}</style>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
          <span className="font-bold text-teal-800">special-edu.kz — Анықтама</span>
          <span className="rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-semibold text-indigo-900">БӨЖ 4 | Веб-презентация</span>
          <nav className="flex flex-wrap gap-1 text-sm">
            {NAV.map((n) => (
              <button key={n.id} type="button" onClick={() => go(n.id)} className="rounded-lg px-2 py-1 text-slate-700 hover:bg-slate-100">
                {n.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="border-t border-slate-100 bg-slate-50">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-2 sm:px-6" role="toolbar" aria-label="Қолжетімділік панелі">
            <span className="mr-1 inline-flex items-center gap-1 text-sm font-medium text-slate-700">
              <Accessibility className="h-4 w-4" /> Қолжетімділік:
            </span>
            <Toggle on={bigFont} onClick={() => setBigFont(!bigFont)} label={bigFont ? "Үлкейтілген" : "Қалыпты"} Icon={FileText} />
            <Toggle on={contrast} onClick={() => setContrast(!contrast)} label="Жоғары контраст" Icon={Eye} />
            <Toggle on={slideMode} onClick={() => setSlideMode(!slideMode)} label={slideMode ? "Слайд режимі" : "Толық бет"} Icon={MonitorPlay} />
          </div>
        </div>
      </header>

      <main>
        {slideMode ? (
          <div>
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pt-6 sm:px-6">
              <button
                type="button"
                onClick={() => setSlide((s) => Math.max(s - 1, 0))}
                disabled={slide === 0}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Алдыңғы
              </button>
              <span className="text-sm font-medium text-slate-600">
                {slide + 1} / {SLIDES.length}: {current.label}
              </span>
              <button
                type="button"
                onClick={() => setSlide((s) => Math.min(s + 1, SLIDES.length - 1))}
                disabled={slide === SLIDES.length - 1}
                className="inline-flex items-center gap-1 rounded-xl bg-teal-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
              >
                Келесі <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            {sections[current.id]}
          </div>
        ) : (
          SLIDES.map((s) => <div key={s.id}>{sections[s.id]}</div>)
        )}
      </main>

      <footer className="mt-8 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl space-y-1 px-4 py-6 text-sm text-slate-600 sm:px-6">
          <p>Дереккөз: {PORTAL_URL} — АИБД ҰҒПО</p>
          <p>Орындаған: Студент аты-жөні, тобы</p>
        </div>
      </footer>

      {selected && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={selected.title}
          onClick={() => setSelected(null)}
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-bold">{selected.title}</h3>
              <button type="button" onClick={() => setSelected(null)} className="rounded-lg border border-slate-300 px-3 py-1 text-sm">
                Жабу
              </button>
            </div>
            <p className="mt-1 text-sm font-medium text-teal-700">{selected.field}</p>
            <h4 className="mt-4 font-semibold">Мақсатты топ</h4>
            <p className="text-sm text-slate-700">{selected.target}</p>
            <h4 className="mt-4 font-semibold">Бейімдеу тәсілдері (қажеттіліктерді ескеру)</h4>
            <ul className="list-disc pl-5 text-sm text-slate-700">
              {selected.adapt.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
            <h4 className="mt-4 font-semibold">Негізгі оқу-әдістемелік құралдар</h4>
            <ul className="list-disc pl-5 text-sm text-slate-700">
              {selected.tools.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
