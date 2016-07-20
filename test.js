// initial settings
//---------------------------------------------------------------------------
var webdriver = require('selenium-webdriver');

var By        = webdriver.By;
var until     = webdriver.until;
var chrome    = require('selenium-webdriver/chrome');

var userName  = "lior.shtivelman@vexigo.com";
var accessKey = "69409b40-ca42-4cea-b9ca-2b16d7c3fcbe";

// var ua        = "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.23 Mobile Safari/537.36";

var driver    = new webdriver.Builder()
				 .setChromeOptions(new chrome.Options()
				 					.setMobileEmulation({deviceName: 'Google Nexus 5'}))
				 //.withCapabilities({ 'userame' : userName, 'accessKey': accessKey})
				 //.usingServer('http://' + userName + ':' + accessKey + '@ondemand.saucelabs.com:80/wd/hub')
				 .forBrowser('chrome')
				 .build();


var Color     = require("colors");

//** 
// main object
//   with methods
//*	
var mainObj = {
	// params
	testUrl : 'http://vis.startscreen.com/news.yahoo.com',
	isAggregated : false,
	tmpVar : "",
	signs : {
		ok :  "\u2714",
		not_ok : "\u2716"
	},
	textToCompare : "",

	// functions
	//-----------------------------------------------------------
	clearIntervalAndCloseBrowser : fnClearIntervalAndCloseBrowser,
	openCategories : fnOpenCategories,
	runScript : fnRunScript,
	checkIfWasRedirectedCorrectly : fnCheckIfWasRedirectedCorrectly,
	openFirstFeed : fnOpenFirstFeed,
	onArticleLoaded:  fnOnArticleLoaded,
	checkValidityOfArticle : fnCheckValidityOfArticle,
	isAggregatedUrl : fnIsAggregated,
	runOnAggregatedFeed : fnRunOnAggregatedFeed,
	runOnNonAggregatedFeed : fnRunOnNonAggregatedFeed
}

// start tests
console.log("****** starting monitoring tests *******");

if (process.argv.length > 0){
	var args = process.argv.slice(2);

	args.forEach((arg, index) => {
		if (arg.indexOf("url=") > -1){
			 mainObj.testUrl = arg.substring(arg.indexOf("=") + 1);
		}

		if (arg.indexOf("is_aggregated") > -1){
			mainObj.isAggregated = mainObj.isAggregatedUrl(arg.split("=")[1]);
		}
	});
}


driver.get(mainObj.testUrl);

setTimeout(function () {
	var counter = 0;
	var articles = [];
	var interval = setInterval(function() {
		var gridItems = driver.findElements(By.className("vis-grid-item"))
				.then(function(items){
					items.forEach((item, index) => {
						item.getAttribute('innerHTML').then(function(html) {
							articles.push(html);
						})
					});

				});

		counter++;				
		if (counter == 5) {
			mainObj.clearIntervalAndCloseBrowser(interval, driver);
			var str = ` * number of articels = ${articles.length} ${mainObj.signs.ok}`;
			console.log(str.green);
			mainObj.runScript();
		}
	}, 1000);
}, 5000);

/// functions
/// =====================================

function fnClearIntervalAndCloseBrowser(interval, browserObj) {
	clearInterval(interval);
}


function fnOpenCategories(){
	driver.executeScript('document.querySelector(".vex-icon-menu").click()');
}

function fnRunScript(){
	var categoryText = "";
	driver.executeScript('return document.querySelector("nav#menuleft ul")').then(
		function(result) {
			if (result == null){
				var msg = ` * Categories menu is missing! ${mainObj.signs.not_ok}`;
				console.log(msg.red);
			}
			else{
				driver.executeScript('return document.querySelector("#menuleft ul").children.length').then(function(result) {					
					if (result == 1){
						console.error(` * No items in categories menu!' ${mainObj.signs.not_ok}`.red);
					}
					else{
						var aggregatedScript = 'return document.querySelectorAll(".child-cat-container")[1]';
						var nonAggregatedPath = '//*[@id="vis-top-bar"]/ul/li[1]/a/span[1]';
						var scriptToRun = mainObj.isAggregated ?  aggregatedScript : nonAggregatedPath;


						if (mainObj.isAggregated){
							mainObj.runOnAggregatedFeed();
						}
						else{
								mainObj.runOnNonAggregatedFeed();
						}


								// 		// click goes here

								// 		return;
								// 		var textElementToCompare = "";
								// 		var msg = ` * There are ${result} items in categories menu ${mainObj.signs.ok}`;
								// 		console.log(msg.green);	
								// 		console.log(' ===> Simulating clicking on first category...');

								// 		console.log(" * aggregated = " + mainObj.isAggregated);

								// 		// setTimeout(function() {
								// 		// 	// get text of first category
								// 		// 	driver.executeScript('return document.querySelectorAll(".vis-master-cat")[1].innerText')
								// 		// 		.then(
								// 		// 				function(text) {
								// 		// 					// console.log("text to compare is " + text);
								// 		// 					textElementToCompare = text;

								// 		// 					driver.findElements(By.className('vis-master-cat'))
								// 		// 						.then(
								// 		// 								function(webElementsArray) {
								// 		// 									webElementsArray[1]
								// 		// 										.click()
								// 		// 										.then(function() {
								// 		// 											setTimeout(
								// 		// 												function() {
								// 		// 													mainObj.checkIfWasRedirectedCorrectly(textElementToCompare);
								// 		// 												},
								// 		// 			 									3000);
								// 		// 										});
								// 		// 								},

								// 		// 								function(err) {
								// 		// 									console.log("something is wrong again....", err);
								// 		// 								}
								// 		// 						);
								// 		// 				},

								// 		// 				function(err) {
								// 		// 					console.error("something is wrong!", err);
								// 		// 				}
								// 		// 			);
								// 		// }, 2000);
								// });

							// })
					}	
				});
			}
		},
		function(err) {
			console.log(err);
		}
	)
}

function fnCheckIfWasRedirectedCorrectly(textToCompare) {
	setTimeout(
		function() {
			setTimeout(function() {
				driver.executeScript('return document.querySelector("#vis-top-bar ul").children[1].children[0].innerText').then(
					function(response) {
						var msg = "";
						if (response == textToCompare){
							console.log(` * page has redirected correctly ${mainObj.signs.ok}`.green);
							mainObj.openFirstFeed();
						}
						else{
							console.error(` !!! page did not redirect correctly !!! ${mainObj.signs.not_ok}`.red);
						}
					}
				);
			}, 4000);	
	}, 2000);
}

function fnOpenFirstFeed() {
	setTimeout(function() {
		driver.executeScript(`
				document.querySelector(".vexMagazineOverlay").style.display = "none";
				var items = document.querySelectorAll(".vis-grid-item");
				items[0].style.display = "block";
				items[0].children[0].children[0].children[1].click();
				`)
					.then(function() {
						setTimeout(function() {
							mainObj.onArticleLoaded();
						}, 5000);	
					});
	}, 1000 * 9);	
}

function fnOnArticleLoaded() {
	var script = `	var banners = document.querySelectorAll(".article-banner-place-holder");
				  	var notLoadedCounter = 0;
			  	  	var loadedCounter = 0;
					for (var i=0; i<banners.length; i++) {
					    if (banners[i].children.length > 0){          
					                loadedCounter++;                  
					    }
					    else {
					       notLoadedCounter++;
					    }
					}

					return  {
					          loadedCounter : loadedCounter,
					          notLoadedCounter : notLoadedCounter,
					          totalBanners : banners.length
					}`;

	console.log(" * waiting 10 seconds for banners to complete loading...");				
	setTimeout(function() {
		driver.executeScript(script)
			.then(function(res) {
				var msg;
				if (res.loadedCounter == res.totalBanners){
					msg = ` * all banners were loaded on page ${mainObj.signs.ok}`;
					console.log(msg.green);
				}
				else {
					msg = ` * not all banners were loaded. ${res.loadedCounter} out of ${res.totalBanners} were loaded ${mainObj.signs.not_ok}`;
					console.log(msg.red);
				}

				mainObj.checkValidityOfArticle(); 	
				
			});		
	}, 1000 * 10);				
}


function fnCheckValidityOfArticle() {
	var script = 'var paragraphs = document.getElementsByTagName("p");' + 
			     'var emptyCounter = 0;' +
				 'for (var i=0; i<paragraphs.length; i++) {' +
	     		 'if (paragraphs[i].innerHTML.length == 0){' +
	           	 'emptyCounter++;' + 
			     '}' +
			 	 '}' +
				'var percentage = (emptyCounter/paragraphs.length) * 100;' + 
				'return percentage;';

	driver.executeScript(script)
		.then(function(response){
			var fullPercentage = 100 - parseFloat(response);
			fullPercentage = parseFloat(fullPercentage.toFixed(2));
			
			if (fullPercentage >= 50){
				var msg = ` * Article is loaded...${fullPercentage}% of paragraphs have text in them ${mainObj.signs.ok}`;
				console.log(msg.green);
			}
			else{
				var err = ` * less then 50% of the paragraphs have text in them. ${mainObj.signs.not_ok}`;
				console.error(err.red);
			}
		});


	// check if social was loaded
	var scriptToExecute = `
							var items = document.querySelector('.vis-social-icons-container').children;
							var counter = 0;   
							for (var i=0; i<items.length; i++) {
							    if (items[i].children.length > 0){
							          counter++;
							    }
							}
			
							return {
								totalNumberOfElements : items.length,
								loaded : counter
							}`;	

	driver.executeScript(scriptToExecute)							
		.then(function(response) {
			var msg = "";
			if (response.loaded == response.totalNumberOfElements){
				msg = ` * All social elements were loaded. ${mainObj.signs.ok}`;
				console.log(msg.green);
			}
			else {
				msg = ` * Loaded ${response.loaded} of ${response.totalNumberOfElements} social elements. ${signs.not_ok}`; 
				console.log(msg.red);
			}

			driver.quit();
		});
}

function fnIsAggregated(value) {
	if (typeof(value) != 'undefined'){
		return (value == 1 || value == '1' || value.toLowerCase() == 'true' || value == true) ? true : false;
	}
	else{
		return false;
	}
}

function fnRunOnAggregatedFeed() {
	driver.findElements(By.className("left-symbol"))
		.then(function(items) {
			items[0]
				.click()
				.then(function() {
					driver.executeScript(`document.querySelector("#menuleft").children[1].children[1].children[0].click()`)
						.then(function(items) {
							setTimeout(function() {
									driver.executeScript('return document.querySelector("#first-cat > a").innerText')
										.then(function(result) {
											mainObj.textToCompare = result;
											driver.executeScript('document.querySelector("#first-cat > a").click()')
												.then(function() {
													setTimeout(function() {
														mainObj.checkIfWasRedirectedCorrectly(mainObj.textToCompare);
													}, 3000);
												});

										})
										
							}, 1000);
						});
				});
		});
}

function fnRunOnNonAggregatedFeed() {
	driver.findElements(By.className("left-symbol"))
		.then(function(items) {
			items[0]
				.click()
				.then(function() {
					driver.executeScript(`document.querySelector("#menuleft").children[1].children[1].children[0].click()`)
						.then(function(items) {
							setTimeout(function() {
									driver.executeScript('return document.querySelector(".vis-master-cat").innerText')
										.then(function(result) {
											mainObj.textToCompare = result;
											driver.executeScript('document.querySelector(".vis-master-cat").click()')
												.then(function() {
													setTimeout(function() {
														mainObj.checkIfWasRedirectedCorrectly(mainObj.textToCompare);
													}, 3000);
												});

										})
										
							}, 1000);
						});
				});
		});
}


