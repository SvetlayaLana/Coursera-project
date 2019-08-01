$(function (){
    $(".navbar-toggler").blur(function (event) {
        var screenWidth = window.innerWidth;
        if (screenWidth < 768){
            $("#navbarSupportedContent").collapse('hide');
        }
    });
});

(function (global){
    var dc = {};
    var homeHtml = "snippets/home-snippet.html";
    var allCategoriesUrl = "http://davids-restaurant.herokuapp.com/categories.json";
    var categoryTitleHtml = "snippets/category-title-snippet.html";
    var categoryHtml = "snippets/category-snippet.html";
    var allMenuItemsUrl = "http://davids-restaurant.herokuapp.com/menu_items.json?category=";
    var menuItemTitleHtml = "snippets/single-category-title-snippet.html";
    var menuItemHtml = "snippets/single-category-snippet.html";

    var insertHtml = function (selector,html) {
        var targetElem = document.querySelector(selector);
        targetElem.innerHTML = html;
    };

    var showLoading = function (selector) {
        var html = "<div class = 'text-center'>";
        html += "<img src='images/ajax-loader.gif'></div>";
        insertHtml(selector,html);
    };

    var insertProperty = function (string, propName, propValue) {
      var propToReplace = "{{" + propName + "}}";
      string = string.replace(new RegExp(propToReplace,"g"), propValue);
      return string;
    };

    document.addEventListener("DOMContentLoaded", function (event) {
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(homeHtml, function (responseText) {
            document.querySelector("#main-content").innerHTML = responseText;
        }, false);
    });

    dc.loadMenuCategories = function () {
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowCategoriesHtml);
    };

    dc.loadSingleCategory = function (categoryShort) {
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(allMenuItemsUrl + categoryShort, buildAndShowMenuItemsHtml);
    };

    function buildAndShowCategoriesHtml (category) {
        $ajaxUtils.sendGetRequest(categoryTitleHtml, function (categoryTitleHtml) {
            $ajaxUtils.sendGetRequest(categoryHtml, function (categoryHtml) {
                var categoryViewHtml = buildCategoryViewHtml(category, categoryTitleHtml, categoryHtml);
                insertHtml("#main-content", categoryViewHtml);
            }, false);
        }, false);
    }

    function buildCategoryViewHtml (category, categoryTitleHtml, categoryHtml) {
        var finalHtml = categoryTitleHtml;
        finalHtml += "<section class='row'>";
        for (var i = 0; i < category.length; i++){
            var html = categoryHtml;
            var name = "" + category[i].name;
            var short_name = category[i].short_name;
            html = insertProperty(html, "name", name);
            html = insertProperty(html, "short_name", short_name);
            finalHtml += html;
        }
        finalHtml += "</section>";
        return finalHtml;
    }

    function buildAndShowMenuItemsHtml(categoryMenuItems) {
        $ajaxUtils.sendGetRequest(menuItemTitleHtml, function (menuItemTitleHtml) {
            $ajaxUtils.sendGetRequest(menuItemHtml, function (menuItemHtml) {
                var menuItemViewHtml = buildMenuItemViewHtml(categoryMenuItems, menuItemTitleHtml, menuItemHtml);
                insertHtml("#main-content", menuItemViewHtml);
            }, false);
        }, false);
    }

    function buildMenuItemViewHtml (categoryMenuItems, menuItemTitleHtml, menuItemHtml) {
        menuItemTitleHtml = insertProperty(menuItemTitleHtml,"name", categoryMenuItems.category.name);
        menuItemTitleHtml = insertProperty(menuItemTitleHtml, "special_instructions", categoryMenuItems.category.special_instructions);

        var finalHtml = menuItemTitleHtml;
        finalHtml += "<section class='row'>";

        var menuItems = categoryMenuItems.menu_items;
        var catShortName = categoryMenuItems.category.short_name;

        for (var i = 0; i < menuItems.length; i++){
            var html = menuItemHtml;
            html = insertProperty(html, "short_name", menuItems[i].short_name);
            html = insertProperty(html,"catShortName", catShortName);
            html = insertItemPrice(html, "price_small", menuItems[i].price_small);
            html = insertItemPortionName(html, "small_portion_name", menuItems[i].small_portion_name);
            html = insertItemPrice(html, "price_large", menuItems[i].price_large);
            html = insertItemPortionName(html, "large_portion_name", menuItems[i].large_portion_name);
            html = insertProperty(html,"name", menuItems[i].name);
            html = insertProperty(html,"description", menuItems[i].description);
            if (i % 2 !== 0) {
                html +=
                    "<div class='clearfix visible-lg-block visible-md-block'></div>";
            }
            finalHtml += html;
        }
        finalHtml += "</section>";
        return finalHtml;
    }

    function insertItemPrice(html, pricePropName, priceValue) {
        if (!priceValue) {
            return insertProperty(html, pricePropName, "");
        }
        priceValue = "$" + priceValue.toFixed(2);
        html = insertProperty(html, pricePropName, priceValue);
        return html;
    }

    function insertItemPortionName(html, portionPropName, portionValue) {
        if (!portionValue) {
            return insertProperty(html, portionPropName, "");
        }
        portionValue = "(" + portionValue + ") ";
        html = insertProperty(html, portionPropName, portionValue);
        return html;
    }

    global.$dc = dc;
})(window);