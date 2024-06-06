// Importaciones necesarias
import { tileLayerSelect } from '../RutasKonrad/config/tile-layers/functions';
import { drinkWaterSoraluze } from '../RutasKonrad/templates/ts/drink_waters';
import 'leaflet-routing-machine';
import * as L from 'leaflet';

interface CustomRoutingControlOptions extends L.Routing.RoutingControlOptions {
  language?: string;
}

// Configurar el idioma español para las rutas
L.Routing.control({
  language: 'es',
} as CustomRoutingControlOptions);

// Creación del mapa
const mymap = new L.Map('map').setView([0, 0], 18);

// Añadir capa de tiles al mapa
tileLayerSelect().addTo(mymap);

// Inicialización de variables
let userMarker: L.Marker<any> | null = null;
let routingControl: L.Routing.Control | null = null;

// Icono para el marcador del usuario
const redMarkerIcon = L.icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Función para actualizar la ubicación del usuario
const updateUserLocation = (position: GeolocationPosition) => {
  const { latitude, longitude } = position.coords;
  const userLatLng: L.LatLng = L.latLng(latitude, longitude);

  if (userMarker) {
    userMarker.setLatLng(userLatLng);
  } else {
    userMarker = L.marker(userLatLng, { icon: redMarkerIcon })
      .bindPopup('Ubicación actual')
      .addTo(mymap);
  }

  mymap.panTo(userLatLng);
};

// Obtener la ubicación del usuario
navigator.geolocation.watchPosition(
  (position) => {
    updateUserLocation(position);
  },
  (error) => {
    console.error('Error al obtener la ubicación:', error);
  },
  { enableHighAccuracy: true }
);

// Crear marcadores azules
const blueMarkers: L.Marker[] = drinkWaterSoraluze.map((point) => {
  const marker = L.marker([point.lat, point.lgn]).addTo(mymap);

  let description;
  switch (point.name) {
    case "Edificio Central":
      description = "Este es el edificio principal de la universidad.";
      break;
    case "EDI":
      description = "Edificio de Ingeniería y Diseño.";
      break;
    case "Centro de Psicologia Clinica":
      description = "Aquí se ofrecen servicios de psicología clínica.";
      break;
    default:
      description = "No hay descripción disponible.";
  }

  const popupContent = `
    <h3>${point.name}</h3>
    <p>${description}</p>
    <img src="${point.imageUrl}" alt="${point.name}" width="200">
  `;
  
  const popup = L.popup().setContent(popupContent);
  marker.bindPopup(popup);

  // Agregar el botón "Calcular Ruta" al popup
  const calculateRouteButton = L.DomUtil.create('button', 'calculateRoute');
  calculateRouteButton.textContent = 'Calcular Ruta';
  popup.setContent(popup.getContent() + calculateRouteButton.outerHTML);

  return marker;
});

// Ajustar el mapa para que se ajuste a todos los marcadores
mymap.fitBounds([
  ...drinkWaterSoraluze.map((point) => [point.lat, point.lgn] as [number, number]),
]);

// Función para calcular la ruta
function calculateRoute(start: L.LatLng, end: L.LatLng) {
  if (!start || !end) {
    return;
  }

  if (routingControl) {
    routingControl.remove();
  }

  const routingOptions: CustomRoutingControlOptions = {
    waypoints: [start, end],
    routeWhileDragging: true,
    addWaypoints: false,
    language: 'es', // Establecer el idioma a español
  };

  routingControl = L.Routing.control(routingOptions).addTo(mymap);

  // Agregar el botón "Salir de la ruta" al mapa
  const exitRouteButton = L.DomUtil.create('button', 'exitRoute');
  exitRouteButton.textContent = 'Salir de la ruta';
  exitRouteButton.addEventListener('click', () => {
    if (routingControl) {
      routingControl.remove();
      routingControl = null;
    }
  });
  mymap.getContainer().appendChild(exitRouteButton);
}

// Evento para manejar el clic en el botón de calcular ruta
mymap.on('popupopen', (e) => {
  const popupElement = e.popup.getElement();
  if (popupElement) {
    const calculateRouteButton = popupElement.querySelector('.calculateRoute');
    if (calculateRouteButton) {
      calculateRouteButton.addEventListener('click', () => {
        const userLatLng = userMarker?.getLatLng();
        const markerLatLng = e.popup.getLatLng();

        if (userLatLng && markerLatLng) {
          calculateRoute(userLatLng, markerLatLng);
        }
      });
    }
  }
});