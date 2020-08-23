
import css from './index.module.css'
import useApi from "hooks/use-api";
import useDebounce from "hooks/use-debounce";
import React, { useEffect, useMemo, useState } from 'react'

const PoiSearch = ({ onSearchResultClick }) => {
  const [query, setQuery] = useState("")
  const [canSearch, setCanSearch] = useState(false)
  const [searching, setSearching] = useState(false)
  const { data, error, loading, performAction } = useApi(`http://wsl.me:4321/pois/search?name=${query}`, false)

  useDebounce(() => {
    if (!canSearch)
      setCanSearch(true)

    performAction()
  }, query, 300, false)

  useEffect(() => {
    setSearching(loading)
  }, [loading])

  const mappedPois = useMemo(() => data?.pois.map(p => ({ ...p, geoJSONParsed: JSON.parse(p.geoJSON) })) ?? [], [data])

  return (
    <div className={css["search-container"]}>
      <input
        className={css["search-container__input"]}
        type="text"
        value={query}
        onChange={e => {
          setSearching(true)
          setQuery(e.target.value)
        }}
      />
      {
        !canSearch || query.trim().length <= 0
          ? null
          : <div className={css["search-container__results"]}>
            {
              searching
              ? <p>Searching...</p>
              : error
              ? <p>Something went wrong.</p>
              : mappedPois.length > 0
              ? mappedPois.map((p, i) => (
                <div
                  key={p.id}
                  className={css["search-container__results__item"]} style={mappedPois.length === i+1 ? {border: "none"}: {}}
                  onClick={() => onSearchResultClick(data.pois[i])}
                >
                  <h3>{p.name}</h3>
                  <p>Coordinates: {p.geoJSONParsed.coordinates[1]}, {p.geoJSONParsed.coordinates[0]}</p>
                </div>
              ))
              : <p>Nothing to show</p>
            }
          </div>
      }
    </div>
  )
}

export default PoiSearch
