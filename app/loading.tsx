import { Spinner } from "@/components/spinner";
import React from "react";

const Loadingpage = () => {
  return (
    <div className="h-full min-h-screen w-full flex items-center justify-center p-8">
      <div className="h-full min-h-screen w-full flex items-center justify-center p-8">
        <Spinner size={"lg"} />
      </div>
    </div>
  );
};

export default Loadingpage;
