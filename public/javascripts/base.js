let map;
function init(){
    require([
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/GeoJSONLayer",
        "esri/layers/FeatureLayer",
        "esri/layers/GraphicsLayer",
        "esri/Graphic",
        "esri/geometry/Polyline",
        "esri/widgets/Legend"
    ], function(Map, MapView,GeoJSONLayer,FeatureLayer,GraphicsLayer, Graphic,Polyline,Legend) {

        map = new Map({
            basemap: "topo-vector"
        });

        let view = new MapView({
            container: "viewDiv",
            map: map,
            center: [114.315051,30.568157],
            zoom: 12
        });

        let url = "http://47.100.118.128:8080/geoserver/wh/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=wh%3Awh_streets&maxFeatures=4500&outputFormat=application%2Fjson";
        const road_graphicslayer = new GraphicsLayer({
            id:"roads",
        });
        var weight = [0.2,0.1,0.1,0.2,0.2,0.1,0.1];
        //Renderer
        const less20 = {
            type: "simple-line",
            color: "#DAA520",
            width: "2px",
        };
        const less50 = {
            type: "simple-line",
            color: "#FFD700",
            width: "2px",
        };
        const more50 = {
            type: "simple-line",
            color: "#FFFF00",
            width: "2px",
        };
        const renderer = {
            type: "class-breaks",
            field: "score",
            classBreakInfos: [
                {
                    minValue: 0,
                    maxValue: 25,
                    symbol: less20,
                },
                {
                    minValue: 25,
                    maxValue: 30,
                    symbol: less50,
                },
                {
                    minValue: 30,
                    maxValue: 50,
                    symbol: more50,
                }
            ]
        };

        //创建graphics
        var graphics = [];
        $.getJSON(url,function (geojson) {
            var arcgisData = Terraformer.ArcGIS.convert(geojson);
            for(let i = 0; i < arcgisData.length; i++){
                let lineAtt = {
                    Name: arcgisData[i].attributes.NAME,
                    id: arcgisData[i].attributes.id,
                    width: arcgisData[i].attributes.WIDTH,
                    speed: arcgisData[i].attributes.speed,
                    cross: arcgisData[i].attributes.cross,
                    bus_num: arcgisData[i].attributes.sub_num,
                    sub_dis: arcgisData[i].attributes.sub_dis,
                    diversity: arcgisData[i].attributes.diversity,
                    density: arcgisData[i].attributes.density,
                    inte: arcgisData[i].attributes.Inte,
                    chioce: arcgisData[i].attributes.Chioce,
                    score: weight[0]*arcgisData[i].attributes.width_1 + weight[1]*arcgisData[i].attributes.cross_1 + weight[2]*arcgisData[i].attributes.subdis_1 + weight[3]*arcgisData[i].attributes.diver_1 + weight[4]*arcgisData[i].attributes.density_1 + weight[5]*arcgisData[i].attributes.inte_1 + weight[6]*arcgisData[i].attributes.chioce_1,
                };
                //console.log(lineAtt.id);
                let graphic = new Graphic({
                    geometry: new Polyline(arcgisData[i].geometry),
                    attributes: lineAtt,
                });
                //road_graphicslayer.graphics.add(graphic);
                graphics.push(graphic);
            }

            const featureLayer = new FeatureLayer({
                source: graphics,  // array of graphics objects
                objectIdField: "id",
                fields: [{name: "Name", type: "string"}, {name: "id", type: "oid"}, {name: "width", type: "integer"}, {name: "speed", type: "integer"}, {name: "cross", type: "double"}, {name: "bus_num", type: "double"}, {name: "sub_dis", type: "double"}, {name: "diversity", type: "double"}, {name: "density", type: "double"}, {name: "inte", type: "double"}, {name: "chioce", type: "double"},{name: "score", type: "double"}],
                popupTemplate: {
                    title: "{Name}",
                    content: [
                        {
                            type: "fields",
                            fieldInfos: [
                                {fieldName: "id"}, {fieldName: "width"}, {fieldName: "speed"}, {fieldName: "cross"}, {fieldName: "bus_num"}, {fieldName: "sub_dis"}, {fieldName: "diversity"}, {fieldName: "density"}, {fieldName: "inte"}, {fieldName: "chioce"},{fieldName: "score"}
                            ]
                        }
                    ]
                },
                renderer: renderer
            });
            map.add(featureLayer);
            //map.layers.add(road_graphicslayer);
        });

        //Create a variable referencing the checkbox node
        let streetsLayerToggle = document.getElementById("streetsLayer");
        //Listen to the change event for the checkbox
        streetsLayerToggle.addEventListener("change",function(){
            //When the checkbox is checkd(true),set the layer's visibility to true
            road_graphicslayer.visible = streetsLayerToggle.checked;
        })

        const legend = new Legend({
            view: view
        });

        view.ui.add(legend, "bottom-left");

    });
}

function styleToSatellite() {
    map.basemap = "satellite";
}
function styleToOSM() {
    map.basemap = "osm";
}
function styleToStreetsVector() {
    map.basemap = "streets-vector";
}
function styleToTerrain() {
    map.basemap = "terrain";
}

