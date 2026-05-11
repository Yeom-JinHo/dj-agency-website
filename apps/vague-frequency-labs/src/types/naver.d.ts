export {};

declare global {
  interface Window {
    naver: {
      maps: {
        Map: new (element: string | HTMLElement, options: unknown) => unknown;
        LatLng: new (lat: number, lng: number) => unknown;
        Marker: new (options: unknown) => unknown;
        Point: new (x: number, y: number) => unknown;
      };
    };
  }
}
