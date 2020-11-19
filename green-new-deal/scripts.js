var g;
var mapData;

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
    let scraped = Object.entries(data[50]).slice(1);
    scraped = scraped.sort((a, b) => {
      return b[1] * 1 - a[1] * 1;
    });

    // Add bar chart of average support per measure.
    var chart = d3.select("#charts").append("chart");
    chart
      .selectAll("div")
      .data(scraped)
      .enter()
      .append("div")
      .style("width", function (d) {
        return parseFloat(d[1]) * 200 + "px";
      })
      .style("height", "20px")
      .style("display", function (d) {
        return isNaN(parseFloat(d[1])) ? "none" : "";
      })
      .text(function (d) {
        return d[0] + " (" + d[1] + ")";
      });

    update(mapData, "overall");
  });
})();

/*
 * Updates data to new slider year selection.
 * @param {number} sliderValue Current slider value.
 */
function onSelect() {
  // Display correct data for the radio button checked.
  var sel = document.getElementById('dropdown');
  update(mapData, sel.options[sel.selectedIndex].value);
}

/*
 * Updates map with new data.
 */
function update(data, property) {
  // Select SVG element
  var containerElement = d3.select("#container");
  var chartElement = containerElement.select("svg");

  var container = "#container";
  var element = document.querySelector(container);
  var width = element.offsetWidth * 0.7;

  // resize map (needs to be explicitly set for IE11)
  chartElement.attr("width", width).attr("height", function () {
    var s = d3.select(this);
    var viewBox = s.attr("viewBox").split(" ");
    return Math.floor((width * parseInt(viewBox[3])) / parseInt(viewBox[2]));
  });

  var colorScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range(["#ff0000", "#0000ff"]);

  // Set state colors
  data.forEach(function (state) {
    if (state[property] !== null) {
      var name = state.state_name.split(" ").join("-");
      console.log(name, chartElement);
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
      // .attr("fill", colorScale(state[valueColumn]));
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
    .text(function(d) {
      return d.state_abbrv;
    })
    .attr("x", function(d) {
      var className = `state-${classify(d.state_name)}`;

      var tileBox = document.getElementsByClassName(className)[0].getBBox();

      return tileBox.x + tileBox.width * 0.52;
    })
    .attr("y", function(d) {
      var className = "state-" + classify(d.state_name);

      var tileBox = document.getElementsByClassName(className)[0].getBBox();
      var textBox = this.getBBox();
      var textOffset = textBox.height / 3;

      return tileBox.y + tileBox.height * 0.35 + textOffset;
    });

    element.selectAll('text').data(data.filter(d => d.state_name)).exit().remove();

    element
    .append("g")
    .selectAll("text")
    .data(data.filter(d => d.state_name))
    .enter()
    .append("text")
    .attr("text-anchor", "middle")
    .text(function(d) {
      return parseInt(d[property] * 100) + '%';
    })
    .attr("class", "percent")
    .attr("x", function(d) {
      var className = `state-${classify(d.state_name)}`;

      var tileBox = document.getElementsByClassName(className)[0].getBBox();

      return tileBox.x + tileBox.width * 0.52;
    })
    .attr("y", function(d) {
      var className = "state-" + classify(d.state_name);

      var tileBox = document.getElementsByClassName(className)[0].getBBox();
      var textBox = this.getBBox();
      var textOffset = textBox.height / 1.25;

      return tileBox.y + tileBox.height * 0.5 + textOffset;
    });
}

function classify(name) {
  return name.split(" ").join("-")
}