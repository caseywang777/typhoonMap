var eventarea = "https://raw.githubusercontent.com/Penny8336/mapExample/master/total.geojson";
var townArea = "https://raw.githubusercontent.com/Penny8336/DV-homework2/master/taiwantown.json";
var name_index = [
	{ index: 0 },
	{ index: 0, name: "105-09-27梅姬颱風" },
	{ index: 74, name: "105-09-18莫蘭蒂颱風" },
	{ index: 90, name: "105-07-08尼伯特颱風" },
	{ index: 96, name: "104-08-08蘇迪勒颱風" },
	{ index: 115, name: "104-05-20豪雨淹水範圍" },
	{ index: 122, name: "103-09-21鳳凰颱風" },
	{ index: 123, name: "103-08-07豪雨" },
	{ index: 128, name: "103-07-22麥德姆颱風" },
	{ index: 133, name: "103-06-03豪雨" },
	{ index: 152, name: "102-08-31豪雨" },
	{ index: 158, name: "102-08-29康芮颱風" },
	{ index: 233, name: "102-08-22潭美颱風" },
	{ index: 239, name: "101-08-24天秤颱風" },
	{ index: 244, name: "101-08-01蘇拉颱風" },
	{ index: 302, name: "101-06-10豪雨" },
	{ index: 347, name: "100-08-28南瑪都颱風" },
	{ index: 365, name: "100-10-02豪雨" },
	{ index: 369, name: "99-10-21梅姬颱風" },
	{ index: 383, name: "99-09-19凡那比颱風" },
	{ index: 497, name: "98-10-04芭瑪颱風" },
	{ index: 506, name: "98-08-08莫拉克颱風" },
	{ index: 682, name: "97-09-28薔蜜颱風" },
	{ index: 691, name: "97-09-14辛樂克颱風" },
	{ index: 698, name: "97-07-18卡玫基颱風" },
	{ index: 918, name: "96-08-18聖帕颱風" },
	{ index: 920, name: "94-06-12豪雨" },
	{ index: 1014, name: "94-易淹水調查" },
	{ index: 1163, name: "93-12-03南瑪都颱風" },
	{ index: 1166, name: "93-08-25艾利颱風" },
	{ index: 1167, name: "93-07-02水災" },
	{ index: 1231 }
];

//tootip
var divbar = d3.select("#town")
var projection = d3.geoMercator().center([124, 25]).scale(7000)
var path = d3.geoPath().projection(projection) //創造path
var active = d3.select(null);

var svg = d3.select("#taiwan").append("svg")
	.attr("height", 800)
	.attr("width", 500)
	.attr("class", "fortaiwan")
	.call(d3.zoom()
	.on("zoom", function () {
		d3.select("#taiwan").select("svg").selectAll("g")
			.attr("transform", d3.event.transform)
		var temp = document.getElementById('area').transform.baseVal[1].matrix.a
		if (temp >= 8) {
			d3.select("#area").attr("class", "detail")
			d3.select("#map").attr("class", "featuredetail")
		}
		else if (temp < 8) {
			d3.select("#area").attr("class", "area")
		}
	}))
var g = svg.append("g")
var flag = 0
function drawMap(err, Tgeojson) {
	
	if (err) throw err
	g.selectAll("path")
		.data(Tgeojson.features)
		.enter().append("path")
		.attr("d", path)
		.attr("class", "feature")

	d3.json(eventarea, drawEachArea)

	function drawEachArea(err, geojson) {
		d3.json(townArea, townareaf)

		function townareaf(err,tjosn){
		
		if (err) throw err
		//Drop-down menu
		var select = d3.select("#choose").append("select")
			.attr("class", "pretty-select")
			.attr("id", "selections")
			.on('change', onchange);

		select.selectAll("option")
			.data(name_index)
			.enter().append("option")
			.attr("value", function (d) {return d.index;})
			.text(function (d) {return d.name;})

		function onchange() {
			if (flag == 4){
				d3.selectAll("#area").remove()
				d3.selectAll("#barchartID").remove()
				flag = 0
			}
			// 
			d3.selectAll(".forhistogram").remove()
			d3.selectAll("#town").remove()
			var myselect = document.getElementById("selections")
			var index = myselect.selectedIndex;
			var start = myselect.options[index].value
			var end = myselect.options[index + 1].value
			var area = geojson.features
			var choosearea = area.slice(start, end)
			var statistics = []
			var tyName = myselect.options[index].text
			//arrange
			for (i = start; i < end; i++) {
				var getAttr = geojson.features[i].properties
				var countyCode = getAttr.COUNTYCODE
				var countyName = getAttr.COUNTYNAME
				var townName = getAttr.TOWNNAME
				var name = getAttr.name //有時候name有路名有時候null
				var calArea = turf.area(geojson.features[i]).toFixed(2)
				for (k=0; k<tjosn.features.length; k++){
					if (townName == tjosn.features[k].properties.T_Name){
						var townArea = tjosn.features[k].properties.Area
						console.log(townName,townArea)
						break;
					}
					else{
						var townArea = 0
					}
				}
				if (statistics.some(statistics => statistics[0].countyCode == countyCode)) {
					var countyIndex = parseInt(statistics.map(function (e) {return e[0].countyCode; }).indexOf(countyCode))
					total = parseInt(statistics[countyIndex][0].eachTown) + parseInt(calArea)
					statistics[countyIndex][0].eachTown = total
					statistics[countyIndex].push({townName:townName,name:name,calArea:calArea, townArea:townArea })
				}
				else {
					statistics.push([{countyCode: countyCode,townName: countyName, eachTown:calArea}])
					var countyIndex = parseInt(statistics.map(function (e) { return e[0].countyCode; }).indexOf(countyCode))
					statistics[countyIndex].push({townName:townName,name:name,calArea:calArea, townArea:townArea })

				}

			}
			document.getElementById("but").onclick = function() {download(statistics,tyName)};

			barChart(statistics,tyName,flag);
			var colorlist = ["area1","area2","area3","area4"]

			//drawarea
			//tootip
			var div = d3.select("#taiwantooltip").append("div")
				.attr("class", "tooltip")
				.style("opacity", 0)
							
			d3.select("#taiwan").select("svg").append("g")
				.attr("class", colorlist[flag])
				.attr("id", "area")
				.selectAll("path")
				.data(choosearea)
				.enter().append("path")
				.attr("d", path)
				.on("mouseover", function (z) {
					console.log(z)
					var name = (z.properties.name)
					var CN = (z.properties.COUNTYNAME)
			
					div.transition()
						.duration(200)
						.style("opacity", .9);
					div.html(CN + z.properties.TOWNNAME + "<br>" + name)
						.style("left", (d3.event.pageX / 2) + "px")
						.style("top", ((d3.event.pageY - 28) / 2) + "px")
					var bar = d3.select("#histogram").select("svg").selectAll("rect")
				})
				.on("mouseout", function (d) {
					div.transition()
						.duration(500)
						.style("opacity", 0);
				})

			
			flag += 1

		}
		//console.log("histogram")
	}//drawarea
}
}

function barChart(statistics,tyName){
	// var barName = d3.select("#town")


	console.log(statistics)

	var groups = d3.map(statistics, function(d){return(d[0].townName)}).keys() //for x axis
	var eachTOWN = d3.map(statistics, function(d){return(d[0].eachTown)}).keys() //for x axis
	var max = eachTOWN.reduce(function (a, b) {return Math.max(a, b);});

	var color1 = ["#B6CED1", "#85C1E9" ,"#3498DB","#2874A6","#1B4F72"]
	var color2 = ["#D7BDE2", "#BB8FCE" ,"#A569BD","#8E44AD","#6C3483"]
	var color3 = ["#A2D9CE", "#ABEBC6" ,"#58D68D","#28B463","#1D8348"]
	var color4 = ["#F5CBA7", "#F0B27A" ,"#EB984E","#E67E22","#CA6F1E"]
	var colorbar = [color1,color2,color3,color4]
	var myColor = d3.scaleThreshold()
		.range(colorbar[flag])
		.domain([max*0.2, max*0.4, max*0.6, max*0.8]);



	var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 330 - margin.left - margin.right,
    height = 380 - margin.top - margin.bottom;

	// append the svg object to the body of the page
	var areaBC = d3.select("#areaBarChart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.attr("id", "barchartID")
		.append("g")
		.attr("transform","translate(" + margin.left + "," + margin.top + ")")
	// Parse the Data
	// X axis
	var x = d3.scaleBand()
		.range([ 0, width ])
		.domain(groups)
		.padding(0.2);
	
	areaBC.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x))
		.selectAll("text")
		.attr("transform", "translate(-10,0)rotate(-45)")
		.style("text-anchor", "end");

	// Add Y axis
	var y = d3.scaleLinear()
		.domain([0, max])
		.range([ height, 0]);
	areaBC.append("g")
		.attr("id", "yaxis")
		.call(d3.axisLeft(y));

	// Bars
	areaBC.selectAll("mybar")
		.data(statistics)
		.enter()
		.append("rect")
		.attr("x", function(d) {return x(d[0].townName); })
		.attr("y", function(d) { return y(d[0].eachTown); })
		.attr("width", x.bandwidth())
		.attr("height", function(d) { return height - y(d[0].eachTown); })
		.attr("fill",  function(d){return myColor(d[0].eachTown)})

	//text
	areaBC.selectAll("mytext")
		.data(statistics)
		.enter()
		.append('text')
		.text(function (d) { return (numeral(d[0].eachTown).format('0,0')); })
		.attr("x", function (d) { return x(d[0].townName); })
		.attr("y", function (d) { return y(d[0].eachTown) -5; })
		.attr("height", function(d) { return height - y(d[0].eachTown); })
		.style("font-size", "11px")

	areaBC.append("text")
		.attr("x",-60)
		.attr("y",-15)
		// .attr('transform', `translate(-50, ${height/2}) rotate(-90)`)
		.attr('fill', '#000')
		.style('font-size', '15px')
		.style("margin-right", "50px")
		.text(tyName);
}

//**** start excel ****/
function convertToCSV(objArray) {
	var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
	var str = '';

	for (var i = 0; i < array.length; i++) {
		var line = '';
		for (var index in array[i]) {
			if (line != '') line += ','

			line += array[i][index];
		}

		str += line + '\r\n';
	}

	return str;
}

function exportCSVFile(headers, items, fileTitle) {
	if (headers) {
		items.unshift(headers);
	}

	// Convert Object to JSON
	var jsonObject = JSON.stringify(items);

	var csv = this.convertToCSV(jsonObject);

	var exportedFilenmae = fileTitle + '.csv' || 'export.csv';

	var blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
	if (navigator.msSaveBlob) { // IE 10+
		navigator.msSaveBlob(blob, exportedFilenmae);
	} else {
		var link = document.createElement("a");
		if (link.download !== undefined) { // feature detection
			// Browsers that support HTML5 download attribute
			var url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute("download", exportedFilenmae);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}
}
function download(NotFormatted,tyName) {
	var headers = {
		// typhoon: "颱風名稱",
		model: "縣市區", // remove commas to avoid errors
		chargers: "Name",
		earphones: "面積",
		cases: "淹水範圍"
	};

	var itemsFormatted = [];

	// format the data
	NotFormatted.forEach((item) => {
		item.forEach((town) => {
			// console.log(town.townName)
			// console.log(town.name)
			// console.log(town.calArea)
			itemsFormatted.push({
				// typhoon: tyName,
				model: town.townName,
				chargers: town.name,
				earphones: town.townArea,
				cases: town.calArea
			})
		})
	});

	var fileTitle = tyName; // or 'my-unique-title'

	exportCSVFile(headers, itemsFormatted, fileTitle); // call the exportCSVFile() function to process the JSON and trigger the download
}

d3.json("https://raw.githubusercontent.com/Penny8336/DV-homework2/master/taiwan.json", drawMap)
// d3.json(townarea, drawMap)

