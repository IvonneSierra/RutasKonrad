import { tileLayer } from "leaflet";
import { tileLayers } from "./data";
import { ITilerlayerOptions } from "./option.interface";


export const tileLayerSelect = () => {
    const layer: string = tileLayers.baseLayers.thunderForest.map.atlas;
    const options: ITilerlayerOptions = {
        minZoom: 0,
        maxZoom: 20,
        attribution: tileLayers.baseLayers.thunderForest.atribution
    };
    return tileLayer(layer, options);
};