var mapData;
var container = "#container";
var colorScale = d3.scaleLinear().domain([0, 1]).range(["#ff0000", "#0000ff"]);

var categories = [
  "Overall reported support",
  "Avg support across subcategories",
  "Presidential margin 2016",
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
    scraped = scraped
      .sort((a, b) => {
        return b[1] * 1 - a[1] * 1;
      })
      .filter(s => s[0] != "state_abbrv");

    scraped = scraped.map(function (s) {
      return { name: s[0], val: [s[1] * 1] };
    });

    var element = document.querySelector(container);
    var width = element.offsetWidth * 0.3;
    var xScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([0, width - 105]);

    var xAxis = d3
      .axisBottom()
      .scale(xScale)
      .ticks(4)
      .tickFormat(function (d) {
        if (d != 0) return d * 100;
      });

    var chart = d3
      .select("#charts")
      .append("svg")
      .attr("width", width + 10)
      .attr("height", width * 3)
      .append("g");

    // Add bars to chart.
    var group = chart
      .selectAll(".group")
      .data(scraped)
      .enter()
      .append("g")
      .attr("transform", (d, i) => "translate(0," + i * (25 + 3) + ")");
    chart
      .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(105, ${(scraped.length) * (25 + 3)})`)
      .call(xAxis);

    // Add bar chart of average support per measure.
    group
      .selectAll("rect")
      .data(d => d.val)
      .enter()
      .append("rect")
      .attr("x", d => 105)
      .attr("width", function (d) {
        return xScale(d * 1);
      })
      .attr("height", 25)
      .attr("fill", d => colorScale(d * 1));

    // Render bar values.
    group
      .append("g")
      .attr("class", "value")
      .selectAll("text")
      .data(d => d.val)
      .enter()
      .append("text")
      .text(function (d) {
        return d ? (d * 100).toFixed(0) + "%" : null;
      })
      .attr("class", "bar-text")
      .attr("x", d => xScale(d * 1) + 90)
      .attr("text-anchor", "end")
      .attr("dy", 14);

    // Render bar labels.
    d3.select("#charts")
      .append("ul")
      .attr("class", "labels")
      .attr(
        "style",
        formatStyle({
          width: "80px",
          top: "45px",
          left: "0",
        })
      )
      .selectAll("li")
      .data(scraped)
      .enter()
      .append("li")
      .attr("style", (d, i) =>
        formatStyle({
          width: "100px",
          height: "28px",
          left: "0px",
          top: i * 28 + "px;",
        })
      )
      .attr("class", d => classify(d.name))
      .append("span")
      .text(d => d.name);

    update(mapData, "Overall reported support");
  });
})();

/*
 * Updates data to new measure.
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
  var width = element.offsetWidth * 0.6;

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

function formatStyle(props) {
  var s = "";

  for (var key in props) {
    s += `${key}: ${props[key].toString()}; `;
  }

  return s;
}
