import type { ArtistProfile } from "@/types/artist";

import { ARTIST_NAME } from "@/consts/artist";
import { MusicInfo } from "./types/music";

export const artistProfilesData: ArtistProfile[] = [
  {
    name: ARTIST_NAME.JUNTARO,
    image: "/images/artist/juntaro/profile.webp",
    logoImage: "/images/artist/juntaro/logo.webp",
    imagePlaceholder:
      "data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCABQACgDASIAAhEBAxEB/8QAGgAAAwEBAQEAAAAAAAAAAAAAAAQFAgMBCP/EACYQAAEEAQMDBAMAAAAAAAAAAAEAAgMRBAUSITFBURMUIjIVI2H/xAAaAQACAwEBAAAAAAAAAAAAAAACBAEDBQAG/8QAHxEAAgICAwEBAQAAAAAAAAAAAQIAAxESBCExQQUT/9oADAMBAAIRAxEAPwD5wpFLclhvxFnsFKynTxy080fCURdp6LkWigZIzKW1eUs4bzLCC7quxCE9HEtTDqGH2cqQtkIXZkaRoCiCpudGJJ280XGjfZXMfG9a+aATGRojJMZznGpexQ1tg5jXL4xur1EktxPbNAa8PYRYIQQswQT47ixx3MtNCEuBqgR2ROCTkRbjHSsI/REVIQtkIQZjJSWtGaH5JaeaF0m8nJcXGMR9lP0y42ySl3XhMZuOyGEzWbLb6qUGBL2tLAkSDqOU4Ha1tG0nJNOwQzc7GnkrvjRe6ikskubyF2jLZNPMDhzdn+K8EL3MO0PyGwD7OsoDg2RnLXiwhLaUbxZmOdbWO+KFRYurdTR4lptqBPo6lB03pwV4cm9byB+LaQfsKUyYNdW921t8pnNcx+Mxhe0tb0U1+Q7zqWUfYhgTNxcJ73D5ONBJHIJLxH9n9lnMlFVu4HQBdMGBoAluyrjgDJmUu1jius+RrFi9GENvk8lC0XIS5yTkzWQLWoVfBF9QefbOUo5EuzaXEhUdSNY9eSpCapA1mF+nY39vfk9JJ6lVdPf+gDwpKc08OLyQeAisGVlHCsKWjH2Ui5C5koS2Jtl5/9k=",
    nickname: ARTIST_NAME.JUNTARO,
    shortDescription: "King",
    fullDescription: `
    JUNTARO is a Tech House producer and DJ based in Seoul,  
South Korea who presents new trends with his own sound.  
He proved his worth as a producer by releasing EPs and singles through leading labels such as  
Matroda's 'Terminal Underground Records'.  
He also had an amazing performance, peaking at #6 on the Beatport Tech House charts.  
Since 2010, he has been active in numerous festivals and clubs, expanding his presence.  
Also, as a member of Kuchi Tachi, he left a mark on the  
asia dance music world and promised more success.


JUNTARO는 서울을 기반으로 활동하는 테크 하우스 프로듀서이자 DJ입니다.  
그는 자신만의 사운드로 새로운 트렌드를 제시합니다.  
Matroda의 'Terminal Underground Records'와 같은 대표 레이블을 통해  
EP와 싱글을 발매하며 프로듀서로서의 실력을 입증했습니다.  
또한 Beatport 테크 하우스 차트에서 최고 6위를 기록하는 뛰어난 성과를 거두었습니다.  
2010년부터 그는 다양한 페스티벌과 클럽에서 활발히 활동하며 존재감을 넓혀왔습니다.  
또한 Kuchi Tachi의 멤버로서 아시아 댄스 음악 씬에 큰 흔적을 남겼고,  
앞으로 더 큰 성공을 예고하고 있습니다.
`,
    socials: [
      {
        name: "Youtube",
        href: "https://www.youtube.com/watch?v=1lAXNqA25Bs",
        iconName: "SiYoutube",
      },
      {
        name: "Instagram",
        href: "https://www.instagram.com/ye0m_2/",
        iconName: "SiInstagram",
      },
      {
        name: "SoundCloud",
        href: "https://soundcloud.com/ye0m2",
        iconName: "SiSoundcloud",
      },
    ],
  },
  {
    name: ARTIST_NAME.SIELO,
    image: "/images/artist/sielo/profile.webp",
    logoImage: "/images/artist/sielo/logo.webp",
    imagePlaceholder:
      "nKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCABQACgDASIAAhEBAxEB/8QAHAAAAQQDAQAAAAAAAAAAAAAABgAEBQcBAwgC/8QALhAAAQQBAwIGAQIHAAAAAAAAAQACAwQFBhEhMUEHEhMiMlEUYXEVIyRDYoGh/8QAGQEAAwEBAQAAAAAAAAAAAAAABAUGAwIH/8QAJBEAAgEDAwMFAAAAAAAAAAAAAQIAAxEhBAUSFDFBBhMiQlH/2gAMAwEAAhEDEQA/AOdGwkrdHXJ7KUhpknopKpjHPd8eEnfUAT0Gltw8we/GP0sGsfpGYw3t+K0zYktHxWXVQnoFga+AjskiCzQLeyS1XUAiDtt2YUVMaDt7VOVMa1o+Ke0am46J9kCKGKsWSB/KYXBL1QsY1eoEF4xNeGJg9ZzGD/IgLTJUilYXROY9v207qlr2av5u7LJPYkDQTs1p2ACxVz17GeZtexIA7ggndMjthKXvmTQ9S0/c48Tx/ZZ96nHuQC3f63SVXjJ23u9X8iTzHnqkhuhcdjGY3imfqZ0RQiGwTy1Cyf0KzohM2WQNfH9tQNkPEPEY1vkhcbEvYN6Ig8Dc63P6wtS5MgSOZ/Ts34aERptM5PIiwEB3PdKKUzTQ3Y4xIvMaGxOldXzXM7VkZp+w4elIzoz9Co3xZxGiH4CK7pueMTg7Na08u/dXH4o6u07jcRYx+fjE7HDiIj5LlLU16lk8s+xj6ralXoyJp4ATR6lhJTT0DUa/iRDG+RgCSPtIabxl2Fs9iy2WQ/2h2SSt9Wqta0qqO1u6AggQQ1FSZA6OxCwNYeCB2UhoHPSYPUNa7ESGsPuAPZeszC81RE8bte3cFDFCU1rDHEbgHYhPXXOZEI2LiXr483qGpNLY7J458byB79iNx+ioKKVw2IPI4IT63ce8SRxyPbAXb+nvwos8SfusmUWtNFqENyEmqV2anM2au8seOeCkmjT7QkgWpKxyJQJqqiCysRDTJTNdekqtIdHAw+Q/Y4QrkavpmCRvAeOVZGutG29J2JbVyeM+uzZrG9uqEpIGWMNWk38zm/IfQTRzy7SaT4jMEHuIfIN+hWuYdCszOBlkLehPCxEPUdGw93Af9WROJ1HUZ3jCSk89jP4VbZDvu1zA8f7SQveNgbAT/9k=",
    nickname: ARTIST_NAME.SIELO,
    shortDescription: "King",
    fullDescription: `
    DJ/Producer Sielo has been making waves in the global Tech House scene since 2020, with his music being released on prominent international labels like In/Rotation, The Myth Of NYX, Controversia, Elevation, Bass House Music, Soave Records, and Lowly. His unique sound has led to ongoing collaborations with top-tier DJs and producers from around the world.

In August 2022, Sielo’s collaboration with LOOZBONE, “I Can Feel It,” under In/Rotation, gained significant exposure, being featured as background music in the EDC Orlando 2022 Recap Video and the CORONA USA Video. His most recent track, “Mindscape,” was crafted alongside the renowned ‘K-391’ the producer behind massive hits like ‘Lily’ and ’Ignite’ and Nick Strand, former member of Seeb.

Sielo has quickly gained recognition within the Tech House scene, both in Korea and internationally. His tracks have earned support from some of the biggest names in the industry, including David Guetta, Alok, Don Diablo, Tchami, 4B, Showtek, Firebeats, Mike Williams, House Nation, Future House Music, and Bass House Music.

Beyond his music, Sielo’s presence on the DJ circuit is growing. He has been booked for major festivals such as World DJ Festival, Micro Seoul, and Strike Music Festival, where his electrifying performances have caught the attention of fans and industry professionals alike.

With his signature infectious sound and distinct style, Sielo continues to expand his fan base and is building momentum with his exciting musical journey. Expect more from him as he captivates the global stage with his electrifying beats, creative collaborations, and positive energy.


DJ/프로듀서 Sielo는 2020년부터 글로벌 테크 하우스 씬에서 두각을 나타내고 있으며,
그의 음악은 In/Rotation, The Myth Of NYX, Controversia, Elevation, Bass House Music, Soave Records, Lowly와 같은 저명한 해외 레이블에서 발매되었습니다.
독창적인 사운드를 바탕으로 세계 각지의 톱 클래스 DJ 및 프로듀서들과 지속적인 협업을 이어가고 있습니다.

2022년 8월, LOOZBONE과의 협업 트랙 “I Can Feel It”(In/Rotation)는
EDC Orlando 2022 Recap 영상 및 CORONA USA 광고 영상의 배경음악으로 사용되며 큰 주목을 받았습니다.
최신곡 “Mindscape”는 세계적인 히트곡 ‘Lily’, ‘Ignite’를 만든 K-391,
그리고 Seeb의 전 멤버 Nick Strand와 함께 작업한 곡입니다.

Sielo는 한국뿐 아니라 해외 테크 하우스 씬에서도 빠르게 인지도를 쌓아왔으며,
그의 트랙은 David Guetta, Alok, Don Diablo, Tchami, 4B, Showtek, Firebeats, Mike Williams 등
글로벌 탑 아티스트들의 서포트를 받고 있습니다.
또한 House Nation, Future House Music, Bass House Music 등 주요 채널들에서도 주목받고 있습니다.

음악 외에도 Sielo의 DJ 활동 또한 점차 확장되고 있으며,
World DJ Festival, Micro Seoul, Strike Music Festival 등 주요 페스티벌에 섭외되어
팬들과 업계 관계자들 사이에서 강렬한 인상을 남기고 있습니다.

감염력 강한 사운드와 독창적인 스타일을 바탕으로 팬층을 넓히고 있는 그는,
앞으로도 에너지 넘치는 비트, 창의적인 협업, 긍정적인 에너지로
글로벌 무대에서 더 큰 존재감을 보여줄 것으로 기대됩니다.
`,

    socials: [
      {
        name: "Youtube",
        href: "https://www.youtube.com/watch?v=1lAXNqA25Bs",
        iconName: "SiYoutube",
      },
      {
        name: "Instagram",
        href: "https://www.instagram.com/ye0m_2/",
        iconName: "SiInstagram",
      },
      {
        name: "SoundCloud",
        href: "https://soundcloud.com/ye0m2",
        iconName: "SiSoundcloud",
      },
    ],
  },
  {
    name: ARTIST_NAME.LOOZBONE,
    image: "/images/artist/loozbone/profile.webp",
    logoImage: "/images/artist/loozbone/logo.webp",
    imagePlaceholder:
      "data:image/jpeg;base64,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",
    nickname: ARTIST_NAME.LOOZBONE,
    shortDescription: "King",
    fullDescription: `
    LOOZBONE is a talented Tech House and Bass House producer who has been making waves in the electronic dance music scene.
With his unique sound and powerful tracks, he has gained a loyal following and caught the attention of industry professionals worldwide.

LOOZBONE has been releasing music in Korea and overseas.
Tracks like “Upgraded,” “See You,” and “Light It Up” were released on major labels such as Controversia (Alok’s label) in Brazil and HUB Records.
“I Can Feel It” was featured on Insomniac Music Group’s In/Rotation as part of the “Rotate Vol.9” compilation.
He has also remixed tracks for K-pop artists such as aespa and Seulgi (Red Velvet).
Additionally, his track “Don’t Stop” has garnered over 1 million streams on Spotify.

LOOZBONE has played at Korea’s biggest dance music festivals, including World DJ Festival and Strike Music Festival.
He has also performed at nightclubs such as Bangkok Muin, Omni / Alta (Taiwan), and clubs in South Korea including Race, Sound, and Jack.

LOOZBONE is a rising star in the electronic dance music scene.
With a unique sound that sets him apart, his recent releases and live performances have solidified his reputation as a top talent — and he is poised for even greater success in the future.

LOOZBONE은 테크 하우스와 베이스 하우스를 중심으로 활동하는 재능 있는 프로듀서로,
전자 음악 씬에서 독창적인 사운드와 강렬한 트랙들로 전 세계 업계 관계자들의 주목을 받고 있습니다.

그는 한국과 해외에서 활발히 활동 중이며,
“Upgraded”, “See You”, “Light It Up”과 같은 트랙을 브라질 최대 레이블 Controversia (Alok 소속) 및 HUB Records에서 발매했습니다.
“I Can Feel It”은 Insomniac Music Group의 In/Rotation – Rotate Vol.9 컴필레이션에 수록되었고,
aespa, 레드벨벳의 슬기 등 K-POP 아티스트의 트랙 리믹스도 진행했습니다.
특히 “Don’t Stop”은 Spotify에서 100만 스트리밍을 돌파했습니다.

LOOZBONE은 월드 DJ 페스티벌, 스트라이크 뮤직 페스티벌 등
국내 최대 댄스 뮤직 페스티벌에 출연했으며,
방콕 Muin, 대만 Omni/Alta, 그리고 한국의 Race, Sound, Jack 등 주요 클럽에서도 공연했습니다.

LOOZBONE은 빠르게 떠오르는 일렉트로닉 댄스 뮤직 신의 스타로,
그만의 독창적인 사운드와 무대 퍼포먼스로 존재감을 강화하고 있으며
앞으로 더욱 기대되는 아티스트로 주목받고 있습니다.
    `,
    socials: [
      {
        name: "Youtube",
        href: "https://www.youtube.com/watch?v=1lAXNqA25Bs",
        iconName: "SiYoutube",
      },
      {
        name: "Instagram",
        href: "https://www.instagram.com/ye0m_2/",
        iconName: "SiInstagram",
      },
      {
        name: "Instagram",
        href: "https://soundcloud.com/ye0m2",
        iconName: "SiSoundcloud",
      },
    ],
  },
  {
    name: ARTIST_NAME.SAM,
    image: "/images/artist/sam/profile.webp",
    logoImage: "/images/artist/sam/logo.webp",
    imagePlaceholder:
      "data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCABQACgDASIAAhEBAxEB/8QAHAAAAQUBAQEAAAAAAAAAAAAAAAMFBgcIAQQC/8QAKRAAAQMDAgYCAwEBAAAAAAAAAQIDBAAFEQYSBxMhIjFBFGEVQlEIgf/EABoBAAIDAQEAAAAAAAAAAAAAAAIEAwUGAAf/xAAkEQACAgIBAwQDAAAAAAAAAAABAgADBBESBSIxFCNBURMhcf/aAAwDAQACEQMRAD8Az+BX1iugUq20tw4Qkk/VVZOprgIlijFPkHTsuTg7CAae4+inVAbyahbIRfJjCYtjeBIPiirAOhzjyaKH1df3D9Db9SJ2m1vT3QlCTt9mrEs2nI0JjmyNoCRkqV6px0/aG4bKe0ZpPVdulXpyHZobha+QrLix6TShta+wIDoRw1rh0m1hsidh6hsKXiwiU3uBxn1UlY5braVtFKkHqCPBpFzgXa12FKG5Cw+E55n3UY0JEuNhvE+w3JwupY7mlH2KkycJa05qYjhdXe+z8br5+pMw39UV6Qmiq2XHONTKQBS0WEmXd2UpcCHinCTn31rzPOhiM46fCEk1VLerZbGqGJfNUUpdxsB9ZpvCrZ7Nj4i3VLFSkhvmabFulu21MVuWA637JHWovNtMZm7vTFObpQRyyBTjbL+y7G+Yl9nC0527u4f8qFWPUDF0vFyC5Le5LmEpKvVPZbe2dCUOAnvDkZJAKKARiiqeaL9zNl94hXO5NrabIjsq6YTUSYkOl8HcSonOSa6GElhKyoA+xThpOwyb/e2IMZCu5Q3KH6j+1r0pSle0aE8+tyrslt2MSZprgtbhdNMMyLg0lSj25/oqv+O+i1aclJvNkWtlhZwtKDjBq8IH4vQejmvkvBthhHUk9VGs68XOJ51aPx1tQUQEnJUfKqXQbbaiTu+l0xjdpLidPtoSxciZTA/Y+RRVfLjrbjpdONijiius6fS7ciJLT1jJqXiDv+zjqx2AYOD1rRPByNbYEFM5SQZL4AJHhNZv2nrn1Uk0/q6daIyo6FlTZHQZ8UzarMO2I0Mit3yxP9CajkzJjFube3REjcQk9CapvlqaILgKQRkU8XO8ruBR80byOuTTfcJJkuJIACUjAAokUKupHY5ZtxV3krjJCN2fvwaK9FuuDjDQSI7bwIwAoeKKMwBP/9k=",
    nickname: ARTIST_NAME.SAM,
    shortDescription: "King",
    fullDescription: "test",
    socials: [
      {
        name: "Youtube",
        href: "https://www.youtube.com/watch?v=1lAXNqA25Bs",
        iconName: "SiYoutube",
      },
      {
        name: "Instagram",
        href: "https://www.instagram.com/ye0m_2/",
        iconName: "SiInstagram",
      },
      {
        name: "Instagram",
        href: "https://soundcloud.com/ye0m2",
        iconName: "SiSoundcloud",
      },
    ],
  },
  {
    name: ARTIST_NAME.DEARBOI,
    image: "/images/artist/dearboi/profile.webp",
    logoImage: "/images/artist/dearboi/logo.webp",
    imagePlaceholder:
      "data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCABQACgDASIAAhEBAxEB/8QAGwAAAQUBAQAAAAAAAAAAAAAABQADBAYHAQL/xAAvEAABBAEDAgQEBgMAAAAAAAABAAIDBAUGESESUQciMUEUJUJzCBMjNbHxUmOB/8QAGAEBAQEBAQAAAAAAAAAAAAAABAMFAQL/xAAiEQACAgEDBAMAAAAAAAAAAAAAAQIDESIyQQQhMVESYXH/2gAMAwEAAhEDEQA/AMq2XkhPRRmSRrGDdzjsETn09kYmdToCRtvwtfBk5YBe1R5I1PnhfE4tkaWnsQo7mrrieozID2bJKQ9qS8YKqQew7erJ1R3kC3k0GmFnl+kfwsJwn7tU+4Ftetc1NgsHHYrxh73ADn24XLc5SRCt9m2BNQ6Zr3Ynbxhr/ZwCyfM4yXG2nRSg7ex7o7S1TnsxYmsTX46bIXeWAtPnG6smrKDclgo7QH6oYHb7KdN6lJx9FraXGKk+TKntSTrxskktEVLsFcIfm1T7gWs+J+VpVtOtqz7Ome0Fo7ceqyPCn5pU+4FaNW1H5jW9ajP1OheWtcB/jsp2eU3wcgsrHsb0vbq1RXbmYI42WeYJpGcO/wCrQszHEcc9sfT+X0cbem2yo/4jJamMdg8PRia1lSIOAA5G39onQzPxOha1qUgOMPSg0pfNyXI+9twin4RmNtobYkA9A4pLzM7rkc7uSUlqGeiViHbZKqf9g/lWfVufOE1lBfh6dmFjXb9lUaEgjtwvJ2DXglP+ImQqTWXWDzH0gAD3KPbtb+i1a1L9Lb4iZHGXvEKq7LNL6d+kGtePpJA2KqkGQkr4d2Ia/qjglIDu7fZEdfVW5DAaPylfYBzWwvPbn+kCs1vhcjaja8Pb5fMDvzsj9PuEdRsPDikuOSTsg0jjSheqmtdiXF3qDwiQKr2sLW0UcAPJ5KNZLEGXhHM1gfbqWafRjMTLL5YXdUfcFOaUsvnpPEji54PqTuVSQSPRWnRjj0zj2R6J60i90NLZZikuFJOCH//Z",
    nickname: ARTIST_NAME.DEARBOI,
    shortDescription: "King",
    fullDescription: `
    Dearboi is a house/tech house DJ based in Seoul, South Korea, with his own unique vibe.  
He is currently working as a resident DJ at 'MUSE' in Seoul and is attacking many people.  
Manufactured he’s music is also an artist whose own groove has been proven and expected to contribute to future activities in Korea and abroad.

Dearboi는 서울을 기반으로 활동하는 하우스/테크 하우스 DJ로, 그만의 독특하고 매력적인 바이브로 주목받고 있습니다.  
현재 서울의 ‘MUSE’ 클럽에서 레지던트 DJ로 활약하며, 관객과 공감하는 에너지 넘치는 셋을 선보이고 있습니다.  
자신만의 색깔과 검증된 그루브를 바탕으로 국내는 물론 해외 씬에서도 활발한 활동이 기대되는 아티스트입니다.
`,
    socials: [
      {
        name: "Youtube",
        href: "https://www.youtube.com/watch?v=1lAXNqA25Bs",
        iconName: "SiYoutube",
      },
      {
        name: "Instagram",
        href: "https://www.instagram.com/ye0m_2/",
        iconName: "SiInstagram",
      },
      {
        name: "Instagram",
        href: "https://soundcloud.com/ye0m2",
        iconName: "SiSoundcloud",
      },
    ],
  },
  {
    name: ARTIST_NAME.PLAYMODE,
    image: "/images/artist/playmode/profile.webp",
    logoImage: "/images/artist/playmode/logo.webp",
    imagePlaceholder:
      "data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCABQACgDASIAAhEBAxEB/8QAHAAAAgIDAQEAAAAAAAAAAAAAAAcEBgEDCAIF/8QALBAAAgEDAgUCBgMBAAAAAAAAAQIDAAQFBhEHEiExQRMiCCMyUWFxFDNC4f/EABoBAAMAAwEAAAAAAAAAAAAAAAMEBQABAgb/xAAhEQACAgEEAgMAAAAAAAAAAAAAAQIDEQQSITEUQSMyUf/aAAwDAQACEQMRAD8AR4WvXLWwLWeXamMHnNxq5a8la2u6IAWOwPms8u43HUVmDM4IzLRW9lorWDpSJCrU3FY5snkbe0TtI4DfrzUYdqsOgMzDhdT2txc24uIiwQqfya6fQOrDmk+ht3Gm9BJpK7g9e3ae3i+Y2/uVtqR+n9P32Ulkhx0TTxK5COB0IrqXL6W0xHiZb7+BDGl2geYH/W47V74d6WtcNjpZIoVRbh/URNvpXxQKZLc8l/XUb64pYQlMfwgylwgadxHv4orpeRAqnYUU1uX4TfEiu2ziJUBBZ2CIvVmPinVwt0TgZ8fBmhcLkHBB2HZDXPmo7t47T0EOyufdTV+FbISSXmWxbsWjePnVSegNAsbC6HTx2qyXYzuI+u7LGWV3i8kiwSqoe1k29r7eKtOjNZ2GR09iprmZEe4QIpH0kjxS94xaQOTwN3czDnurZedAPtVG4cwXOX4ZzW8DcstjPzp91O9CitvKKNknNc+jqxxuKKpVnqyGx0TaX19MrSrGFc79yKKZjFtZEbLoQeJM4mz3qTz8sSO/KOvKpO1N34Tbdn1PkpPpKRbdf1XyeGmocZp7LTyZW0juIpl5TzrvtVmOucNpTUMmT0+kQt7zpPGvj8ilrJYlhjmkgpUKUX16H9qOGFrGdrpwQ8ZQj7ikJo28h0xls5YK6pG7lwD2I3/6ajat4vrd27x2shYMKUWZ1JcXlw86krIR1bfvXWEkDlNt8FqOqri+iv8AGFn9BZyy/aiq/pqRpMVKzqP7N+bbr3oo66RG1S+Vmm8PyX/VVksw7kkVZbw7Qv8AqqydiKDYUNJ9WG57qawxJ6GgAgnY1jyaEOFzwkqx4FIAvuLcxaiouGO9gn4optdIh3c2PJ//2Q==",
    nickname: ARTIST_NAME.PLAYMODE,
    shortDescription: "King",
    fullDescription: `
    “PLAYMODE” is a highly skilled electronic music producer and DJ hailing from Seoul, South Korea.  
With a primary focus on Tech and Bass House genres,

“PLAYMODE” has established a reputation for their exceptional ability to explore and blend diverse sounds across various genres.

His extensive experience in the vibrant club scene from a young age has honed their live performance skills and deepened their understanding of crowd dynamics.

With his exceptional talent and ability to deliver unparalleled sonic experiences, Playmode is the ideal choice for any event or venue seeking to elevate their musical programming

“PLAYMODE”는 서울을 기반으로 활동하는 실력파 일렉트로닉 뮤직 프로듀서이자 DJ로, Tech House와 Bass House 장르를 중심으로 활약하고 있습니다.

장르를 넘나드는 사운드 믹싱과 감각적인 연출로 주목받으며, 실험적이고 창의적인 사운드로 탄탄한 평판을 쌓아왔습니다.

어릴 때부터 클럽 씬에서 활동하며 무대 경험을 쌓아온 그는 라이브 퍼포먼스 능력을 끌어올리고, 관객 흐름에 대한 탁월한 감각을 갖추게 되었습니다.

독보적인 사운드와 몰입감 있는 음악 연출 능력을 지닌 PLAYMODE는 어떤 이벤트나 공연장에서도 분위기를 한층 끌어올릴 수 있는 최고의 선택지입니다.
    `,
    socials: [
      {
        name: "Youtube",
        href: "https://www.youtube.com/watch?v=1lAXNqA25Bs",
        iconName: "SiYoutube",
      },
      {
        name: "Instagram",
        href: "https://www.instagram.com/ye0m_2/",
        iconName: "SiInstagram",
      },
      {
        name: "Instagram",
        href: "https://soundcloud.com/ye0m2",
        iconName: "SiSoundcloud",
      },
    ],
  },
];

export const artistProfile = {
  baseUrl: "/artistProfiles",
  getPages: () => artistProfilesData,
  getPage: (name: string) => artistProfilesData.find((p) => p.name === name),
};

export const musicInfoDatas: MusicInfo[] = [
  {
    name: "Floating",
    artist: ARTIST_NAME.JUNTARO,
    label: "Payday Records",
    image: "/images/music/1.webp",
    shortDescription: "test",
    fullDescription: "test",
    socials: [
      {
        name: "Youtube",
        href: "https://www.youtube.com/watch?v=1lAXNqA25Bs",
        iconName: "SiYoutube",
      },
      {
        name: "Soundcloud",
        href: "https://soundcloud.com/juntaromusic",
        iconName: "SiSoundcloud",
      },
      {
        name: "Spotify",
        href: "https://open.spotify.com/artist/2UMKCxDFAAy154VgUJHKN9",
        iconName: "SiSpotify",
      },
      {
        name: "Apple Music",
        href: "https://music.apple.com/us/artist/juntaro/1020632340",
        iconName: "SiApple",
      },
      {
        name: "Beatport",
        href: "https://www.beatport.com/artist/juntaro/501402",
        iconName: "SiBeatport",
      },
    ],
  },
  {
    name: "Baby",
    artist: ARTIST_NAME.SIELO,
    label: "Payday Records",
    image: "/images/music/2.webp",
    shortDescription: "test",
    fullDescription: "test",
    socials: [
      {
        name: "Youtube",
        href: "https://www.youtube.com/@sieloofficial",
        iconName: "SiYoutube",
      },
      {
        name: "Soundcloud",
        href: "https://soundcloud.com/sieloofficial",
        iconName: "SiSoundcloud",
      },
      {
        name: "Beatport",
        href: "https://www.beatport.com/artist/sielo/62767",
        iconName: "SiBeatport",
      },
    ],
  },
  {
    name: "Demolish",
    artist: ARTIST_NAME.SIELO,
    label: "Payday Records",
    image: "/images/music/3.webp",
    shortDescription: "test",
    fullDescription: "test",
    socials: [
      {
        name: "Beatport",
        href: "https://www.beatport.com/release/demolish-extended-mix/5083512",
        iconName: "SiBeatport",
      },
    ],
  },
  {
    name: "Esto Ta Duro",
    artist: ARTIST_NAME.JUNTARO,
    label: "Payday Records",
    image: "/images/music/4.webp",
    shortDescription: "test",
    fullDescription: "test",
    socials: [
      {
        name: "Beatport",
        href: "https://www.beatport.com/release/esto-ta-duro/5056601",
        iconName: "SiBeatport",
      },
    ],
  },
  {
    name: "Selecta",
    artist: ARTIST_NAME.JUNTARO,
    label: "Payday Records",
    image: "/images/music/5.webp",
    shortDescription: "test",
    fullDescription: "test",
    socials: [
      {
        name: "Beatport",
        href: "https://www.beatport.com/release/selecta-extended-mix/4387981",
        iconName: "SiBeatport",
      },
    ],
  },
];

export const musicInfo = {
  baseUrl: "/musicInfo",
  getInfos: () => musicInfoDatas,
  getInfo: (name: string) => musicInfoDatas.find((p) => p.name === name),
};
