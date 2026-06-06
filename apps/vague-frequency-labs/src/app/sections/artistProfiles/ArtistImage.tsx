import Image from "next/image";
import { ArtistProfile } from "@/types/artist";

const ArtistImage = ({
  artist,
  backgroundLogo,
  priority = false,
}: {
  artist: ArtistProfile;
  backgroundLogo: boolean;
  priority?: boolean;
}) => {
  return (
    <div className="group relative h-full w-full overflow-hidden object-cover">
      {/* 기본 이미지 */}
      <Image
        src={artist.image}
        width={1280}
        height={600}
        alt={`Image of ${artist.name}`}
        className={`h-full w-full object-cover object-center transition-all duration-200 ${backgroundLogo ? "group-hover:scale-110 group-hover:opacity-30" : "rounded-lg"}`}
        priority={priority}
        sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
        placeholder="blur"
        blurDataURL={artist.imagePlaceholder}
      />
      {backgroundLogo && (
        <div className="absolute inset-0 flex scale-95 items-center justify-center opacity-0 transition-all duration-200 ease-out group-hover:scale-100 group-hover:opacity-100">
          <Image
            src={artist.logoImage}
            width={320}
            height={150}
            sizes="(max-width: 768px) 50vw, 20vw"
            alt={`Hover image of ${artist.name}`}
            className="h-auto w-full object-contain brightness-75"
          />
        </div>
      )}
    </div>
  );
};

export default ArtistImage;
