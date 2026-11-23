import { formatDate, formatDuration, formatTime, pageLang, pageName, type PostTitles } from "@/lib/admin/format";
import { IconCheck, IconClock, IconCursor, IconEye, IconForm, IconPlay } from "./icons";

export interface TimelineEvent {
  id: number;
  created_at: string;
  session_id: string;
  type: string;
  path: string;
  label: string | null;
  href: string | null;
  seconds: number | null;
  scroll: number | null;
  source: string | null;
  utm_campaign: string | null;
  device: string | null;
  city: string | null;
  region: string | null;
}

function describe(event: TimelineEvent, titles: PostTitles): { icon: React.ReactNode; text: React.ReactNode; strong?: boolean } {
  const page = <span className="font-medium text-ink">{pageName(event.path, titles)}</span>;
  switch (event.type) {
    case "pageview":
      return { icon: <IconEye className="h-4 w-4" />, text: <>Abriu {page}</> };
    case "page_exit":
      return {
        icon: <IconClock className="h-4 w-4" />,
        text: (
          <>
            Ficou {formatDuration(event.seconds ?? 0)} em {page}
            {Boolean(event.scroll) && `, leu até ${event.scroll}% da página`}
          </>
        ),
      };
    case "click": {
      const where = event.href?.includes("wa.me")
        ? "abriu o WhatsApp"
        : event.href?.startsWith("tel:")
          ? "ligou"
          : event.href?.startsWith("mailto:")
            ? "abriu o e-mail"
            : null;
      return {
        icon: <IconCursor className="h-4 w-4" />,
        text: (
          <>
            Clicou em <span className="font-medium text-ink">{event.label || event.href}</span>
            {where && ` (${where})`}
          </>
        ),
        strong: Boolean(where),
      };
    }
    case "form_view":
      return { icon: <IconForm className="h-4 w-4" />, text: "Viu o formulário de orçamento" };
    case "form_start":
      return { icon: <IconForm className="h-4 w-4" />, text: "Começou a preencher o pedido de orçamento", strong: true };
    case "form_submit":
      return { icon: <IconCheck className="h-4 w-4" />, text: "Enviou o pedido de orçamento", strong: true };
    case "video_play":
      return { icon: <IconPlay className="h-4 w-4" />, text: "Deu play no vídeo", strong: true };
    default:
      return { icon: <IconEye className="h-4 w-4" />, text: event.type };
  }
}

/** O caminho de um visitante, visita por visita, do mais recente ao mais antigo. */
export function Timeline({ events, titles = {} }: { events: TimelineEvent[]; titles?: PostTitles }) {
  const sessions: TimelineEvent[][] = [];
  for (const event of events) {
    const last = sessions[sessions.length - 1];
    if (last && last[0].session_id === event.session_id) last.push(event);
    else sessions.push([event]);
  }
  sessions.reverse();

  return (
    <div className="space-y-6 px-5 pb-5">
      {sessions.map((session) => {
        const first = session[0];
        const context = [
          first.source && `veio de ${first.source}`,
          first.utm_campaign && `campanha ${first.utm_campaign}`,
          first.device,
          first.city && `${first.city}${first.region ? `, ${first.region}` : ""}`,
        ].filter(Boolean);
        return (
          <section key={first.session_id}>
            <h3 className="text-[13px] font-semibold text-ink">
              Visita de {formatDate(first.created_at)}
              <span className="ml-2 font-normal text-ink-3">{context.join(" · ")}</span>
            </h3>
            <ol className="mt-3 space-y-2.5 border-l border-line pl-4">
              {session.map((event) => {
                const { icon, text, strong } = describe(event, titles);
                const lang = pageLang(event.path);
                return (
                  <li key={event.id} className="flex items-start gap-3 text-[13.5px] text-ink-2">
                    <time className="w-11 flex-none pt-px text-[12.5px] text-ink-3" dateTime={event.created_at}>
                      {formatTime(event.created_at)}
                    </time>
                    <span className={`mt-0.5 ${strong ? "text-accent" : "text-ink-3"}`}>{icon}</span>
                    <span className="min-w-0 break-words">
                      {text}
                      {lang && event.type === "pageview" && <span className="adm-tag ml-2">{lang}</span>}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

export const TIMELINE_COLUMNS =
  "id,created_at,session_id,type,path,label,href,seconds,scroll,source,utm_campaign,device,city,region";
