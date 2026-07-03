import Image from "next/image";

export function LogoMarquee({
  logos,
  slow = false,
  itemClassName = "",
}: {
  logos: { logo: string; name?: string }[];
  slow?: boolean;
  itemClassName?: string;
}) {
  const track = [...logos, ...logos];
  return (
    <div
      className="group relative overflow-hidden"
      style={{
        maskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
      }}
    >
      <div
        className={`flex w-max items-center gap-14 pr-14 ${slow ? "animate-marquee-slow" : "animate-marquee"} group-hover:[animation-play-state:paused]`}
      >
        {track.map((item, index) => (
          <div key={index} className="flex h-20 w-36 shrink-0 items-center justify-center">
            <Image
              src={item.logo}
              alt={item.name ?? ""}
              width={144}
              height={72}
              className={`max-h-16 w-auto object-contain transition duration-300 ${itemClassName}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
