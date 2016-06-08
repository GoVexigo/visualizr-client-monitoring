var webdriver = require('selenium-webdriver');

var By        = webdriver.By;
var until     = webdriver.until;

var driver    = new webdriver.Builder()
				// .withCapabilities({
				// 				'name' : 'chrome',
				// 				'platform' : 'Android'
				// 			})
				.forBrowser('chrome', 'Android', 'Android')
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
									var msg = ` * There are ${result} items in categories menu ${signs.ok}`;
									console.log(msg.green);	
									console.log(' * Simulating clicking on first category.....');

									// // click on first category
									
									driver.findElement(By.xpath('//*[@id="category"]/a'))
										.click()
										.then(function(item) {
											//console.log(' * clicking on inner category and redirecting');

											setTimeout(function() {
												var textElementToCompare = "";
												// driver.findElement(By.xpath('//*[@id="child"]/a'))
														// .click()
														// .then(
																function() {
																	console.log(' * redirecting.... ');
																	setTimeout(function() {
																		driver.findElement(By.xpath('//*[@id="child"]/ul/li[1]/a'))
																			.getText()
																			.then(function(text) {
																				textElementToCompare = text;
																			});

																			driver.findElement(By.xpath('//*[@id="child"]/ul/li[1]/a'))
																			.click()
																			.then(
																					function() {
																							setTimeout(function() {
																								checkIfWasRedirectedCorrectly(textElementToCompare);
																							}, 3000);
																					}
																				);	
																	}, 10);	
																},

																function(e) {
																	console.log(e);
																}

														     // )
											}, 2000);	
										});
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
		driver.findElement(By.xpath('//*[@id="gridContainer"]/vis-grid/div[1]/div/div[1]/img'))
			.click()
			.then(function(elm) {
				onArticleLoaded();
			 });
}

function onArticleLoaded() {
	// check if top ad exists
	// driver.findElement(By.id("topAd"))
	// 	.isExisting()
	// 	.then(function(exists) {
	// 			if (exists) {
	// 				//console.log("this");
	// 				//top ad div exist
					
	// 			} 
	// 			else {
	// 				console.log(" * top ad not present...".yellow);
	// 			}
	// 	})

	var isInTextAdExists = driver.findElement(By.className("in-text-ad-container"))
	.size()
	.then(function(size) {
		if (size > 0) {
		// check deeper
		console.log("looking deeper");
		} 
		else {
			console.log(" * in text ad not present".yellow);
		}
	});
	


}

