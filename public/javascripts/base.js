let map;
let streets;
let wh_streets_fl;
let defaultRenderer;
function init(){
    require([
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/Graphic",
        "esri/geometry/Polyline",
        "esri/widgets/Legend"
    ], function(Map, MapView,FeatureLayer, Graphic,Polyline,Legend) {

        /******************************************************************
         * Create map
         ******************************************************************/
        map = new Map({
            basemap: "topo-vector"
        });

        /******************************************************************
         * Create view
         ******************************************************************/
        let view = new MapView({
            container: "viewDiv",
            map: map,
            center: [114.315051,30.568157],
            zoom: 12
        });

        /******************************************************************
         * define the default renderer
         ******************************************************************/
        defaultRenderer = {
            type: "simple",  // autocasts as new SimpleRenderer()
            symbol: {
                type: "simple-line",  // autocasts as new SimpleMarkerSymbol()
                width: 2,
                color: "#6A5ACD",
            }
        };

        /******************************************************************
         * via url built graphics
         ******************************************************************/
        // region via url build graphics
        //let url = "http://47.100.118.128:8080/geoserver/wh/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=wh%3Awh_streets&maxFeatures=4500&outputFormat=application%2Fjson";
        let url = "http://47.100.118.128:8080/geoserver/wh/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=wh%3Awh_streets1&maxFeatures=4592&outputFormat=application%2Fjson";
        $.ajaxSetup({async:false});
        $.getJSON(url,function (geojson) {
            streets = Terraformer.ArcGIS.convert(geojson);
        });

        let graphics = [];
        for(let i = 0; i < streets.length; i++) {
            let lineAtt = {
                name: streets[i].attributes.NAME,
                id: streets[i].attributes.id,
                width: streets[i].attributes.width,
                speed: streets[i].attributes.speed,
                cross: streets[i].attributes.cross,
                tran_bus: streets[i].attributes.tran_bus,
                tran_sub: streets[i].attributes.tran_sub,
                diversity: streets[i].attributes.diversity,
                density: streets[i].attributes.density,
                inte: streets[i].attributes.inte,
                choice: streets[i].attributes.choice,
                self_1: streets[i].attributes.self_1,
                cross_1: streets[i].attributes.cross_1,
                tran_1: streets[i].attributes.tran_1,
                diver_1: streets[i].attributes.diver_1,
                density_1: streets[i].attributes.density_1,
                inte_1: streets[i].attributes.inte_1,
                choice_1: streets[i].attributes.choice_1,
                //score: weight[0] * streets[i].attributes.width_1 + weight[1] * streets[i].attributes.cross_1 + weight[2] * streets[i].attributes.subdis_1 + weight[3] * streets[i].attributes.diver_1 + weight[4] * streets[i].attributes.density_1 + weight[5] * streets[i].attributes.inte_1 + weight[6] * streets[i].attributes.chioce_1,
            };

            let graphic = new Graphic({
                geometry: new Polyline(streets[i].geometry),
                attributes: lineAtt,
            });

            graphics.push(graphic);
        }
        // endregion

        /******************************************************************
         * use graphics to create wh_streets feature layer
         ******************************************************************/
        // region use graphics to create wh_streets feature layer
        wh_streets_fl = new FeatureLayer({
            source: graphics,  // array of graphics objects
            objectIdField: "id",
            fields: [{name: "name", type: "string"}, {name: "id", type: "oid"}, {name: "width", type: "long", alias: "宽度"}, {name: "speed", type: "integer", alias: "速度"}, {name: "cross", type: "long", alias: "周边交叉口数量"}, {name: "tran_bus", type: "integer", alias: "周边公交站点数"}, {name: "tran_sub", type: "double", alias: "距最近地铁口"}, {name: "diversity", type: "double", alias: "功能混合度"}, {name: "density", type: "double", alias: "功能密度"}, {name: "inte", type: "double", alias: "全局整合度"}, {name: "choice", type: "double", alias:"全局选择度"},{name: "normalizationScore", type: "double", alias:"最终得分"},
                {name: "self_1", type: "double"},{name: "cross_1", type: "double"},{name: "tran_1", type: "double"}, {name: "diver_1", type: "double"},{name: "density_1", type: "double"},{name: "inte_1", type: "double"},{name: "choice_1", type: "double"},],
            popupTemplate: {
                title: "{Name}",
                content: [
                    {
                        type: "fields",
                        fieldInfos: [
                            {fieldName: "id"}, {fieldName: "width",label: "宽度",}, {fieldName: "speed",label: "速度",}, {fieldName: "cross",label: "周边交叉口个数",}, {fieldName: "tran_bus",label: "周边公交站点个数",}, {fieldName: "tran_sub",label: "到最近地铁口距离",}, {fieldName: "diversity",label: "功能混合度",}, {fieldName: "density",label: "功能密度",}, {fieldName: "inte",label: "全局整合度",}, {fieldName: "choice",label: "全局选择度",},{fieldName: "normalizationScore",label: "最终得分",}
                        ]
                    }
                ]
            },
        });
        wh_streets_fl.renderer = defaultRenderer;
        // endregion

        map.add(wh_streets_fl);

        view
            .when()
            .then(function() {
                return wh_streets_fl.when();
            })

            .then(function(layerView) {
                view.on("click", eventHandler);

                function eventHandler(event) {
                    // the hitTest() checks to see if any graphics in the view
                    // intersect the x, y coordinates of the pointer
                    view.hitTest(event).then(getGraphics);
                }

                let highlight, currentYear, currentName;

                function getGraphics(response) {
                    // the topmost graphic from the hurricanesLayer
                    // and display select attribute values from the
                    // graphic to the user
                    if (response.results.length) {
                        const graphic = response.results.filter(function(result) {
                            return result.graphic.layer === wh_streets_fl;
                        })[0].graphic;

                        const attributes = graphic.attributes;
                        console.log(attributes);
                        showRadarChart(attributes);
                    }
                }
            });

        /******************************************************************
         * UI design
         ******************************************************************/
        //Create a variable referencing the checkbox node
        let streetsLayerToggle = document.getElementById("streetsLayer");
        if(streetsLayerToggle){
            //Listen to the change event for the checkbox
            streetsLayerToggle.addEventListener("change",function(){
                //When the checkbox is checkd(true),set the layer's visibility to true
                wh_streets_fl.visible = streetsLayerToggle.checked;
            });
        }
        const legend = new Legend({
            view: view,
            layerInfos: [{
                layer: wh_streets_fl,
                title: "Legend"
            }]
        });

        view
            .when()
            .then(function() {
                view.ui.add(legend, "bottom-left");
                view.ui.add("changeBaseMap", "bottom-right");
                document.getElementById("changeBaseMap").style.visibility = "visible";
                document.getElementById("layerToggle").style.visibility = "visible";
            });

    });
}

function styleToSatellite() {
    map.basemap = "satellite";
}
function styleToOSM() {
    map.basemap = "osm";
}
function styleToTerrain() {
    map.basemap = "terrain";
}

function updatePage() {
    let weight = getWeight();
    //wh_streets_fl.renderer = classRenderer();
    const edit = {
        updateFeatures: updateGraphics(weight),
    };
    wh_streets_fl
        .applyEdits(edit)
        .then(function(info){
            console.log(info);
        })
        .catch(function(error){
           console.log(error);
        });
    console.log(streets);
    console.log(wh_streets_fl);
}

/******************************************************************
 * from index.ejs get the users weight
 ******************************************************************/
function getWeight(){
    let self_wt = document.getElementById("self_input");
    let cross_wt = document.getElementById("cross_input");
    let tran_wt = document.getElementById("tran_input");
    let diver_wt = document.getElementById("diver_input");
    let density_wt = document.getElementById("density_input");
    let inte_wt = document.getElementById("inte_input");
    let choice_wt = document.getElementById("choice_input");
    let weight = [self_wt.value, cross_wt.value, tran_wt.value, diver_wt.value, density_wt.value, inte_wt.value, choice_wt.value];
    console.log(weight);
    return weight;
}

function updateGraphics(weight){
    //let graphics = [];
    let update_graphics = [];

    let streetsAtt = [];
    for(let i = 0; i < streets.length; i++){
        let streetAtt = {
            id: streets[i].attributes.id,
            score: weight[0]*streets[i].attributes.self_1 + weight[1]*streets[i].attributes.cross_1 + weight[2]*streets[i].attributes.tran_1 + weight[3]*streets[i].attributes.diver_1 + weight[4]*streets[i].attributes.density_1 + weight[5]*streets[i].attributes.inte_1 + weight[6]*streets[i].attributes.choice_1,
            normalizationScore: 0
        };
        streetsAtt.push(streetAtt);
    }
    let maxscore = 0;
    let minscore = 999999;
    for(let i = 0; i < streets.length; i++){
        if(streetsAtt[i].score > maxscore)
            maxscore = streetsAtt[i].score;
        if(streetsAtt[i].score < minscore)
            minscore = streetsAtt[i].score;
    }
    console.log(maxscore);
    console.log(minscore);
    let k = 100 / (maxscore - minscore);
    let b = - k * minscore;
    for(let i = 0; i < streets.length; i++){
        streetsAtt[i].normalizationScore = k * streetsAtt[i].score + b;
        //console.log(streetsAtt[i].normalizationScore);
        require([
            "esri/Graphic",
            "esri/geometry/Polyline",
        ], function(Graphic,Polyline) {
            let graphic = new Graphic({
                geometry: new Polyline(streets[i].geometry),
                attributes: streetsAtt[i],
            });
            update_graphics.push(graphic);
        });
    }

    //console.log(wh_streets_fl);
    return update_graphics;
}

function svColorRampRenderer(){
    updatePage();
    const defaultSym = {
        type: "simple-line", // autocasts as new SimpleFillSymbol()
        width: 2,
        color: "lightgray",
    };

    /*****************************************************************
     * Set a color visual variable on the renderer. Color visual variables
     * create continuous ramps that map low data values to weak or
     * neutral colors and high data values to strong/deep colors. Features
     * with data values in between the min and max data values are assigned
     * a color proportionally between the min and max colors.
     *****************************************************************/

    const rendererF1 = {
        type: "simple", // autocasts as new SimpleRenderer()
        symbol: defaultSym,
        label: "Streets",
        visualVariables: [
            {
                type: "color",
                field: "normalizationScore",
                //normalizationField: "normalizationScore",
                legendOptions: {
                    title: "scores of streets"
                },
                stops: [
                    {
                        value: 0,
                        color: "#FFCCCC",
                        label: "0"
                    },
                    {
                        value: 100,
                        color: "#FF0099",
                        label: "100"
                    }
                ]
            }
        ]
    };
    wh_streets_fl.renderer = rendererF1;
}

function svBreakClassRenderer(){
    /******************************************************************
     * define the class-breaks renderer
     ******************************************************************/
    updatePage();
    // region define the class-breaks renderer
    const less20 = {
        type: "simple-line",
        color: "#FFFF00",
        width: "2px",
    };
    const less40 = {
        type: "simple-line",
        color: "#FFD700",
        width: "2px",
    };
    const less60 = {
        type: "simple-line",
        color: "#FFA500",
        width: "2px",
    };
    const less80 = {
        type: "simple-line",
        color: "#D2691E",
        width: "2px",
    };
    const less100 = {
        type: "simple-line",
        color: "#8B4513",
        width: "2px",
    };
    const rendererF2 = {
        type: "class-breaks",
        field: "normalizationScore",
        classBreakInfos: [
            {
                minValue: 0,
                maxValue: 20,
                symbol: less20,
            },
            {
                minValue: 20,
                maxValue: 40,
                symbol: less40,
            },
            {
                minValue: 40,
                maxValue: 60,
                symbol: less60,
            },
            {
                minValue: 60,
                maxValue: 80,
                symbol: less80,
            },
            {
                minValue: 80,
                maxValue: 100,
                symbol: less100,
            }
        ]
    };
    wh_streets_fl.renderer = rendererF2;
    // endregion

}

function svdefaultRenderer(){
    updatePage();
    wh_streets_fl.renderer = defaultRenderer;
}

function showRadarChart(street) {
    let myChart = echarts.init(document.getElementById('RadarChart'));

    var dataStreet = [
        [street.self_1,street.cross_1,street.tran_1,street.diver_1,street.density_1,street.inte_1,street.choice_1],
    ];

    var lineStyle = {
        normal: {
            width: 1,
            opacity: 0.5
        }
    };

    option = {
        backgroundColor: '#F8F8FF',
        title: {
            text: '街道活力各因子贡献度',
            left: 'center',
            textStyle: {
                color: '#DC143C',
                fontFamily: '楷体',
            }
        },

        radar: {
            indicator: [
                {name: 'Self', max: 100},
                {name: 'Cross', max: 100},
                {name: 'Tran', max: 100},
                {name: 'Diversity', max: 100},
                {name: 'Density', max: 100},
                {name: 'Inte', max: 100},
                {name: 'Choice', max: 100}
            ],
            shape: 'circle',
            splitNumber: 4,
            name: {
                textStyle: {
                    color: 'rgb(85,107,47)',
                    fontSize: 15,
                    fontFamily: "黑体",
                }
            },
            splitLine: {
                lineStyle: {
                    color: [
                        'rgba(255,0,0, 0.3)', 'rgba(255,0,0, 0.4)',
                        'rgba(255,0,0, 0.5)', 'rgba(255,0,0, 0.6)',
                        'rgba(255,0,0, 0.8)'
                    ].reverse()
                }
            },
            splitArea: {
                show: false
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(255,99,71, 0.8)'
                }
            }
        },
        series: [
            {
                name: street.name,
                type: 'radar',
                lineStyle: lineStyle,
                data: dataStreet,
                symbol: 'none',
                itemStyle: {
                    normal: {
                        color: '#DB7093'
                    }
                },
                areaStyle: {
                    normal: {
                        opacity: 0.3
                    }
                }
            }
        ]
    };
    // 使用刚指定的配置项和数据显示图表。
    myChart.setOption(option);
}