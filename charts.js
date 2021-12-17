function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// *******************DEMOGRAPHICS PANEL*************************
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}
// *******************BUILD CHARTS FUNCTION**********************
function buildCharts(sample) {
  // Use d3.json to load and retrieve the samples.json file 
    d3.json("samples.json").then((data) => {
    // Create separate variables that hold the samples array & meta array. 
      var samples_array = data.samples;
      var meta_array = data.metadata; //add for the gauge (gauge)
    // Create a variable that filters the samples & metagata for the object with the desired sample number.
      var filtered_sample_array = samples_array.filter(sampleObj => sampleObj.id == sample);
      var filtered_meta_array = meta_array.filter(sampleObj => sampleObj.id == sample); //(gauge)
    // Create a variable that holds the first sample in the arrays.
      var initial_sample = filtered_sample_array[0]; 
      var initial_meta = filtered_meta_array[0]; //(gauge)

    // Create variables that hold the otu_ids, otu_labels, sample_values, and washing frequency (meta).
      var otuIds = initial_sample.otu_ids;
      var otuLabels = initial_sample.otu_labels;
      var sampleValues = initial_sample.sample_values;
      var washingFrequency = initial_meta.wfreq; //(gauge)
    //**********************BAR CHART****************************
      var yticks = otuIds.map(id => "OTU" + " " + id).slice(0,10).reverse();
    
      var barTrace = [{
        x: sampleValues.slice(0,10).reverse(),
        y: yticks,
        text: otuLabels,
        type: "bar",
        orientation: "h", 
      }];
      
      var barLayout = {title: "<b>Top 10 Bacteria Cultures</b>"};

      Plotly.newPlot("bar",barTrace,barLayout)

    //************BUBBLE CHART ****************************
      var bubbleTrace = {
          type: 'bubble',
          x: otuIds,
          y: sampleValues,
          hovertext: otuLabels,
          mode: 'markers',
          marker:{
              size: sampleValues,  
              color: otuIds,
              colorscale: 'Earth'  
          }
      };
    
      var bubbleTraced = [bubbleTrace];
    
      var bubbleLayout = {
          xaxis: {title: 'OTU IDs'},
          yaxis: {title: 'Sample Values'},
          title: `<b>Bacteria Clusters, identified as Operational Taxonomic Units (OTUs), discovered in Belly Button of SampleID: ${sample}</b>`,
          hovermode: 'closest'
      };
    
      Plotly.newPlot('bubble',bubbleTraced, bubbleLayout);

  //**************GAUGE CHART *****************************    
      var guageTrace = [{
          domain: { x: [0, 1], y: [0, 1] },
          value: washingFrequency,
          title: { text: "<b>Belly Button Washing Frequency</b><br>Scrubs per Week"},
          type: "indicator",
          mode: "gauge+number",
          gauge: {
            axis: { range: [null, 10] },
            bar: { color: "black" },
            steps: [
              { range: [0, 2], color: "red" },
              { range: [2, 4], color: "orange" },
              { range: [4, 6], color: "yellow" },
              { range: [6, 8], color: "lightgreen" },
              { range: [8, 10], color: "green" }],
            },  
        }];
  
      var gaugeLayout = {
              width: 600,
              height: 550,
              margin: { t: 0, b: 0 } 
              };
    
      Plotly.newPlot("gauge", guageTrace, gaugeLayout); 
  });
}
