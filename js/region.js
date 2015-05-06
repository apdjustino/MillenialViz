app.controller('regionCtrl', function($scope, mapFactory){

    var map = mapFactory.map("mapCanvasRegion");
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        maxZoom:18,
        attribution: 'Map data (c) <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(map)

    queue()
        .defer(d3.json('/data/bg10.geojson'))
        .await(loadShapes);

    function projectPoint(x, y){
        var point = map.latLngToLayerPoint(new L.LatLng(y, x));
        this.stream.point(point.x, point.y);
    }

    function reset(){
        //use custom projection (in path object) to dynamically create the boundaries of the svg object
        var bounds = path.bounds(counties),
            topLeft = bounds[0],
            bottomRight = bounds[1];

        svg
            .attr("width", bottomRight[0] - topLeft[0])
            .attr("height", bottomRight[1] - topLeft[1])
            .style("left", topLeft[0] + "px")
            .style("top", topLeft[1] + "px");

        //padding or something ---http://bost.ocks.org/mike/leaflet/
        g   .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
        feature.attr("d", path);
    }

    function loadShapes(error, blockGrp){
        var svg = d3.select(map.getPanes().overlayPane).append("svg");
        var g = svg.append("g").attr("class", "leaflet-zoom-hide");

        var transform = d3.geo.transform({point: projectPoint}),
            path = d3.geo.path().projection(transform);

        var feature = g.selectAll("g")
            .data(blockGrp.features)
            .enter()
            .append("g")
            .attr("class", "group")
            .append("path")
            .attr("d", path)
            .attr("class", "counties");


        map.on("viewreset", reset());
        reset();


    }

});