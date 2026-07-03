import { site } from "@/lib/site";
import { WhatsAppIcon } from "./header";

export function WhatsAppFab({ label }: { label: string }) {
  return (
    <a
      href={site.whatsapp}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-110"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/40 [animation-duration:2.4s]" aria-hidden />
      <WhatsAppIcon className="relative h-7 w-7" />
    </a>
  );
}
