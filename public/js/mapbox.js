export const displayMap = (locations) => {
  mapboxgl.accessToken =
    "pk.eyJ1IjoieXVsaTEyMzQ1IiwiYSI6ImNtMHF3bXg1ZDAyZnEya3NidXluZHNvODUifQ.MWzSDaUpcjz7FAR7--OpfQ";
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/yuli12345/cm0r3vlcp00m801pbb46y6hwt",
    scrollZoom: false,
  });
  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create marker
    const el = document.createElement("div");
    el.className = "marker";

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: "bottom",
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Dat ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
