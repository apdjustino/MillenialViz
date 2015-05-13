app.controller('migrationCtrl', function($scope){

    var margin = {top: 20, right: 80, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .range([0,width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.category10() //TODO change to match DRCOG colors

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var line = d3.svg.line()
        .interpolate("basis")
        .x(function(d){return x(d.age);})
        .y(function(d){return y(d.netMigration);})

    var svg = d3.select("#svgCanvas").append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.left)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    function action(){

        queue()
            .defer(d3.csv, 'data/drcog-migration-csv.csv')
            .await(loadShapes);
    }


    function loadShapes(error, migration) {

        var data = d3.nest()
                    .key(function(d){return d.county;})
                    .entries(migration);


        //console.log(data);

        //set domains for x and y scale functions


        x.domain(d3.extent(migration, function(d){return d.age;}));
        y.domain([
          d3.min(migration, function(c){return +c.netMigration;}),
            10000

        ]);


        //add axis



        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .text("Age")
            .attr("transform", "translate(" + (width-20) + ", -5)")


        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy",".75em")
            .style("text-anchor","end")
            .text("Net Migration")

        var counties = svg.selectAll(".county")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "county")


        counties.append("path")
            .attr("class", "line")
            .attr("d", function(d){console.log(d.values); return line(d.values);})
            .style("stroke", function(d){return color(d.key);})


    }

    action();


});
