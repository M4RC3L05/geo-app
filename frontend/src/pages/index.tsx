import PoiSearch from "components/poi-search";
import dynamic from "next/dynamic";
import { useState } from "react";

const MyMap = dynamic(() => import("./../components/my-map"), { ssr: false });

export default function Home() {
  const [selectedSearchPoi, setSelectedSearchPoi] = useState(undefined)
  return (
    <>
      <MyMap selectedPoiSearch={selectedSearchPoi} setSelectedSearchPoi={setSelectedSearchPoi} />
      <PoiSearch onSearchResultClick={(p) => setSelectedSearchPoi(p)} />
    </>
  );
}
