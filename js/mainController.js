/* FEATURES:
1. The language selected by the user is persistent
2. Basados en esta arquitectura un lenguaje de backed podria hacer mas elegante y modular el sistema
*/

var app = angular.module("amazingPage", []);

app.controller("mainCtrl", function ($scope)
{
	// List of supported languages in the site
	$scope.supportedLanguages = [
		'en', // English
		'es' // Spanish
	]
	$scope.actualLang = 'en';

	$scope.loadSavedLang = function ()
	{
		// According to the specification getItem MUST return null if the given key does not exists
		if (localStorage.getItem("savedLang") !== null) {
			$scope.actualLang = localStorage.getItem("savedLang");
		}
	}

	$scope.setActualLang = function (lang)
	{
		// The given languages is suported?
		let isSupported = false;
		for (let i = 0; i < $scope.supportedLanguages.length; i++)
		{
			// Is lang parameter is equal to at least one in the list of supported languages then the given lang is a supported language
			isSupported |= (lang === $scope.supportedLanguages[i]);
		}

		// TODO: Guardar en local storage el lenguaje seleccionado
		if (isSupported)
		{
			$scope.actualLang = lang;
			// Save the selected language
			localStorage.setItem("savedLang", $scope.actualLang);
		}
		else
		{
			$scope.actualLang = 'unsupported';
		}		
	}

	// Function used for conditional css
	$scope.isLangActive = function (lang)
	{
		if ($scope.actualLang === lang)
		{
			return true;
		}
		else
		{
			return false;
		}
	}

	$scope.isLangActiveClass = function (lang)
	{
		if ($scope.isLangActive(lang))
		{
			return 'active';
		}
		else
		{
			return '';
		}
	}

});

/*In order to avoid collisions with some future standard, it's best to prefix your own directive names.*/
app.directive("myMultiLang", function() {
    return {
    	scope: {
	      englishVersion: '=en'
	    },
        template : "Foooo {{englishVersion.selectedLang}}"
    };
});