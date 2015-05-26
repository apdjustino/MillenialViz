app.controller('migrationCtrl', function($scope, $compile){

    $scope.countyChecked = {
        Adams: true,
        Arapahoe: true,
        Boulder: true,
        Broomfield: true,
        "Clear Creek": true,
        Denver: true,
        Douglas: true,
        Gilpin: true,
        Jefferson: true,
        Weld: true

    };

    var margin = {top: 20, right: 80, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .range([0,width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var color = d3.scale.ordinal()
        .range(["#4490AF", "#E16B8F", "#A22E3B", "#739B4E", "#E95D22", "#B5BF4F", "#1D4E89", "#9D8169", "#9E61B0", "#D99937", "#FBC254"]);

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
        .attr("class", "main")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    function action(pFunction){

        queue()
            .defer(d3.csv, 'data/drcog-migration-csv.csv')
            .await(pFunction);
    }


    function loadShapes(error, migration) {

        //generate county object based on checked boxes -- must be object to use "in" operator below


        var data = d3.nest()
            .key(function(d){return d.county;})
            .entries(migration);



        console.log(data);
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
            .data(data, function(d){return d.key})
            .enter()
            .append("g")
            .attr("class", "county")


        d3.selectAll(".county").transition().style("opacity","1");


        counties.append("path")
            .attr("class", "line")
            .attr("d", function(d){return line(d.values);})
            .style("stroke", function(d){return color(d.key);})
            .append("title")
            .text(function(d){return d.key});

//add UI checkboxes
        var listItems = d3.select("#check-list").selectAll("li")
            .data(data)
            .enter()
            .append("li")
            .append("div")
            .attr("class", "list-container")

        var uiSvg = listItems.append("svg")
            .attr("height", 5)
            .attr("width", 20)
            .append("line")
            .attr("x1", 0)
            .attr("y1", 2.5)
            .attr("x2", 20)
            .attr("y2", 2.5)
            .style("stroke", function(d){return color(d.key);})
            .style("stroke-width","2")

        listItems.append("label")
            .text(function(d){return d.key;})
            //.style("color", function(d){return color(d.key)})

        var checkBox = listItems
            .append("input")
            .attr("type", "checkbox")
            .attr("ng-model", function(d){return "countyChecked['" + d.key + "']"});

        checkBox[0].forEach(function(val){
            $compile(val)($scope);
        });

    }

    function updateShapes(error, migration){
        var countyObj = {};
        for (var key in $scope.countyChecked){
            if($scope.countyChecked.hasOwnProperty(key)){
                if($scope.countyChecked[key]){
                    countyObj[key] = 0;
                }
            }
        }


        //variable to store queried data
        var queriedData = [];

        //loop through csv file to find data that matches query
        migration.forEach(function(val, index, arr){
            if(val.county in countyObj){
                queriedData.push(val);
            }
        });



        var data = d3.nest()
            .key(function(d){return d.county;})
            .entries(queriedData);

        //console.log(data);

        var counties = d3.selectAll(".county")
            .data(data, function(d){return d.key})
            .exit().transition().duration(750)
            .style("opacity", "0")
            .remove()

        var newCounty = svg.selectAll(".county")
            .data(data, function(d){return d.key})
            .enter()
            .append("g")
            .attr("class","county")


        newCounty.transition().duration(750).style("opacity", "1")

        newCounty.append("path")
            .attr("class", "line")
            .attr("d", function(d){return line(d.values);})
            .style("stroke", function(d){return color(d.key);})
            .append("title")
            .text(function(d){return d.key});





    }
    $scope.$watch('countyChecked', function(nv, ov){
        if(nv !== ov){
            action(updateShapes);
        }
        else{
            action(loadShapes);
        }

    }, true);




});
