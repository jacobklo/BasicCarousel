// Jacob Lo : jacoblo@jacoblo.net 

/**
  * File : readJson.js
  * Usage : ReadJSONClass is a class that input a path of a Json, than store it in ReadJSONClass.jsonObj.
  * Additionally, there is also a callback called handleJsonCallback()

  * Using IIFE method to encapsulate
  */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory;
    } else {
        root.ReadJSONClass = factory();
    }

})(this, function() {
    'use strict';

    var ReadJSONClass = function(path, handleJsonCallback) {

        this.jsonObj;
        // Note : outeSelf is used to redirection ReadJSONClass object
        var outerSelf = this;


        /*
         * Constructor : Input a path and call callback function when done.
         */
        this._init = function(file, callback) {

            var rawFile = new XMLHttpRequest();
            rawFile.overrideMimeType("application/json");
            rawFile.open("GET", file, true);
            rawFile.onreadystatechange = function() {

                if (rawFile.readyState === 4 && rawFile.status == "200") {

                    callback(rawFile.responseText);
                }
            }
            rawFile.send(null);
        }

        /*
         * Initization for the class
         */

        this._init(path, function(rawJsonText) {
            // Note : Null pointer check
            if (typeof rawJsonText == undefined) {

                console.log("ERROR : cannot parse Json");
                return;
            }

            outerSelf.jsonObj = JSON.parse(rawJsonText);

            if (typeof outerSelf.jsonObj == undefined) {

                console.log("ERROR - cannot parse Json");
                return;
            }

            handleJsonCallback(outerSelf.jsonObj);
        });

    }

    return ReadJSONClass;
});


/**
  * File : carouselhandler.js
  * Usage : Carousel is a class that manipulate a Carousel structure. 
  * It responsively navigate between slides

  * Using IIFE method to encapsulate
  */

(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory;
    } else {
        root.Carousel = factory();
    }

})(this, function() {
    'use strict';

    var Carousel = function(doc, groups, itemId) {

        /*
         * public fields
         */
        this.item = doc.querySelector('[class="carousel-main"][item="' + itemId + '"]');
        this.slideIndex;
        this.slideSize;
        this.dots;
        this.current;

        /*
         * Constructor: Populate different fields, e.g. SlideSize and dots DOM objects for later use
         */
        this._init = function() {

            this.slideIndex = 0;
            this.slideSize = this.item.querySelectorAll(".carousel-item").length;
            this.dots = this.item.querySelectorAll(".carousel-dot");

            this._updateCurrentSlideObj();
            this._setupListeners();
        }

        /*
         * _updateCurrentSlideDot() update the current solid dot in Carousel, based on current slide Index.
         */

        this._updateCurrentSlideDot = function() {

            for (var i = 0; i < this.dots.length; i++) {

                var dot = this.dots[i];

                if (i == this.slideIndex) {
                    dot.className += " active";
                } else {
                    dot.className = dot.className.replace(/(^| )active/, "");
                }
            }
        }

        /*
         * _updateCurrentSlideObj() update the current slide picture, base on current slide Index.
         */
        this._updateCurrentSlideObj = function() {

            for (var i = 0; i < this.slideSize; i++) {

                var eachSlide = this.item.querySelector(".carousel-item[slide-index='" + i + "']");

                if (i == this.slideIndex) {
                    this.item.current = eachSlide;
                    this.item.current.className += " active";
                } else {
                    eachSlide.className = eachSlide.className.replace(/(^| )active/, "");
                }
            }
            this._updateCurrentSlideDot();
        }

        /*
         * _setupListeners() setup listener for previous and next buttom, to move the curren slide accordingly.
         * This method also handle clicking dot events
         */
        this._setupListeners = function() {

            var outerSelf = this;

            var btnLeft = this.item.querySelector(".carousel-btn[data-air='_L']");
            btnLeft.addEventListener("mousedown", function() {
                outerSelf._slideLeftOfRight(true);
            });
            var btnRight = this.item.querySelector(".carousel-btn[data-air='_R']");
            btnRight.addEventListener("mousedown", function() {
                outerSelf._slideLeftOfRight(false);
            });

            for (var i = 0; i < this.dots.length; i++) {
                this.dots[i].addEventListener("mousedown", function() {
                    outerSelf._slideTo(this.getAttribute("slide-index"));
                });
            }
        }

        /*
         * _slideLeftOfRight() is a helper method, to detemind what is the slide number the user want to be: the previous one or the next one.
         */
        this._slideLeftOfRight = function(isLeft) {

            var newSlideIndex = (isLeft ? parseInt(this.slideIndex) - 1 : parseInt(this.slideIndex) + 1);
            if (newSlideIndex < 0) {
                newSlideIndex = this.slideSize - 1;
            } else {
                newSlideIndex = newSlideIndex % (this.slideSize);
            }

            this._slideTo(newSlideIndex);
        }

        /*
         * _slideTo() this is a public method, to parse input to a number, and change current slide to new slide, 
         * update pictures and dots accrodingly.
         */
        this._slideTo = function(index) {
            this.slideIndex = parseInt(index);
            this._updateCurrentSlideObj();
        }

        /*
         * Initialization for the class
         */
        this._init();


    }

    return Carousel;
});



/*
 * File: handleItemsClass.js
 * HandleItemsClass is a class that input all the products json data, 
 * and create a table accordingly with product name, pictures dynamically. 
 * It also create Carousels with the help of CarouselClass
 */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory;
    } else {
        root.HandleItemsClass = factory();
    }

})(this, function() {
    'use strict';

    // Note : doc === document, win === window
    var HandleItemsClass = function(doc, win) {

        /*
         * fields
         */
        this.groups; // different products data
        this.numOfColumn; // table's column, mobile is 1, web broswer is 3
        this.carouselOpened = false; // When carousel is opened, this is set to true to prevent further accessment
        var outerSelf = this;

        /*
         * showCarousel() activete product's DOM Carousel object, to show the Carousel, also hide other backgrounds
         */
        this.showCarousel = function(groups, itemId) {
            if (outerSelf.carouselOpened) {
                outerSelf.closeCarousel(groups, itemId);
                return;
            }

            this.carouselOpened = true;

            var carousel = new Carousel(doc, groups, itemId);

            var selectedCarousel = doc.querySelector('[class="carousel-main"][item="' + itemId + '"]');
            var groupsDiv = doc.getElementById('groupsDiv');
            selectedCarousel.style.display = "block";
            selectedCarousel.style.opacity = 1;
            groupsDiv.style.opacity = 0.1;

        }

        /*
         * closeCarousel() deactivate Carousel DOM object, and show the all product page again
         */
        this.closeCarousel = function(groups, itemId) {
            if (!outerSelf.carouselOpened) {
                return;
            }

            outerSelf.carouselOpened = false;

            for (var i = 0; i < groups.length; i++) {
                var selectedCarousel = doc.querySelector('[class="carousel-main"][item="' + i + '"]');
                selectedCarousel.style.opacity = 0;
                selectedCarousel.style.display = "none";
            }
            var groupsDiv = doc.getElementById('groupsDiv');
            groupsDiv.style.opacity = 1;
        }

        /*
         *  _addCustomStyle() helps populate custom style settings from json data.
         * E.g. the dimention of pictures
         */
        this._addCustomStyle = function(groups, index, numOfColumn) {

            var style = document.createElement('style');
            style.type = 'text/css';
            document.getElementsByTagName('head')[0].appendChild(style);
            style.innerHTML = `
                    .item-outer {
                        height: ` + parseFloat((100 / numOfColumn) - 0.8) + `vw;
                        width: ` + parseFloat((100 / numOfColumn) - 0.8) + `vw;
                        max-height: ` + groups[index].hero.height + `px;
                        max-width: ` + groups[index].hero.width + `px;
                    }

                    .item-outer[item-index="` + index + `"] {
                        background-image: url(` + groups[index].hero.href + `);
                    }
                `;
        }


        /*
         *  addCustomStyle() helps populate custom style settings for Carousel from json data.
         * E.g. the dimention of the thumbnails
         */
        this._addCustomCarouselStyle = function(groups, index) {
            var style = document.createElement('style');
            style.type = 'text/css';
            document.getElementsByTagName('head')[0].appendChild(style);

            var stylesOutput = [];
            stylesOutput.push(`
                    .carousel-main {
                        max-height: ` + groups[index].hero.height + `px;
                        max-width: ` + groups[index].hero.width + `px;
                    }`);

            var item = groups[index];

            stylesOutput.push(`
                        .carousel-item[item="` + index + `"][slide-index="` + 0 + `"]{ 
                            background-image: url(` + item.thumbnail.href + `); 
                        }

                      `);

            if (item != undefined && item.images != undefined) {

                for (var i = 0; i < item.images.length; i++) {

                    // Note : Slide Index is plus 1, because the first one is thumbnail
                    stylesOutput.push(`
                        .carousel-item[item="` + index + `"][slide-index="` + parseInt(i + 1) + `"]{ 
                            background-image: url(` + item.images[i].href + `); 
                        }

                      `);
                }
            }


            style.innerHTML = stylesOutput.join("");
        }


        /*
         *  _createCarousels() read in item's Carousel data,
         * than dynamically create a Carousel DOM object, with close, previous, next buttons, and dots
         */
        this._createCarousels = function(groups) {

            var carousels = document.getElementById("carousels");
            carousels.innerHTML = '';

            for (var i = 0; i < groups.length; i++) {

                var item = groups[i];
                var carouselMain = doc.createElement('div');

                var carouselMainAtt = doc.createAttribute("class");
                carouselMainAtt.value = "carousel-main";
                carouselMain.setAttributeNode(carouselMainAtt);

                var carouselMainAtt2 = doc.createAttribute("item");
                carouselMainAtt2.value = i;
                carouselMain.setAttributeNode(carouselMainAtt2);

                var carouselMainAtt3 = doc.createAttribute("slide-index");
                carouselMainAtt3.value = 0;
                carouselMain.setAttributeNode(carouselMainAtt3);


                carousels.appendChild(carouselMain);


                //Note : all carousel images + an additional thumbnail!
                if (item.images != undefined) {
                    for (var j = 0; j <= item.images.length; j++) {
                        var carouselItem = doc.createElement('div');

                        var carouselItemAtt = doc.createAttribute("class");
                        carouselItemAtt.value = "carousel-item";
                        carouselItem.setAttributeNode(carouselItemAtt);

                        var carouselItemAtt2 = doc.createAttribute("item");
                        carouselItemAtt2.value = i;
                        carouselItem.setAttributeNode(carouselItemAtt2);

                        var carouselItemAtt3 = doc.createAttribute("slide-index");
                        carouselItemAtt3.value = j;
                        carouselItem.setAttributeNode(carouselItemAtt3);

                        carouselMain.appendChild(carouselItem);
                    }
                }



                /* Carousel previous and Next button
                 * E.g. <button class="w3-button w3-circle carousel-btn" data-air="_L">&#8249;</button>
                 */
                var btnL = doc.createElement("button");

                var carouselBtnLAtt = doc.createAttribute("class");
                carouselBtnLAtt.value = "w3-button w3-circle carousel-btn";
                btnL.setAttributeNode(carouselBtnLAtt);

                var carouselBtnLAtt2 = doc.createAttribute("item");
                carouselBtnLAtt2.value = i;
                btnL.setAttributeNode(carouselBtnLAtt2);

                var carouselBtnLAtt3 = doc.createAttribute("data-air");
                carouselBtnLAtt3.value = "_L";
                btnL.setAttributeNode(carouselBtnLAtt3);

                btnL.innerHTML = "&#8249;";

                carouselMain.appendChild(btnL);


                var btnR = doc.createElement("button");

                var carouselBtnRAtt = doc.createAttribute("class");
                carouselBtnRAtt.value = "w3-button w3-circle carousel-btn";
                btnR.setAttributeNode(carouselBtnRAtt);

                var carouselBtnRAtt2 = doc.createAttribute("item");
                carouselBtnRAtt2.value = i;
                btnR.setAttributeNode(carouselBtnRAtt2);

                var carouselBtnRAtt3 = doc.createAttribute("data-air");
                carouselBtnRAtt3.value = "_R";
                btnR.setAttributeNode(carouselBtnRAtt3);

                btnR.innerHTML = "&#8250;";

                carouselMain.appendChild(btnR);
                /**** END Carousel previous and Next button ****/

                /* Carousel placeholder for dots 
                 */
                var carouselDots = doc.createElement("div");

                var carouselDotsAtt = doc.createAttribute("class");
                carouselDotsAtt.value = "carousel-dots";
                carouselDots.setAttributeNode(carouselDotsAtt);

                var carouselDotsAtt2 = doc.createAttribute("item");
                carouselDotsAtt2.value = i;
                carouselDots.setAttributeNode(carouselDotsAtt2);

                carouselMain.appendChild(carouselDots);


                if (item.images != undefined) {
                    for (var j = 0; j <= item.images.length; j++) {
                        /* Carousel dot
                         * E.g. <div class="carousel-dot" item="0" slide-index="0"></div>
                         */
                        var carouselDot = doc.createElement('div');

                        var carouselDotAtt = doc.createAttribute("class");
                        carouselDotAtt.value = "carousel-dot";
                        carouselDot.setAttributeNode(carouselDotAtt);

                        var carouselDotAtt2 = doc.createAttribute("item");
                        carouselDotAtt2.value = i;
                        carouselDot.setAttributeNode(carouselDotAtt2);

                        var carouselDotAtt3 = doc.createAttribute("slide-index");
                        carouselDotAtt3.value = j;
                        carouselDot.setAttributeNode(carouselDotAtt3);

                        carouselDots.appendChild(carouselDot);
                        /****** End Carousel dot ******/

                    }
                }

                /* Carousel Close Button
                 * E.g. <button class="w3-button carousel-btn-close" item="0" data-air="_CLOSE" onclick="handleItemsClass.closeCarousel( handleItemsClass.groups, 0)">X</button>
                 */
                var btnClose = doc.createElement("button");

                var btnCloseAtt = doc.createAttribute("class");
                btnCloseAtt.value = "w3-button carousel-btn-close";
                btnClose.setAttributeNode(btnCloseAtt);

                var btnCloseAtt2 = doc.createAttribute("item");
                btnCloseAtt2.value = i;
                btnClose.setAttributeNode(btnCloseAtt2);

                var btnCloseAtt3 = doc.createAttribute("data-air");
                btnCloseAtt3.value = "_CLOSE";
                btnClose.setAttributeNode(btnCloseAtt3);

                var btnCloseAtt4 = doc.createAttribute("onclick");
                btnCloseAtt4.value = "handleItemsClass.closeCarousel( handleItemsClass.groups, " + i + ")";
                btnClose.setAttributeNode(btnCloseAtt4);

                btnClose.innerHTML = "X";

                carouselMain.appendChild(btnClose);
                /****** End Carousel Close Button ******/

                this._addCustomCarouselStyle(groups, i);
            }
        }

        /*
         *  _createTable() read in all items' data,
         * than dynamically create a table, base on column choice, with items.
         * Item contains Item name, Item hero image, and price.
         */
        this._createTable = function(groups, numOfColumn) {

            if (numOfColumn < 1 && numOfColumn > groups.length) {
                numOfColumn = 1;
            }

            var groupsDiv = doc.getElementById("groupsDiv");
            groupsDiv.innerHTML = '';

            var groupsTable = doc.createElement('table');
            groupsDiv.appendChild(groupsTable);

            var tRow;

            for (var i = 0; i < groups.length; i++) {

                if (i % numOfColumn == 0) {
                    tRow = doc.createElement('tr');
                    groupsTable.appendChild(tRow);
                }

                var tColumn = doc.createElement('th');
                tRow.appendChild(tColumn);

                /* Item Div
                 * E.g. <div class="item-outer" item-index="0" onclick="handleItemsClass.showCarousel( handleItemsClass.groups, 0)">...</div>
                 */
                var itemOuterDiv = doc.createElement('div');
                var itemOuterDivAtt = doc.createAttribute("class");
                itemOuterDivAtt.value = "item-outer";
                itemOuterDiv.setAttributeNode(itemOuterDivAtt);

                var itemOuterDivAtt2 = doc.createAttribute("item-index");
                itemOuterDivAtt2.value = i;
                itemOuterDiv.setAttributeNode(itemOuterDivAtt2);

                var itemOuterDivAtt3 = doc.createAttribute("onclick");
                itemOuterDivAtt3.value = "handleItemsClass.showCarousel( handleItemsClass.groups, " + i + ")";
                itemOuterDiv.setAttributeNode(itemOuterDivAtt3);

                tColumn.appendChild(itemOuterDiv);


                /* Title of Item
                 * E.g. <div class="item-caption item-caption-font">Pillow</div>
                 */
                var titleDiv = doc.createElement('div');
                var titleDivAtt = doc.createAttribute("class");
                titleDivAtt.value = "item-caption item-caption-font";
                titleDiv.setAttributeNode(titleDivAtt);

                if (groups[i].name != undefined) {
                    titleDiv.innerHTML = groups[i].name;
                }

                itemOuterDiv.appendChild(titleDiv);
                /****** End Title of Item ******/


                /* Price tag
                 * E.g. <div class="item-price item-price-font" onclick="handleItemsClass.showCarousel(0)">$ 799</div>
                 */
                var priceDiv = doc.createElement('div');
                var priceDivAtt = doc.createAttribute("class");
                priceDivAtt.value = "item-price item-price-font";
                priceDiv.setAttributeNode(priceDivAtt);

                var priceDivAtt2 = doc.createAttribute("onclick");
                priceDivAtt2.value = "handleItemsClass.showCarousel(" + i + ")";
                priceDiv.setAttributeNode(priceDivAtt2);

                if (groups[i].priceRange != undefined &&
                    groups[i].priceRange.selling != undefined &&
                    groups[i].priceRange.selling.high != undefined) {

                    priceDiv.innerHTML = "$ " + groups[i].priceRange.selling.high;
                }

                tColumn.appendChild(priceDiv);
                /****** End Price tag ******/
                /****** End Item Div ******/

                this._addCustomStyle(groups, i, numOfColumn);
            }
        }

        /*
         *  _handleResize() is call when browser is resized
         * this prevent the items image from becoming too small, increase user friendliness.
         */
        this._handleResize = function() {
            var numOfCol = 3;
            // Note : check if window size is less then 600px, or if it is a mobile
            if (win.innerWidth < 600 ||
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {

                numOfCol = 1;
            }
            // Only resize if if the current numOfColumn is different, greatly increase performance
            if (this.numOfColumn != numOfCol) {
                outerSelf._createTable(outerSelf.groups, numOfCol);
                this.numOfColumn = numOfCol;

                outerSelf._createCarousels(outerSelf.groups);
            }

        }

        /*
         * Initialization
         */
        this._handleJsonData = function(jsonData) {

            outerSelf.groups = jsonData.groups;
            outerSelf._handleResize();
        }


    }

    return HandleItemsClass;
});



/*
 * This is called when web page is loaded
 */
function main() {
    handleItemsClass = new HandleItemsClass(document, window);
    readJSONClass = new ReadJSONClass("index.json", handleItemsClass._handleJsonData);

    window.addEventListener('resize', handleItemsClass._handleResize);

}