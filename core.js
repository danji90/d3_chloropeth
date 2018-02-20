// CHLOROPETH
//Width and height
var w = 1000;
var h = 600;

// color options (reverse colours with reverse())
// fading green: ["rgb(247,252,253)", "rgb(229,245,249)", "rgb(204,236,230)", "rgb(153,216,201)", "rgb(102,194,164)", "rgb(65,174,118)", "rgb(35,139,69)", "rgb(0,109,44)", "rgb(0,68,27)"]
// purple fade to blueish: ["rgb(247,252,253)", "rgb(224,236,244)", "rgb(191,211,230)", "rgb(158,188,218)", "rgb(140,150,198)", "rgb(140,107,177)", "rgb(136,65,157)", "rgb(129,15,124)", "rgb(77,0,75)"]
// red fading to yellow:
// fading red

var colorArray = ["rgb(247,252,253)", "rgb(224,236,244)", "rgb(191,211,230)", "rgb(158,188,218)", "rgb(140,150,198)", "rgb(140,107,177)", "rgb(136,65,157)", "rgb(129,15,124)", "rgb(77,0,75)"]


var color = d3.scale.quantize()
  .range(colorArray);


var projection = d3.geo.winkel3().translate([w / 2, h / 2]).scale([200]);


//Define path generator
var path = d3.geo.path()
  .projection(projection);

//Create SVG element
var svg = d3.select("#map")
  .append("svg")
  .attr("width", w)
  .attr("height", h);


// Load productivity data
d3.json("http://emotional-apps.com/apis/meit/stats/getdata.php?test=1&gender=all&age=all&begindate=2000-01-01&enddate=2018-02-04", function(data) {

  console.log(data)
  // Load colors for domain values
  color.domain([
    d3.min(data, function(d) {
      return parseFloat(d.score_average);
    }),
    d3.max(data, function(d) {
      return parseFloat(d.score_average);
    })
  ]);

  // Load geometry and match state

  d3.json("http://pixel.uji.es/teaching/countries.geo.json.php", function(json) {


    //Merge the ag. data and GeoJSON
    //Loop through once for each ag. data value
    for (var i = 0; i < data.length; i++) {

      //Grab state name
      var dataState = data[i].iso3;

      //Grab data value, and convert from string to float
      var dataValue = parseFloat(data[i].score_average);
      var timeValue = parseFloat(data[i].time_average).toFixed(2);

      //Find the corresponding state inside the GeoJSON
      for (var j = 0; j < json.features.length; j++) {

        var jsonState = json.features[j].id;

        if (dataState == jsonState) {
          //Copy the data value into the JSON
          json.features[j].properties.score_average = dataValue;
          json.features[j].properties.time_average = timeValue
          //Stop looking through the JSON
          break;
        }
      }
    }


    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return "<span>" + d.properties.name + "</span> </br> Score: <span>" + d.properties.score_average + "</span> </br> Time: <span>" + d.properties.time_average + "</span>";
      });
    svg.call(tip);

    svg.selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", function(d) {
        //Get data value
        var score_average = d.properties.score_average;

        if (score_average) {
          //If value exists...
          return color(score_average);
        } else {
          //If value is undefined...
          return "#ccc";
        }
      })
      .on("mouseover", function(e) {
        d3.select(this).classed("highlight", true);
        tip.show(e)
      })
      .on("mouseout", function(e) {
        d3.select(this).classed("highlight", false);
        tip.hide(e)
      })
  });
});
