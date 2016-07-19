var webdriver = require('selenium-webdriver');

var By        = webdriver.By;
var until     = webdriver.until;

var userAgent = "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.23 Mobile Safari/537.36";

var driver    = new webdriver.Builder()
				.withCapabilities({'userAgent' : userAgent})
				.forBrowser('chrome', 'ANDROID', 'ANDROID')
				.build();


var Color = require("colors");
// var red = Color(255, 255, 255);
// var green = Color(0, 255, 0);
// var yellow = Color(255, 255, 0);

var signs = {
	ok :  "\u2714",
	not_ok : "\u2716"
}

// var visualizrUrl  = 'http://vis.startscreen.com/trending';
var visualizrUrl  = 'http://vis.startscreen.com/news.yahoo.com';


driver.get(visualizrUrl);
driver.switchTo().alert().accept();

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
		if (counter == 5){
			clearIntervalAndCloseBrowser(interval, driver);
			var str = ` * number of articels = ${articles.length} ${signs.ok}`;
			console.log(str.green);
			// openCategories();
			runScript();
			//driver.quit();
		}
	}, 1000);
}, 5000);

function clearIntervalAndCloseBrowser(interval, browserObj) {
	clearInterval(interval);
	// browserObj.quit();
}


function openCategories(){
	driver.executeScript('document.querySelector(".vex-icon-menu").click()');
}

function runScript(){
	var categoryText = "";
	driver.executeScript('return document.querySelector("nav#menuleft ul")').then(
		function(result) {
			if (result == null){
				var msg = ` * Categories menu is missing! ${signs.not_ok}`;
				console.log(msg.red);
			}
			else{
				driver.executeScript('return document.querySelector("#menuleft ul").children.length').then(function(result) {					
					if (result == 1){
						console.error(` * No items in categories menu!' ${signs.not_ok}`.red);
					}
					else{
						//driver.findElement(By.className("vex-icon-menu")).click().then(
						driver.findElement(By.xpath('//*[@id="vis-top-bar"]/ul/li[1]/a/span[1]'))
							.click()
							.then(
								function() {
									var textElementToCompare = "";
									var msg = ` * There are ${result} items in categories menu ${signs.ok}`;
									console.log(msg.green);	
									console.log(' * Simulating clicking on first category.....');


									setTimeout(function() {
										// get text of first category
										driver.executeScript('return document.querySelectorAll(".vis-master-cat")[1].innerText')
											.then(
													function(text) {
														// console.log("text to compare is " + text);
														textElementToCompare = text;

														driver.findElements(By.className('vis-master-cat'))
															.then(
																	function(webElementsArray) {
																		webElementsArray[1]
																			.click()
																			.then(function() {
																				setTimeout(
																					function() {
																						checkIfWasRedirectedCorrectly(textElementToCompare);
																					},
												 									3000);
																			});
																	},

																	function(err) {
																		console.log("something is wrong again....", err);
																	}
															);
													},

													function(err) {
														console.error("something is wrong!", err);
													}
												);
									}, 2000);


									
										// .click()
										// .then(function(item) {
										// 	setTimeout(function() {
										// 		console.log(' * redirecting.... ');

										
										// 	}, 5000);	
										// });
							});
					}	
				});
			}
		},
		function(err) {
			console.log(err);
		}
	)
}


// function getMenuElement() {
// 	driver.executeScript("")
// }

function checkIfWasRedirectedCorrectly(textToCompare) {
	setTimeout(
		function() {
			// driver.executeScript('document.querySelector("#menuleft ul").children[1].children[1].children[1].children[1].children[0].children[0].click()').then(function(response) {
			// 	//console.log(" * Response is " + response);
			// });	

			// console.log(' * Waiting for page to redirect....');
			setTimeout(function() {
				//driver.executeScript('return window.location.pathname.split("/")').then(function(result) {}, 1500);
				driver.executeScript('return document.querySelector("#vis-top-bar ul").children[1].children[0].innerText').then(
					function(response) {
						var msg = "";
						if (response == textToCompare){
							console.log(` * page has redirected correctly ${signs.ok}`.green);
							openFirstFeed();
						}
						else{
							console.error(` !!! page did not redirect correctly !!! ${signs.not_ok}`.red);
						}

						//driver.quit();
					}
				);
			}, 4000);	
	}, 2000);
}

function openFirstFeed() {
	setTimeout(function() {
		driver.executeScript(`
				document.querySelector(".vexMagazineOverlay").style.display = "none";
				var items = document.querySelectorAll(".vis-grid-item");
				items[0].style.display = "block";
				items[0].children[0].children[0].children[1].click();
				`)
					.then(function() {
						setTimeout(function() {
							onArticleLoaded();
						}, 5000);	
					});
	}, 1000 * 9);	
}



function onArticleLoaded() {
	// driver.findElements(By.className('article-banner'))
	// 	.then(function(elmArr) {
	// 		console.log(` * There are ${elmArr.length} banner containers on page`);

	// 		// var scriptToExecute = 'var banners = document.querySelectorAll(".article-banner");' + 
	// 		// 'console.log(banners);\n' + 
	// 		// 'if (banners.length > 0){\n' + 
	// 		// 	'banners.forEach(banner => {\n' + 
	// 		// 		'if (banner.children.length){\n' + 
	// 		// 			'var innerItems = banner.children[0].children;\n' +
	// 		// 			'console.log(innerItems);\n' +
						
	// 		// 		'}\n' + 
	// 		// 		'else{\n' + 
	// 		// 			'var str = "banner with id " + banner.getAttribute("id") + " has no children!";\n' + 
	// 		// 			'console.log(str.red);\n' + 
	// 		// 		'}\n' +
	// 		// 	'});\n' +
	// 		// '};';

	// 		// driver.executeScript(scriptToExecute)
	// 		// 	.then(function(response) {
	// 		// 		console.log("response ->", response);
	// 		// 	});
	// 	})
	// 	
	// 	
	// 	
	// 	
	var script = `	var banners = document.querySelectorAll(".article-banner");
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
					msg = ` * all banners were loaded on page ${signs.ok}`;
					console.log(msg.green);
				}
				else {
					msg = ' * not all banners were loaded. ${res.loadedCounter} out of ${res.totalBanners} were loaded ${signs.not_ok}';
					console.log(msg.red);
				}

				checkValidityOfArticle(); 	
				
			});		
	}, 1000 * 10);				
}


function checkValidityOfArticle() {
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
				var msg = ` * Article is loaded...${fullPercentage}% of paragraphs have text in them ${signs.ok}`;
				console.log(msg.green);
			}
			else{
				var err = ` * less then 50% of the paragraphs have text in them. ${signs.not_ok}`;
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
				msg = ` * All social elements were loaded. ${signs.ok}`;
				console.log(msg.green);
			}
			else {
				msg = ` * Loaded ${response.loaded} of ${response.totalNumberOfElements} social elements. ${signs.not_ok}`; 
				console.log(msg.red);
			}
		});
}


