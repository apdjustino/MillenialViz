app.controller('moversCtrl', function($scope, pieFactory, mapFactory){

    //<editor-fold desc="Controller Variables">
    var map = mapFactory.map("mapCanvas");
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        maxZoom:18,
        attribution: 'Map data (c) <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
    }).addTo(map)
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();

    var svg = d3.select(map.getPanes().overlayPane).append("svg");
    var g = svg.append("g").attr("class", "leaflet-zoom-hide");

    var pie = d3.layout.pie()
        .value(function(d){return d.value});

    var pct = d3.format(",%");
    var comma = d3.format(",");

    var config = pieFactory.config;

    var arc = d3.svg.arc()
        .outerRadius(config.r)
        .innerRadius(0);
    //</editor-fold>

    d3.json("data/millennial_movers.geojson", function(error, counties){

        //custom projection that transforms Leaflet projection to D3 projection --not sure if I can put into factory
        function projectPoint(x, y){
            var point = map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }

        //transform variable uses custom projection to generate path
        var transform = d3.geo.transform({point: projectPoint}),
            path = d3.geo.path().projection(transform);

        var feature = g.selectAll("g")
            .data(counties.features)
            .enter()
            .append("g")
            .attr("class", "group")
            .append("path")
            .attr("d", path)
            .attr("class", "counties");


        //add pie charts
        var pieData = pieFactory.pieData(counties.features);


        //<editor-fold desc="Table Generation">
        //add legend table
        //county totals for legend
        var nonmovers = 0;
        var samecounty = 0;
        var diffcounty = 0;
        var diffstate = 0;
        var abroad = 0;

        for(var i = 0; i<pieData.length; i++){
            // var test = pieData[i][0].value;
            nonmovers += parseInt(pieData[i][0].value);
            samecounty += parseInt(pieData[i][1].value);
            diffcounty += parseInt(pieData[i][2].value);
            diffstate += parseInt(pieData[i][3].value);
            abroad += parseInt(pieData[i][4].value);
        }


        var statewideData = [
            {"cat":"Non-Movers", "val":nonmovers},
            {"cat":"Moved from same county", "val":samecounty},
            {"cat":"Moved from different county", "val":diffcounty},
            {"cat":"Moved from out of state", "val":diffstate},
            {"cat":"Moved from abroad", "val":abroad}
        ];

        var table = d3.select("div.view-canvas").append("table");
        table.append("tr")
            .attr("class", "header")
            .append("th")
            .text("Color");
        table.select("tr.header")
            .append("th")
            .text("Category")
        table.select("tr.header")
            .append("th")
            .text("Statewide");

        var row = table.selectAll("tr.body")
            .data(statewideData)
            .enter()
            .append("tr")
            .attr("class", "body");

        d3.selectAll("tr.body").selectAll("td.legend")
            .data([1])
            .enter()
            .append("svg")
            .attr("height","25")
            .attr("width","25")
            .append("circle")
            .attr("cx", "12.5")
            .attr("cy", "12.5")
            .attr("r", "10")
            .attr("stroke", "black")


        d3.selectAll("circle")
            .data(statewideData)
            .attr("fill", function(d,i){return config.z(i)})

        d3.selectAll("tr.body").selectAll("td.data")
            .data(function(d){return d3.entries(d)})
            .enter()
            .append("td")
            .attr("class", "data")
            .text(function(d){return d.value;});
        //</editor-fold>


        //<editor-fold desc="Pie Charts">
        //add pie charts
        var svg2 = d3.select(map.getPanes().overlayPane).selectAll("div")
            .data(pieData)
            .enter()
            .append("div")
            .attr("class", "svgContainer")
            .style("position", "absolute")
            .style("top", function(d,i){
                var x = pieData[i][0].lon;
                var y = pieData[i][0].lat;
                var coord = map.latLngToLayerPoint(new L.LatLng(y, x))
                return (coord.y - 60) + "px";
            })
            .style("left", function(d,i){
                var x = pieData[i][0].lon;
                var y = pieData[i][0].lat;
                var coord = map.latLngToLayerPoint(new L.LatLng(y, x))
                return (coord.x - 60) + "px";
            })
            .append("svg:svg")
            .attr("class", "pieChart")
            .attr("height", config.ph)
            .attr("width", config.pw)
            .style("opacity", "0.6")
            .append("svg:g")
            .attr("transform", "translate(" + (config.r+config.m) + "," + (config.r+config.m) + ")")
            .attr("class", "pieChart");
        //.style("opacity", "0.6");




        var gPie = svg2.selectAll("path")
            .data(pie)
            .enter()
            .append("g")
            .attr("class", "arc");



        gPie.append("svg:path")
            .attr("d", arc)
            .attr("class", "slice")
            .style("fill", function(d,i){return config.z(i);});

        gPie.append("text")
            .attr("dy", ".25em")
            .attr("transform", function(d,i){
                return "translate(" + 3.2 * arc.centroid(d)[0] +"," + 3.2 * arc.centroid(d)[1] + ")";
            })
            .attr("dy", ".35em")
            .attr("visibility", "hidden")
            .style("text-anchor", "middle")
            .text(function(d){
                var angle = (d.endAngle - d.startAngle) / ( 2 * Math.PI)
                return pct(angle);
            })
        //</editor-fold>


        //<editor-fold desc="Events">
        d3.selectAll("svg.pieChart")
            .on("mouseenter", function(d){
                var data = d;
                var element = this;
                d3.selectAll("svg.pieChart").style("opacity", function(){return (this === element)? 1.0 : 0.0})
                    .attr("height", config.ph *2)
                    .attr("width", config.pw * 2)
                    .selectAll("g.pieChart")
                    .attr("transform", "translate(" + (2*config.r+config.m) + "," + (2*config.r+config.m) + ")")
                    .selectAll("path").transition()
                    .attr("d",d3.svg.arc().outerRadius(config.r*1.7))
                    .attr("transform", pieFactory.explode);

                gPie.selectAll("text")
                    .attr("visibility", "visible")

                d3.select("tr.header")
                    .append("th")
                    .attr("class", "area")
                    .text(function(d){return data[0].area;});


                var countyData = [];
                for(var i=0; i<data.length; i++){
                    countyData.push({"cat":data[i].name, "val":parseInt(data[i].value)});
                }

                var newcol = row.append("td").attr("class","newcol");
                newcol.data(countyData)
                    .text(function(d){return comma(d.val);})


            })
            .on("mouseleave", function(){
                var element = this;
                d3.selectAll("svg.pieChart").style("opacity", "0.6")
                    .attr("height", config.ph)
                    .attr("width", config.pw)
                    .selectAll("g.pieChart")
                    .attr("transform", "translate(" + (config.r+config.m) + "," + (config.r+config.m) + ")")
                    .selectAll("path").transition()
                    .attr("d",d3.svg.arc().outerRadius(config.r))
                    .attr("transform", pieFactory.implode);

                gPie.selectAll("text")
                    .attr("visibility", "hidden")

                d3.select("th.area")
                    .remove();

                d3.selectAll("td.newcol").remove();



            });
        //</editor-fold>






        //<editor-fold desc="Reset Function">
        map.on("viewreset", reset());
        reset();

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
        //</editor-fold>






    });


});
