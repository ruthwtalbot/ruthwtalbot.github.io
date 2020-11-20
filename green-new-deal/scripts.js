var mapData;
var container = "#container";
var colorScale = d3.scaleLinear().domain([0, 1]).range(["#ff0000", "#0000ff"]);

var categories = [
  "overall",
  "Clean Air and Water",
  "A carbon price",
  "Job guarantee",
  "Lead removal",
  "Land Conservation",
  "End fossil fuels",
  "Hazardous waste clean up",
  "Agriculture",
  "Manufacturing",
  "Involve workers in decisions",
  "Support Minorities",
  "Clean energy agreements",
  "Public transit",
  "Avg support across",
  "Presidential Margin 2016",
];
/*
 * Initial function for loading map.
 */
(function run() {
  var menu = d3.select("#dropdown");
  menu
    .selectAll("option")
    .data(categories)
    .enter()
    .append("option")
    .text(d => d)
    .attr("value", d => d);
  menu.on("change", e => onSelect(e));

  d3.csv("Overall_GND_Support.csv").then(function (data) {
    mapData = data;
    let scraped = Object.entries(data[49]).slice(1);
    scraped = scraped.sort((a, b) => {
      return b[1] * 1 - a[1] * 1;
    });

    scraped = scraped.map(function(s) {
      return {name: s[0], val: [s[1] * 1]};
    })

    var element = document.querySelector(container);
    var width = element.offsetWidth * 0.33;
    var xScale = d3.scaleLinear().domain([0, 1]).range([0, width]);

    var xAxis = d3
      .axisBottom()
      .scale(xScale)
      .ticks(4)
      .tickFormat(function (d) {
        return d;
      });

    var chart = d3.select("#charts").append("svg").attr("width", width).attr("height", 500).append("g");

    // Render bars to chart.
    var group = chart
      .selectAll(".group")
      .data(scraped)
      .enter()
      .append("g")
      .attr("transform", (d, i) => "translate(0," + i * (20 + 2) + ")");
    chart
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0, 400)")
      .call(xAxis);

    // Add bar chart of average support per measure.
    group
      .selectAll("rect")
      .data(d => d.val)
      .enter()
      .append("rect")
      .attr("x", d => 0)
      .attr("width", function(d) { return xScale(d * 1)})
      .attr("height", 20)
      .attr("fill", d => colorScale(d * 1));

    update(mapData, "overall");
  });
})();

/*
 * Updates data to new slider year selection.
 * @param {number} sliderValue Current slider value.
 */
function onSelect() {
  // Display correct data for the radio button checked.
  var sel = document.getElementById("dropdown");
  update(mapData, sel.options[sel.selectedIndex].value);
}

/*
 * Updates map with new data.
 */
function update(data, property) {
  // Select SVG element
  var containerElement = d3.select("#container");
  var chartElement = containerElement.select("svg");

  var element = document.querySelector(container);
  var width = element.offsetWidth * 0.66;

  // resize map (needs to be explicitly set for IE11)
  chartElement.attr("width", width).attr("height", function () {
    var s = d3.select(this);
    var viewBox = s.attr("viewBox").split(" ");
    return Math.floor((width * parseInt(viewBox[3])) / parseInt(viewBox[2]));
  });

  // Set state colors
  data.forEach(function (state) {
    if (state[property] !== null) {
      var name = state.state_name.split(" ").join("-");
      chartElement
        .select(".state-" + name)
        .attr("class", "state-" + name)
        .attr("fill", function (d) {
          var color;
          if (state[property] == 0) {
            color = "#ccc";
          } else {
            color = colorScale(state[property]);
          }
          return color;
        });
    }
  });

  updateText(data, property, chartElement);
}

function updateText(data, property, element) {
  // Draw state labels
  element
    .append("g")
    .selectAll("text")
    .data(data.filter(d => d.state_name))
    .enter()
    .append("text")
    .attr("text-anchor", "middle")
    .text(function (d) {
      return d.state_abbrv;
    })
    .attr("x", function (d) {
      var className = `state-${classify(d.state_name)}`;

      var tileBox = document.getElementsByClassName(className)[0].getBBox();

      return tileBox.x + tileBox.width * 0.52;
    })
    .attr("y", function (d) {
      var className = "state-" + classify(d.state_name);

      var tileBox = document.getElementsByClassName(className)[0].getBBox();
      var textBox = this.getBBox();
      var textOffset = textBox.height / 3;

      return tileBox.y + tileBox.height * 0.35 + textOffset;
    });

  element
    .selectAll("text")
    .data(data.filter(d => d.state_name))
    .exit()
    .remove();

  element
    .append("g")
    .selectAll("text")
    .data(data.filter(d => d.state_name))
    .enter()
    .append("text")
    .attr("text-anchor", "middle")
    .text(function (d) {
      return parseInt(d[property] * 100) + "%";
    })
    .attr("class", "percent")
    .attr("x", function (d) {
      var className = `state-${classify(d.state_name)}`;

      var tileBox = document.getElementsByClassName(className)[0].getBBox();

      return tileBox.x + tileBox.width * 0.52;
    })
    .attr("y", function (d) {
      var className = "state-" + classify(d.state_name);

      var tileBox = document.getElementsByClassName(className)[0].getBBox();
      var textBox = this.getBBox();
      var textOffset = textBox.height / 1.25;

      return tileBox.y + tileBox.height * 0.5 + textOffset;
    });
}

function classify(name) {
  return name.split(" ").join("-");
}
