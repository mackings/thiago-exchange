import { SiWhatsapp } from "react-icons/si";
import { whatsappLink } from "@/lib/site";

export default function WhatsAppButton() {
  return (
    <a
      href={whatsappLink("Hello Thiago Exchange, I'd like to trade.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition hover:scale-105"
    >
      <SiWhatsapp size={26} />
    </a>
  );
}
