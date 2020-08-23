import css from './index.module.css'
import { useEffect, useRef, useState } from "react";
import { View, Map, Feature, Overlay } from "ol";
import { Tile as TileLayer, Group as GroupLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { fromLonLat, transform } from 'ol/proj';
import { getCenter, getCorner } from "ol/extent";
import Corner from "ol/extent/Corner";
import { GeoJSON } from 'ol/format';
import { Coordinate, distance } from "ol/coordinate";
import VectorSource from "ol/source/Vector";
import { Circle as CircleStyle, Style, Fill, Stroke } from "ol/style";
import { Select } from 'ol/interaction';
import { SelectEvent } from "ol/interaction/Select";
import { easeOut } from 'ol/easing';

const styles = {
  'Point': new Style({
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({color: "green"}),
      stroke: new Stroke({color: 'red', width: 1}),
    }),
  }),
  'LineString': new Style({
    stroke: new Stroke({
      color: 'green',
      width: 1,
    }),
  }),
  'MultiLineString': new Style({
    stroke: new Stroke({
      color: 'green',
      width: 1,
    }),
  }),
  'MultiPoint': new Style({
    image: new CircleStyle({
      radius: 5,
      fill: null,
      stroke: new Stroke({color: 'red', width: 1}),
    }),
  }),
  'MultiPolygon': new Style({
    stroke: new Stroke({
      color: 'yellow',
      width: 1,
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 0, 0.1)',
    }),
  }),
  'Polygon': new Style({
    stroke: new Stroke({
      color: 'blue',
      lineDash: [4],
      width: 3,
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 255, 0.1)',
    }),
  }),
  'GeometryCollection': new Style({
    stroke: new Stroke({
      color: 'magenta',
      width: 2,
    }),
    fill: new Fill({
      color: 'magenta',
    }),
    image: new CircleStyle({
      radius: 10,
      fill: null,
      stroke: new Stroke({
        color: 'magenta',
      }),
    }),
  }),
  'Circle': new Style({
    stroke: new Stroke({
      color: 'red',
      width: 2,
    }),
    fill: new Fill({
      color: 'rgba(255,0,0,0.2)',
    }),
  }),
};

type Poi = {
  id: string,
  name: string,
  geoJSON: string;
}

const MyMap = ({ selectedPoiSearch, setSelectedSearchPoi }) => {
  const popupRef = useRef<HTMLDivElement>()
  const popupMapRef = useRef<Overlay>()
  const renderMapRef = useRef<HTMLDivElement>();
  const selectPoiInfoInteraction = useRef(new Select())
  const tileLayerGroup = useRef(new GroupLayer({
    zIndex: 0,
    layers: [
      new TileLayer({
        source: new OSM()
      })
    ]
  }));
  const poisLayerGroup = useRef(new GroupLayer({
    zIndex: 1,
    layers: [
      new VectorLayer({
        source: new VectorSource({}),
        style: feature => styles[feature.getGeometry().getType()]
      })
    ]
  }));
  const selectedPoiLayerGroup = useRef(new GroupLayer({
    zIndex: 2,
    layers: [
      new VectorLayer({
        source: new VectorSource({}),
        style: new Style({
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({color: "blue"})
          }),
        })
      })
    ],
    visible: false
  }));
  const mapRef = useRef<Map>();
  const selectedPoiSearchRef = useRef(selectedPoiSearch)
  selectedPoiSearchRef.current = selectedPoiSearch
  const [selectedPoi, setSelectedPoi] = useState<Feature>(undefined);

  const renderPois = (pois: Poi[]) => {
    const vLayer = poisLayerGroup.current.getLayers().getArray()[0] as VectorLayer;
    const featuresToAdd = []
    pois.forEach(p => {
      if (!vLayer.getSource().getFeatureById(p.id)) {
        const f = new GeoJSON({ featureProjection: "EPSG:3857" }).readFeature(p.geoJSON);
        f.setId(p.id)
        f.setProperties({name: p.name})
        featuresToAdd.push(f)
      }
    })
    vLayer.getSource().addFeatures(featuresToAdd);
  };

  const getPois = async (center: Coordinate, distance: number) => {
    fetch(`http://wsl.me:4321/pois?center=${center[0]}&center=${center[1]}&range=${distance}`)
      .then(res => res.json())
      .then(({ pois }) => {
        if (pois.length <= 0)
          return;
        renderPois(pois);
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    popupMapRef.current = new Overlay({
      element: popupRef.current
    })
    mapRef.current = new Map({
      controls: [],
      overlays: [popupMapRef.current],
      layers: [
        tileLayerGroup.current,
        poisLayerGroup.current,
        selectedPoiLayerGroup.current
      ],
      target: renderMapRef.current,
      view: new View({
        center: fromLonLat([-8.405912793788858, 41.55803240886854], "EPSG:3857"),
        zoom: 15,
        projection: "EPSG:3857"
      })
    });

    return () => {
      mapRef.current.dispose()
    }
  }, []);

  useEffect(() => {
    if (!selectedPoiSearch) {
      ;(selectedPoiLayerGroup.current.getLayersArray()[0] as VectorLayer).getSource().clear()
      selectedPoiLayerGroup.current.setVisible(false)
    } else {
      if (selectedPoi)
        selectPoiInfoInteraction.current.getFeatures().clear()

      const f = new GeoJSON({ featureProjection: "EPSG:3857" }).readFeature(selectedPoiSearch.geoJSON);
      f.setId(selectedPoiSearch.id)
      f.setProperties({name: selectedPoiSearch.name})
      const vl = selectedPoiLayerGroup.current.getLayersArray()[0] as VectorLayer
      vl.getSource().clear()
      vl.getSource().addFeature(f);
      selectedPoiLayerGroup.current.setVisible(true)
      selectPoiInfoInteraction.current.getFeatures().push(f)
      selectPoiInfoInteraction.current.dispatchEvent({
        type: 'select',
        selected: [f],
        deselected: []
      });
    }
  }, [selectedPoiSearch])

  useEffect(() => {
    const showPoiInfoOnSelect = (e: SelectEvent) => {
      const selected = (e.selected[0] as Feature)
      popupMapRef.current.setPosition(selected ? getCenter(selected.getGeometry().getExtent()) : null)
      if (selected?.getId() !== selectedPoiSearchRef.current?.id) {
        setSelectedSearchPoi(undefined)
        selectPoiInfoInteraction.current.getFeatures().clear()
        if (selected)
          selectPoiInfoInteraction.current.getFeatures().push(selected)
      }

      setSelectedPoi(selected)

      if (selected) {
        setTimeout(() => {
          mapRef.current.getView().animate({
            center: getCenter(selected.getGeometry().getExtent()),
            duration: 1000,
            easing: easeOut,
          });
        })
      }
    };

    const getNewPoisAfterMove = () => {
      const zoom = mapRef.current.getView().getZoom();
      const extend = mapRef.current.getView().calculateExtent(mapRef.current.getSize());
      const c = getCenter(extend);
      const topRight = getCorner(extend, Corner.TOP_RIGHT);
      const d = distance(c, topRight);

      if (zoom >= 15) {
        getPois(transform(c, "EPSG:3857", "EPSG:4326"), d);
      }
    }

    const toggleVisibilityOfFeaturesLayer = () => {
      const zoom = mapRef.current.getView().getZoom();

      if (zoom >= 15) {
        poisLayerGroup.current.setVisible(true)
      }
      else {
        poisLayerGroup.current.setVisible(false)
      }
    };

    selectPoiInfoInteraction.current.addEventListener("select", showPoiInfoOnSelect);
    mapRef.current.addInteraction(selectPoiInfoInteraction.current)
    mapRef.current.addEventListener("moveend", toggleVisibilityOfFeaturesLayer)
    mapRef.current.addEventListener("moveend", getNewPoisAfterMove)

    return () => {
      mapRef.current.removeEventListener("moveend", toggleVisibilityOfFeaturesLayer)
      mapRef.current.removeEventListener("moveend", getNewPoisAfterMove)
      mapRef.current.removeInteraction(selectPoiInfoInteraction.current)
      selectPoiInfoInteraction.current.removeEventListener("select", showPoiInfoOnSelect)
    }
  }, [])

  useEffect(() => {
    const togglePopupVisibilityBasedOnZoom = () => {
      const zoom = mapRef.current.getView().getZoom();
      if (zoom >= 15) {
        if (selectedPoi)
          popupMapRef.current.setPosition(getCenter(selectedPoi.getGeometry().getExtent()))
      }
      else {
        if (selectedPoiSearchRef.current)
          return

        popupMapRef.current.setPosition(null)
      }
    }

    mapRef.current.addEventListener("moveend", togglePopupVisibilityBasedOnZoom)

    return () => {
      mapRef.current.removeEventListener("moveend", togglePopupVisibilityBasedOnZoom)
    }
  }, [selectedPoi])

  return (
    <div ref={renderMapRef} style={{ width: "100%", height: "100%" }}>
      <div ref={popupRef} className={css.map_popup}>
        <span className={css.map_popup__triangle}></span>
        {selectedPoi === undefined ? <p>A carregar</p> : <h3>{selectedPoi.getProperties().name}</h3>}
      </div>
    </div>
  );
};

export default MyMap;
