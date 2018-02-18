//Width and height
var w = 1200;
var h = 700;

var color = [0xb2182b,0xd6604d,0xf4a582,0xfddbc7,0xf7f7f7,0xd1e5f0,0x92c5de,0x4393c3,0x2166ac].map(function(x) {
    var value = x + "";
    return d3.rgb(value >> 16, value >> 8 & 0xff, value & 0xff).toString();
});

[0xb2182b,0xd6604d,0xf4a582,0xfddbc7,0xf7f7f7,0xd1e5f0,0x92c5de,0x4393c3,0x2166ac]

var color = d3.scale.ordinal().range(color);

// var color = d3.scale.quantize()
//               .range(["rgb(237,248,233)", "rgb(186,228,179)",
//                "rgb(116,196,118)", "rgb(49,163,84)","rgb(0,109,44)"]);
//

//Define map projection
// var projection = d3.geo.aitoff()
// 					   .translate([w/2, h/2])
//                               .scale([200]);


var projection = d3.geo.winkel3().translate([w/2, h/2]).scale([250]);


//Define path generator
var path = d3.geo.path()
         .projection(projection);

//Create SVG element
var svg = d3.select("#map")
      .append("svg")
      .attr("width", w)
      .attr("height", h);




// Load productivity data
d3.json("http://emotional-apps.com/apis/meit/stats/getdata.php?test=1&gender=all&age=all&begindate=2000-01-01&enddate=2018-02-04", function (data){

  console.log(data)
  // Load colors for domain values
  color.domain([
          d3.min(data, function(d) { return d.score_average; }),
          d3.max(data, function(d) { return d.score_average; })
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

      //Find the corresponding state inside the GeoJSON
      for (var j = 0; j < json.features.length; j++) {

        var jsonState = json.features[j].id;

        if (dataState == jsonState) {
          //Copy the data value into the JSON
          json.features[j].properties.score_average = dataValue;
          //Stop looking through the JSON
          break;
        }
      }
    }
    console.log(json)

    var x = d3.scale.linear()
    .domain([1, 10])
    .rangeRound([600, 860]);

    var g = svg.append("g")
        .attr("class", "key")
        .attr("transform", "translate(0,40)");

    g.selectAll("rect")
      .data(color.range().map(function(d) {
        d = color.invertExtent(d);
        if (d[0] == null) d[0] = x.domain()[0];
        if (d[1] == null) d[1] = x.domain()[1];
        return d;
      }))
      .enter().append("rect")
        .attr("height", 8)
        .attr("x", function(d) { return color(d[0]); })
        .attr("width", function(d) { return color(d[1]) - color(d[0]); })
        .attr("fill", function(d) { return color(d[0]); });

    // g.append("text")
    //     .attr("class", "caption")
    //     .attr("x", x.range()[0])
    //     .attr("y", -6)
    //     .attr("fill", "#000")
    //     .attr("text-anchor", "start")
    //     .attr("font-weight", "bold")
    //     .text("Emotional Intelligence");
    //
    // g.call(d3.axisBottom(x)
    //     .tickSize(13)
    //     .tickFormat(function(x, i) { return i ? x : x + "%"; })
    //     .tickValues(color.domain()))
    //   .select(".domain")
    //     .remove();

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
                 });

  });


//Load in GeoJSON data

  //Bind data and create one path per GeoJSON feature

});
