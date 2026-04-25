export interface Metadata {
  author: {
    name: string;
    username: string;
    label: string;
    twitterHandle?: string;
  };
  site: {
    title: string;
    description: string;
    url: string;
    keywords: string[];
    language: string;
    charset: string;
    ogLocale?: string;
  };
}
