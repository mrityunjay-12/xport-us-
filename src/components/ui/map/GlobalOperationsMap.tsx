import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

const MAP_MARKERS = [
  { name: "Los Angeles", coordinates: [-118.2437, 34.0522] },
  { name: "Hamburg", coordinates: [9.9937, 53.5511] },
  { name: "Singapore", coordinates: [103.8198, 1.3521] },
];

export default function GlobalOperationsMap() {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
      <ComposableMap
        projectionConfig={{ scale: 145 }}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                style={{
                  default: { fill: "#e5e7eb", outline: "none" },
                  hover: { fill: "#d1d5db", outline: "none" },
                  pressed: { fill: "#d1d5db", outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {MAP_MARKERS.map(({ name, coordinates }) => (
          <Marker key={name} coordinates={coordinates}>
            <circle r={3} />
            <text
              textAnchor="middle"
              y={-8}
              style={{ fontSize: 10, fill: "#4b5563" }}
            >
              {name}
            </text>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}
