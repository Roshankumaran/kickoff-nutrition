const messages = [
  "FREE SHIPPING ON ORDERS ABOVE ₹999",
  "FLAT 20% OFF — USE CODE: KICKOFF20",
  "AUTHENTIC SUPPLEMENTS · DIRECT FROM BRAND",
  "NEW DROP — PRE-WORKOUT V2 IS LIVE",
];

export function AnnouncementBar() {
  // Duplicate the list so the marquee loops seamlessly
  const items = [...messages, ...messages];

  return (
    <div className="bg-gradient-red text-primary-foreground overflow-hidden border-b border-black/10">
      <div className="relative flex whitespace-nowrap py-2.5">
        <div className="flex shrink-0 animate-marquee gap-12 pr-12">
          {items.map((m, i) => (
            <span
              key={i}
              className="text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-12"
            >
              {m}
              <span aria-hidden className="inline-block h-1 w-1 rounded-full bg-white/70" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
