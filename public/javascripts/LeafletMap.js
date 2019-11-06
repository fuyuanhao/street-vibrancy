let map;
function init(){
    map = L.map("map").setView([30.56486, 114.353622], 9);

    //<editor-fold desc="basemap">
    //openstreetmap
    const openstreetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    //mapboxstreet
    const mapboxstreet = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiZnV5dWFuaGFvIiwiYSI6ImNrMjVrNmp3NzA0c2kzaG80cjdvbTdtaGcifQ.ZU5gWBxh_tvH9b2gM5hU4g'
    });
    //谷歌地图
    const GoogleMap = L.tileLayer.chinaProvider('Google.Normal.Map',{
        maxZoom: 18,
        minZoom: 4
    });
    //谷歌影像
    const Googlesatellite = L.tileLayer.chinaProvider('Google.Satellite.Map',{
        maxZoom: 18,
        minZoom: 4
    });
    //高德地图
    const GaoDe = L.tileLayer.chinaProvider('GaoDe.Normal.Map',{
        maxZoom: 18,
        minZoom: 4
    });
    //高德影像
    const Gaodeimgem = L.tileLayer.chinaProvider('GaoDe.Satellite.Map',{
        maxZoom: 18,
        minZoom: 4
    });
    //高德影像标注
    const Gaodeimga = L.tileLayer.chinaProvider('GaoDe.Satellite.Annotion',{
        maxZoom: 18,
        minZoom: 4
    });
    const Gaodeimage = L.layerGroup([Gaodeimgem,Gaodeimga]);
    //Geoq
    const Geoq = L.tileLayer.chinaProvider('Geoq.Normal.Gray',{
        maxZoom: 18,
        minZoom: 4
    });
    //</editor-fold>

    //overlay
    /*const url_wms = 'http://47.100.118.128:8080/geoserver/wh/wms';
    const wh_4326_wms = L.tileLayer.wms(url_wms,{
        layers:'wh:wh_4326',
        format:"image/png",
        crs:L.CRS.EPSG4326,
        opacity:0.7,
        transparent:true
    });*/

    //GeoJSON
    /*
    const url_wh_wfs = "http://47.100.118.128:8080/geoserver/wh/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=wh%3Awh_4326&maxFeatures=50&outputFormat=application%2Fjson";
    const whBorderStyle = {
        "color": "#ff7800",
        "weight": 3,
        "opacity": 0.65
    };
    const wh_4326GeoJSON = L.geoJSON(null,{
        style: whBorderStyle,
        onEachFeature: function (feature,marker) {
            marker.bindPopup('行政区名称：' + feature.properties.NAME +
                '<br>' + '行政区编码：'+ feature.properties.PAC);
        }
    });
    $.ajax({
        url: url_wh_wfs,
        dataType: 'json',
        outputFormat: 'text/javascript',
        success: function(data) {
            wh_4326GeoJSON.addData(data);
        }
    });
    */

    // GDP的GeoJSON服务加载
    const url_wh_wfs = "http://47.100.118.128:8080/geoserver/wh/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=wh%3Awh_4326&maxFeatures=50&outputFormat=application%2Fjson";
    const whBorderStyle = {
        "color": "#ff7800",
        "weight": 3,
        "opacity": 0.65
    };
    const wh_4326GeoJSON = L.geoJSON(null,{
        style: whBorderStyle,
        onEachFeature: onEachFeature,
    });
    $.ajax({
        url: url_wh_wfs,
        dataType: 'json',
        outputFormat: 'text/javascript',
        success: function(data) {
            wh_4326GeoJSON.addData(data);
        }
    });

    //地图要素响应事件
    function onEachFeature(feature,marker) {
        let code = feature.properties.PAC;
        let content = '<div style="width:520px;height:320px;" id="popupwindow"></div>';
        marker.bindPopup(content,{maxWidth: 560});
        marker.on('popupopen',function (e) {
            let myChart = echarts.init(document.getElementById('popupwindow'));
            getDataByCode(code, myChart);
        })
    }

    //属性查询函数
    function getDataByCode(code, myChart){
        let xValue = [];
        let yValue = [];
        $.ajax({
            url:'/GDPQuery?code=' + code,
            type:'get',
            dataType:'json',
            outputFormat:'text/javascript',
            success: function (result) {
                //console.log(result[0].GDP);
                //console.log(result.length);
                if(result){
                    for(let i=0;i<result.length;i++){
                        xValue.push(result[i].year);
                    }
                    for(let i=0;i<result.length;i++){
                        yValue.push(result[i].GDP);
                    }
                    let polygon_name = result[0].polygon_name;
                    //调用ECharts函数生成ECharts图表
                    getChart(xValue,yValue,myChart,polygon_name);
                }
            },
            error: function (result) {
                alert('error::' + result[0] + '---图表请求数据失败');
            }
        })
    }

    //ECharts柱状图生成函数
    function getChart(xValue,yValue,myChart,pro_name){
        //测试值是否正常传递进来
        console.log("xValue:" + xValue);
        console.log("yValue:" + yValue);
        var option = {
            title:{
                text: pro_name + '历年GDP柱状图'
            },
            color:['#3398DB'],
            tooltip:{
                trigger:'axis',
                axisPointer:{
                    type:'shadow'
                }
            },
            grid:{
                left:'3%',
                right:'4%',
                bottom: '6%',
                containLabel:true
            },
            xAxis:[
                {
                    type: 'category',
                    data: xValue,
                    axisTick:{
                        alignWithLabel:true
                    }
                }
            ],
            yAxis:{},
            series:[
                {
                    name: 'GDP(万元)',
                    type: 'bar',
                    barWidth: '40%',
                    data: yValue,
                    //鼠标放在柱状图上时，显示数值
                    itemStyle:{
                        normal:{
                            label:{
                                show: true,
                                position: 'top'
                            }
                        }
                    }
                }
            ]
        };
        //清楚上一次的数据缓存
        myChart.clear();
        //开始制图
        myChart.setOption(option);
    }



    //<editor-fold desc="poi的GeoJSON图层">
    const url_wh_poi = "http://47.100.118.128:8080/geoserver/wh/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=wh%3Apoi&maxFeatures=500&outputFormat=application%2Fjson";
    const whpoiStyle = {
        "color": "#ff7800",
        "weight": 3,
        "opacity": 0.65
    };
    const wh_poiGeoJSON = L.geoJSON(null,{
        style: whpoiStyle,
        onEachFeature: function (feature,marker) {
            marker.bindPopup('名称：' + feature.properties.name +
                '<br>' + '类别：'+ feature.properties.type);
        }
    });
    $.ajax({
        url: url_wh_poi,
        dataType: 'json',
        outputFormat: 'text/javascript',
        success: function(data) {
            wh_poiGeoJSON.addData(data);
        }
    });
    //</editor-fold>

    const baseMaps = {
        "Openstreetmap": openstreetmap,
        "Mapboxstreet": mapboxstreet,
        "谷歌地图": GoogleMap,
        "谷歌影像": Googlesatellite,
        "高德地图": GaoDe,
        "高德影像": Gaodeimage,
        "灰色调": Geoq,
    };
    const overlayMaps = {
        "border": wh_4326GeoJSON,
        "poi": wh_poiGeoJSON
    };

    L.control.layers(baseMaps,overlayMaps).addTo(map);

    //地名解析与查询定位控件
    map.addControl(new L.Control.Search({
        url: 'http://nominatim.openstreetmap.org/search?format=json&q={s}',
        jsonpParam: 'json_callback',
        propertyName: 'display_name',
        textPlaceholder: '地名查询搜索…',
        propertyLoc: ['lat','lon'],
        marker: L.circleMarker([0,0],{radius:30}),
        autoCollapse: true,
        autoType: false,
        minLength: 2
    }));

    //定义搜索控件
    const searchControl = new L.Control.Search({
        //查询的图层
        layer: wh_4326GeoJSON,
        //搜索关键字
        propertyName: 'NAME',
        //Tips
        textPlaceholder: '地图要素搜索…',
        //是否标记
        marker: false,
        //缩放至该图层
        moveToLocation: function(latlng,title,map){
            //放大并弹出属性窗口
            let zoom = map.getBoundsZoom(latlng.layer.getBounds());
            //缩放至该图层
            map.setView(latlng,zoom);
        }
    });
    //搜索控件响应函数
    searchControl.on('search:locationfound',function (e) {
        //定义高亮样式
        e.layer.setStyle({fillColor:'#3f0',color:'#0f0'});
        if(e.layer._popup)
            e.layer.openPopup();
    }).on('search:collapsed',function (e) {
        featuresLayer.eachLayer(function(layer){
            featuresLayer.resetStyle(layer);
        });
    });
    map.addControl(searchControl);
}

