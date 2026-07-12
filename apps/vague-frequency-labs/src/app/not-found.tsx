// middleware 매칭 밖(점 포함 미지 경로 등)에서만 도달하는 최소 404.
// 브랜드 404는 [locale]/not-found.tsx가 담당한다. 루트 layout이 passthrough라
// 여기서 자체 <html>을 렌더한다.
export default function NotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          backgroundColor: "#000",
          color: "#eceae3",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
      >
        <p>404 — page not found</p>
      </body>
    </html>
  );
}
