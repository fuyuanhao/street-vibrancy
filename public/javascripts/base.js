var map;
function init(){
    require([
        "esri/Map",
        "esri/views/MapView"
    ], function(Map, MapView) {

        map = new Map({
            basemap: "topo-vector"
        });

        var view = new MapView({
            container: "viewDiv",
            map: map,
            center: [114.315051,30.568157],
            zoom: 12
        });
    });
}
