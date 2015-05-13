var app = angular.module("app", ["ngRoute", "ngAnimate"]);
app.config(['$routeProvider', function($routeProvider){
    $routeProvider.when('/millennial-movers',{
        templateUrl: 'views/millennial-movers.html',
        controller: 'moversCtrl'
    }).when('/', {
        templateUrl: 'views/millennial-region.html',
        controller: 'regionCtrl'
    }).when('/millennial-migration', {
        templateUrl: 'views/millennial-migration.html',
        controller: 'migrationCtrl'
    })
        .otherwise({
        redirectTo:''
    });
}])

app.factory('pieFactory', function(){
    var service = {};

    //add function necessary for mapping:

    //pie data function ---very important
    service.pieData = function(features){
        var data = []
        for(var i=0; i<features.length; i++){
            var featureProperties = features[i].properties;
            var objArray = []
            for(var j=18; j<23; j++){
                var obj = {
                    "name": Object.keys(featureProperties)[j],
                    "value":featureProperties[Object.keys(featureProperties)[j]],
                    "lat": parseFloat(featureProperties.INTPTLAT10),
                    "lon": parseFloat(featureProperties.INTPTLON10),
                    "area": featureProperties.millennial_movers_Geography

                }
                objArray.push(obj);
            }
            data.push(objArray);
        }

        return data;
    }

    service.explode = function(x){
        var offset = 10;
        var angle = (x.startAngle + x.endAngle) / 2;
        var xOff = Math.sin(angle)*offset;
        var yOff = -Math.cos(angle)*offset;
        return "translate("+xOff+","+yOff+")";
    }

    service.implode = function(x){
        var offset = 10;
        var angle = (x.startAngle + x.endAngle) / 2;
        var xOff = Math.sin(angle) / offset;
        var yOff = -Math.cos(angle) / offset;
        return "translate(" + xOff + "," + yOff + ")";
    }




    service.config = {
        m: 5,
        r: 55,
        z: d3.scale.category20(),
        ph: 130,
        pw: 130
    }







    return service;
});

app.factory('mapFactory', function(){

    var service = {};

    service.map = function(canvas){
        var outmap = new  L.Map(canvas, {zoomControl:false}).setView([39.75, -104.95], 9);
        return outmap;
    }





    return service;

});



