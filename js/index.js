/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

	//Timeout 6 sekund
	setTimeout(function(){

		//console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    		document.getElementById('deviceready').classList.add('ready');
		var P1Text = document.getElementById('P1');
		var P2Text = document.getElementById('P2');
		var L1Text = document.getElementById('L1');
		var L2Text = document.getElementById('L2');
		var L3Text = document.getElementById('L3');
		var COUText = document.getElementById('COU');
		// var FRQText = document.getElementById('FRQ');
		// FRQText.innerHTML = 30;
		var btnSave = document.getElementById("btnSave");
		btnSave.disabled = false
		var btnSaveDelay = 10

		var permissions = cordova.plugins.permissions;
		//nastaveni opravneni ke cteni external memory
		permissions.checkPermission(permissions.READ_EXTERNAL_STORAGE, function( status ){
			//if ( status.hasPermission ) {
			if ( status.hasPermission ) {
				console.log("Has permission to read");
			}
			else {
				console.warn("NO permission to read");
				permissions.requestPermission(permissions.READ_EXTERNAL_STORAGE, successPermission, errorPermission);

				function errorPermission() {
					console.warn('Read external memory permission is not turned on');
				}

				function successPermission( status ) {
					if( !status.hasPermission ) errorPermission();
				}
			}
		});
		//nastaveni opravneni ke cteni polohy
		permissions.checkPermission(permissions.ACCESS_FINE_LOCATION, function( status ){
			//if ( status.hasPermission ) {
			if ( status.hasPermission ) {
				console.log("Has permission to read precise location");
			}
			else {
				console.warn("NO permission to read precise location");
				permissions.requestPermission(permissions.ACCESS_FINE_LOCATION, successPermission, errorPermission);

				function errorPermission() {
					console.warn('Read precise location permission is not turned on');
				}

				function successPermission( status ) {
					if( !status.hasPermission ) errorPermission();
				}
			}
		});		
		
		//zde zacina geolokace
		var options = {
			enableHighAccuracy: true,
			timeout: 5000,
			maximumAge: 0,
		};

		function success(pos) {
			var crd = pos.coords;

			console.log('Your current position is not:');
			console.log(`CRD object : ${crd}`);
			L1Text = document.getElementById('L1');
			L2Text = document.getElementById('L2');
			L3Text = document.getElementById('L3');
			L1Text.innerText = crd.latitude;
			L2Text.innerText = crd.longitude;
			L3Text.innerText = crd.accuracy;
		}

		function error(err) {
			console.warn(`chyba prvotniho nacitani GPS, ERROR(${err.code}): ${err.message}`);
		}

		navigator.geolocation.getCurrentPosition(success, error, options);
		//zde konci geolokace
		
		//zde nactu pocatecni datum a cas
		var currentDate = new Date(); 
		
		//zde zacina FILE
		//FILE: vytvoreni a ulozeni souboru
		var stringCurrentDate = currentDate.getFullYear() + '-' + (currentDate.getMonth()+1) + '-' + currentDate.getDate() + '-' + currentDate.getHours() + "-" + currentDate.getMinutes() + "-" + currentDate.getSeconds()
		var fileName = stringCurrentDate + '.csv';
		function onErrorLoadFs(){
			console.log("pruser s fs loading");
		}
		function onErrorCreateFile(){
			console.log("pruser s file creating");
		}
		
		//FILE: definice zapisove funkce
		function writeFile(fileEntry, dataObj) {
			fileEntry.createWriter(function (fileWriter) {
				// fileWriter.onwriteend = function() {
				// 	//console.log("Successful file write...",dataObj);
				// };
				fileWriter.onerror = function (e) {
					console.log("Failed file write: " + e.toString()+dataObj);
				};
				if (!dataObj) {
					dataObj = new Blob(['some file data'], { type: 'text/plain' });
				}
				try {
					fileWriter.seek(fileWriter.length);
				} catch (e) {
					console.log("file doesn't exist!");
				}
				fileWriter.write(dataObj);
			});
		}

		//FILE: prvni zapis hlavicky
		var outputText= "PM10,PM25,NORTH,EAST,ACCURACY,DAY,MONTH,YEAR,HOUR,MINUTE,SECOND"+'\r\n';
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
			fs.root.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
				writeFile(fileEntry, outputText);
			}, onErrorCreateFile);
		}, onErrorLoadFs);
		//zde konci FILE
		
		//zde zacina ovladani odesilaciho knofliku
		btnSave.addEventListener("click", saveMeasurement, false);

		function saveMeasurement(){
			//TODO : po odeslani emailu zamknout knoflik alespon na dalsich 60 sekund
			btnSave.disabled = true
			btnSaveDelay=0

			if(window.confirm("Save measurement?")){
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
					fs.root.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {

						function successCopy(entry) {
							alert("OK: "+ entry.toURL());
						}

						function failCopy(error) {
							console.log(error.code);
						}
										
						var successExternalDataCallback = function(dirData) {
							console.log('successExternalDataCallback: ' + dirData);
							fileEntry.copyTo(dirData, 'PMLOG-' + stringCurrentDate + '.csv', successCopy, failCopy);
						};
							
						//file:///storage/emulated/0/
						window.resolveLocalFileSystemURL("file:///storage/emulated/0/Download", successExternalDataCallback, errorCallback);
						
					}, onErrorCreateFile);
				}, onErrorLoadFs);	
			};
		}

    		//TU POCATEK 1S SMYCKY

		var buffer = [];
		var graph_buffer_p1 = [];
		var graph_buffer_p2 = [];
		var value = 0;
		var pm25_serial = 0;
		var pm10_serial = 0;
		var checksum_is = 0;
		var serial_pos = 0;
		var checksum_ok = 0;

		var errorCallback = function(message) {
			alert('Error: ' + message);
		};
		// request permission first
		serial.requestPermission(
			// if user grants permission
			function(successMessage) {
                // open serial port
                serial.open(
                    {baudRate: 9600},
                    // if port is succesfully opened
                    function(successMessage) {
                        // register the read callback
						serial.registerReadCallback(
							function success(data){
								// decode the received message
								var view = new Uint8Array(data);
								//Timeout 1 sekunda
								setTimeout(function(){
									//nacteni hodnot ze serialu
									if(view.length >= 1) {
										for(var i=0; i < view.length; i++) {
											buffer.push(view[i]);
										}
									}
									while (buffer.length > 0) {
										value = buffer.shift();
										switch (serial_pos) {
											case 0: if (value != 170) { serial_pos = -1; }; break;
											case 1: if (value != 192) { serial_pos = -1; }; break;
											case 2: pm25_serial = value; checksum_is = value; break;
											case 3: pm25_serial += (value << 8); checksum_is += value; break;
											case 4: pm10_serial = value; checksum_is += value; break;
											case 5: pm10_serial += (value << 8); checksum_is += value; break;
											case 6: checksum_is += value; break;
											case 7: checksum_is += value; break;
											case 8:
												if (value == (checksum_is % 256)) { checksum_ok = 1; } else { serial_pos = -1; }; break;
											case 9: if (value != 171) { serial_pos = -1; }; break;
										}
										serial_pos++;
										if (serial_pos == 10 && checksum_ok == 1) {
											if ((! isNaN(pm10_serial)) && (! isNaN(pm25_serial))) {
												P1Text.innerText = (pm10_serial/10).toFixed(1);
												P2Text.innerText = (pm25_serial/10).toFixed(1);
												while (graph_buffer_p1.length >= 500) graph_buffer_p1.shift();
												while (graph_buffer_p2.length >= 500) graph_buffer_p2.shift();
												graph_buffer_p1.push(pm10_serial/10);
												graph_buffer_p2.push(pm25_serial/10);
											}
											serial_pos = 0; checksum_ok = 0; pm10_serial = 0.0; pm25_serial = 0.0; checksum_is = 0;
										}
									}
									//konec nacteni hodnot ze serialu

									//vykresleni grafu
									var canvas = document.getElementById("graph");
									var canvas_width = Math.min(document.getElementById("value_out").offsetWidth,500);
									canvas.style.width = canvas_width+"px";
									var graph_offset = Math.max(0,(graph_buffer_p1.length-canvas.width))
									if (canvas.getContext) {
										var ctx = canvas.getContext("2d");
										ctx.clearRect(0,0,canvas.width, canvas.height);
										
										ctx.strokeStyle = "gray";
										ctx.beginPath();
										ctx.moveTo(0,0);
										ctx.lineTo(canvas.width-1,0);
										ctx.lineTo(canvas.width-1,149);
										ctx.lineTo(0,149);
										ctx.lineTo(0,0);
										ctx.stroke();

										ctx.beginPath();
										ctx.moveTo(0,100);
										ctx.lineTo(canvas.width-1,100);
										ctx.stroke();

										ctx.beginPath();
										ctx.moveTo(0,50);
										ctx.lineTo(canvas.width-1,50);
										ctx.stroke();

										var max_p1 = 150;
										for (var i=graph_offset; i < graph_buffer_p1.length; i++) {
											if (graph_buffer_p1[i] > max_p1) { max_p1 = graph_buffer_p1[i]; }
										}

										scaling = (Math.floor(max_p1/100)+1)*100/150;

										ctx.strokeStyle = "rgb(200,0,0)";
										ctx.beginPath();
										ctx.moveTo(0,150-(graph_buffer_p1[graph_offset]/scaling))
										for (var i=graph_offset; i < graph_buffer_p1.length; i++) {
											ctx.lineTo(i-graph_offset, 150-Math.round(graph_buffer_p1[i]/scaling));
											ctx.stroke();
										}

										ctx.strokeStyle = "rgb(0, 0, 200)";
										ctx.beginPath();
										ctx.moveTo(0,150-(graph_buffer_p2[graph_offset]/scaling))
										for (var i=graph_offset; i < graph_buffer_p2.length; i++) {
											ctx.lineTo(i-graph_offset, 150-Math.round(graph_buffer_p2[i]/scaling));
											ctx.stroke();
										}
									}
									//konec vykresleni grafu

									//counter/pocitadlo
									var counter = parseInt(COUText.innerText, 10);
									// //frequency/cetnost zaznamu
									// var frequency = parseInt(FRQText.innerText, 10);
									if (isNaN(counter)) {
										counter = 0;
									}
									if (isNaN(btnSaveDelay)) {
										btnSaveDelay = 10;
									}
									counter = counter + 1; //increment
									COUText.innerText = counter; //save
									btnSaveDelay = btnSaveDelay + 1 // save into btnSaveDelay
									if (btnSaveDelay >= 10) {
										btnSave.disabled = false
										btnSave.innerHTML = "Click to save file"
									}else{
										btnSave.innerHTML = " ...... (" + (10-btnSaveDelay) + "s)"
									}
									// if (counter % frequency == 0) {
									// 	frequency = frequency * 2; //increment
									// 	FRQText.innerText = frequency;
									// 	//event predavajici prumerne udaje na ktery bude listener v arcgis mape a ktery vytvori bod se symbologii dle techto udaju
									// }
									//zde mohu pomoci kontroly na ruzne delitele frekvence spoustet ruzne casovane skripty

									//opetovne nacteni data
									currentDate = new Date();
																			
									//prubezne nacitani geolokace
									//zde zacina geolokace
									var options2 = {
										enableHighAccuracy: true,
										//timeout: 30000,
										timeout: 5000,
										maximumAge: 0,	
									};

									function success2(pos) {
										var crd = pos.coords;

										L1Text.innerText = crd.latitude;
										L2Text.innerText = crd.longitude;
										L3Text.innerText = crd.accuracy;
									}

									function error2(err) {
										console.warn(`chyba prubezneho nacitani GPS, ERROR(${err.code}): ${err.message}`);
									}

									//tady pozor, nenacitam pokazde watch, ze by se postupne navesoval< nestacilo by get?
									navigator.geolocation.watchPosition(success2, error2, options2);
									//zde konci nastaveni prubezneho nacitani geolokace

									//zde zacina zapis	
									var outputText= P1Text.innerHTML+','+
									P2Text.innerHTML+','+
									L1Text.innerHTML+','+
									L2Text.innerHTML+','+
									L3Text.innerHTML+','+
									currentDate.getDate()+','+
									(currentDate.getMonth()+1)+','+
									currentDate.getFullYear()+','+
									currentDate.getHours()+','+
									currentDate.getMinutes()+','+
									currentDate.getSeconds()+'\r\n';

									//ale zapisuj jen kdyz mas zapisovat, tj. kontroluji zda neni prazdny vetsinou prvni zaznam
									if(P1Text.innerHTML!=''){
										window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
											fs.root.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
													writeFile(fileEntry, outputText);
											}, onErrorCreateFile);
										}, onErrorLoadFs);
									}
									//zde konci zapis
								},1000); //tu konec 1 sekundoveho timeoutu
							},errorCallback // error attaching the callback
						);
					},
					errorCallback // error opening the port
				);
			},errorCallback // user does not grant permission
		);
	},6000)//tu konec 6 sekund timeoutu
}
