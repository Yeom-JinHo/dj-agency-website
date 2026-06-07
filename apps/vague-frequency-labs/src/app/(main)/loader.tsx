import { Preloader } from "@repo/ui/common/Preloader";

export default function Loader() {
  return (
    <Preloader>
      <span className="vfl-loader-hey">Hey</span>
      <span className="vfl-loader-ready">
        <span>Are</span>
        <span className="ml-3 xl:ml-10">you</span>
        <span className="ml-3 xl:ml-10">ready?</span>
      </span>
    </Preloader>
  );
}
