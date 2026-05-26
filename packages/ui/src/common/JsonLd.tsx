import type { ReactElement } from "react";

interface JsonLdProps {
  items: object | readonly object[];
}

// JSON.stringify with "<" → "<" escape so a "</script" sequence inside
// user data can't break out of the surrounding <script> tag.
function serialize(item: object): string {
  return JSON.stringify(item).replace(/</g, "\\u003c");
}

export function JsonLd({ items }: JsonLdProps): ReactElement {
  const list = Array.isArray(items) ? items : [items];
  return (
    <>
      {list.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialize(item) }}
        />
      ))}
    </>
  );
}
