require([
            "esri/Map",
            "esri/views/MapView",
            "esri/layers/CSVLayer",
            "esri/widgets/Legend",
            "esri/widgets/Expand",
            'esri/widgets/BasemapGallery', //prepinatko mezi podkladovymi mapami
            'esri/widgets/ScaleBar', //meritko
      ],(
            Map,
            MapView,
            CSVLayer,
            Legend,
            Expand,
            BasemapGallery,
            ScaleBar,
      ) => {
            //default symbology for unproper data
            const defaultSym={
                  type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
                  color: [0,0,0,0],
                  outline: {
                        width: 0
                  }
            };

            //SYMBOLOGY FOR PM10
            const rendererPM10={
                  type: "simple", // autocasts as new SimpleRenderer()
                  symbol: defaultSym, // the default symbol defined in step 1
                  label: "PM10 concentration μg/m³", // label for the legend
                  visualVariables: [
                        //SYMBOLOGY: color of point is equal to amount of measured pollution
                        {
                              type: "color", // indicates this is a color visual variable
                              field: "PM10", // total mass of particles in 1 m3 of air
                              legendOptions: {
                                    title: "PM 10 concentration μg/m³"
                              },
                              stops: [
                                    {
                                          value: 10, // features where < 10ug/m3
                                          color: "#2b83ba", // will be assigned this color 
                                          label: "Good" // label to display in the legend
                                    },{
                                          value: 25,
                                          color: "#abdda4",
                                          label: "Moderate"
                                    },{
                                          value: 50,
                                          color: "#ffffbf",
                                          label: "Unhealthy for sensitive groups"
                                    },{
                                          value: 100,
                                          color: "#fdae61",
                                          label: "Unhealthy"
                                    },{
                                          value: 200,
                                          color: "#d7191c",
                                          label: "Hazardous"
                                    },{
                                          value: 500,
                                          color: "#6C0BA9",
                                          label: "Very Hazardous"
                                    }
                              ]
                        },

                        //SYMBOLOGY: opacity of point is equal to accuracy
                        {
                              type: "opacity",
                              field: "ACCURACY",
                              legendOptions: {
                                    title: "Accuracy of GPS represented by point opacity"
                              },
                              stops: [
                                    {
                                          value: 5,
                                          opacity: 1,
                                          label: "Good"
                                    },{
                                          value: 40,
                                          opacity: 0.8,
                                          label: "Moderate"
                                    },{
                                          value: 80,
                                          opacity: 0.6,
                                          label: "Lacking"
                                    },{
                                          value: 110,
                                          opacity: 0.4,
                                          label: "Bad"
                                    },{
                                          value: 152,
                                          opacity: 0.2,
                                          label: "Unreliable"
                                    }
                              ]
                        },

                        //SYMBOLOGY: size of point is equal to accuracy
                        {
                              type: "size",
                              field: "ACCURACY",
                              legendOptions: {
                                    title: "Accuracy of GPS represented by point size"
                              },
                              stops: [
                                    {
                                          value: 5,
                                          size: 16,
                                          label: "Good"
                                    },{
                                          value: 40,
                                          size: 40,
                                          label: "Moderate"
                                    },{
                                          value: 80,
                                          size: 60,
                                          label: "Lacking"
                                    },{
                                          value: 110,
                                          size: 80,
                                          label: "Bad"
                                    },{
                                          value: 152,
                                          size: 100,
                                          label: "Unreliable"
                                    }
                              ]
                        }
                  ]
            };

            //SYMBOLOGY FOR PM2,5
            const rendererPM25={
                  type: "simple", // autocasts as new SimpleRenderer()
                  symbol: defaultSym, // the default symbol defined in step 1
                  label: "PM2,5 concentration μg/m³", // label for the legend
                  visualVariables: [
                        //SYMBOLOGY: color of point is equal to amount of measured pollution
                        {
                              type: "color", // indicates this is a color visual variable
                              field: "PM25", // total mass of particles in 1 m3 of air
                              legendOptions: {
                                    title: "PM 2,5 concentration μg/m³"
                              },
                              stops: [
                                    {
                                          value: 10, // features where < 10ug/m3
                                          color: "#2b83ba", // will be assigned this color 
                                          label: "Good" // label to display in the legend
                                    },{
                                          value: 25,
                                          color: "#abdda4",
                                          label: "Moderate"
                                    },{
                                          value: 50,
                                          color: "#ffffbf",
                                          label: "Unhealthy for sensitive groups"
                                    },{
                                          value: 100,
                                          color: "#fdae61",
                                          label: "Unhealthy"
                                    },{
                                          value: 200,
                                          color: "#d7191c",
                                          label: "Hazardous"
                                    },{
                                          value: 500,
                                          color: "#6C0BA9",
                                          label: "Very Hazardous"
                                    }
                              ]
                        },

                        //SYMBOLOGY: opacity of point is equal to accuracy
                        {
                              type: "opacity",
                              field: "ACCURACY",
                              legendOptions: {
                                    title: "Accuracy of GPS represented by point opacity"
                              },
                              stops: [
                                    {
                                          value: 5,
                                          opacity: 1,
                                          label: "Good"
                                    },{
                                          value: 40,
                                          opacity: 0.8,
                                          label: "Moderate"
                                    },{
                                          value: 80,
                                          opacity: 0.6,
                                          label: "Lacking"
                                    },{
                                          value: 110,
                                          opacity: 0.4,
                                          label: "Bad"
                                    },{
                                          value: 152,
                                          opacity: 0.2,
                                          label: "Unreliable"
                                    }
                              ]
                        },

                        //SYMBOLOGY: size of point is equal to accuracy
                        {
                              type: "size",
                              field: "ACCURACY",
                              legendOptions: {
                                    title: "Accuracy of GPS represented by point size"
                              },
                              stops: [
                                    {
                                          value: 5,
                                          size: 16,
                                          label: "Good"
                                    },{
                                          value: 40,
                                          size: 40,
                                          label: "Moderate"
                                    },{
                                          value: 80,
                                          size: 60,
                                          label: "Lacking"
                                    },{
                                          value: 110,
                                          size: 80,
                                          label: "Bad"
                                    },{
                                          value: 152,
                                          size: 100,
                                          label: "Unreliable"
                                    }
                              ]
                        }
                  ]
            };

            let csvLayer;

            //action on file upload
            let fileInput=document.getElementById("file-input");
            fileInput.addEventListener('change',() => {
                  const url=URL.createObjectURL(fileInput.files[0]);
                  csvLayer=new CSVLayer({
                        url: url,
                        latitudeField: 'NORTH',
                        longitudeField: 'EAST',
                        renderer: rendererPM10,
                        title: "PM measurement legend"
                  });
                  map.removeAll();
                  map.add(csvLayer);
                  csvLayer.popupTemplate=popupTemplate;
            },false);

            //action on button change of symbology
            let button10=document.getElementById("button-pm10");
            let button25=document.getElementById("button-pm25");
            button10.onclick = function() {
                  csvLayer.renderer= rendererPM10
            }
            button25.onclick = function() {
                  csvLayer.renderer= rendererPM25
            }

            //setting up the map and view
            const map=new Map({
                  basemap: "gray-vector",
            });
            const view=new MapView({
                  container: "viewDiv",
                  map: map,
                  zoom: 8,
                  center: [15.5,49.8], //priblizne Cesko
            });

            //Legend Widget
            const legendDiv=document.getElementById('legendDiv');
            const legend=new Expand({
                  content: new Legend({
                        view: view,
                        style: "classic",
                  }),
                  container: legendDiv,
                  view: view,
                  expanded: false,
                  layerInfos: [{
                        layer: csvLayer,
                        title: "PM10 μg/m³"
                  }]
            });
            view.ui.add(legend,"top-left");

            const gallery=new Expand({
                  //vytvor prepinac na podkladove mapy
                  content: new BasemapGallery({
                        view: view
                  }),
                  container: basemapDiv,
                  view: view,
                  expanded: false
            });
            //pridej prepinac na podkladove mapy do pohledu na mapu
            view.ui.add(gallery,'top-right');

            //vytvor meritko
            var scaleBar=new ScaleBar({
                  view: view,
                  unit: 'dual', //zobrazi jednak kilometry ale i mile
            });
            //pridej meritko do pohledu na mapu
            view.ui.add(scaleBar,'bottom-left');

            //vytvor vzor popupu (tj. vyskakovaciho okna)
            var popupTemplate={
                  //autocast jako PopupTemplate(), vložím nadpis
                  title: 'PM10: {PM10}μg/m³, PM2,5: {PM25}μg/m³',outFields: ['*'],
            };
            //vložím obsah, odkaz a obrázek
            popupTemplate.content=
                  'PM10: {PM10}μg/m³, <br>PM2,5: {PM25}μg/m³, <br>NORTH: {NORTH}°, <br>EAST: {EAST}°, <br>ACCURACY: {ACCURACY}m, <br>DAY: {DAY}, <br>MONTH: {MONTH}, <br>YEAR: {YEAR}, <br>HOUR: {HOUR}, <br>MINUTE: {MINUTE}, <br>SECOND: {SECOND}';
      });