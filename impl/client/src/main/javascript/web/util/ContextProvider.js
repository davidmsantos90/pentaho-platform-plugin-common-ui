/*! ******************************************************************************
 *
 * Pentaho
 *
 * Copyright (C) 2024 by Hitachi Vantara, LLC : http://www.pentaho.com
 *
 * Use of this software is governed by the Business Source License included
 * in the LICENSE.TXT file.
 *
 * Change Date: 2029-07-20
 ******************************************************************************/


/*
	Config params
	var configParam1 = "some_path/file_name1";
	var configParam2 = { path:"some_path/file_name2", post: function(context, loadedMap) { } };

	var demoConfig = ["some_path/file_name1", { path:"some_path/file_name2", post: function(context, loadedMap) { }}, "some_other_path/file_name"];
*/

define("common-ui/util/ContextProvider", ["common-ui/jquery-pentaho-i18n"], function() {
	var context = {};
	var loaded = false;

	/**
	 * A recursive function, iterating over each configuration file and executing specific functions per configuration.
	 * This function iterates until the end of the configurations has been met
	 */
	function recursiveInit(config, index, postContextLoad) {
		var configParam = config[index];		

		var path = configParam.path ? configParam.path : configParam;

		loadFile(path, function(context, loadedMap) {

			// Execute configuration specific method
			if (configParam.post) {
				configParam.post(context, loadedMap);	
			}
			
			// Determine whether to recur or exit
			if (index < config.length - 1) {
				recursiveInit(config, index + 1, postContextLoad)
			}
			else {
				loaded = true;
				postContextLoad(context);
			}

		}, !configParam.post);
	}

	/**
	 * Loads a single file and provides a post function for after the context has been loaded. 
	 */
	function loadFile(path, postFileLoad, addToContext) {	
		var locale = getUrlVars()["locale"];
    if( !locale ) {
      // look to see if locale is set on the page in a meta tag
      if($("meta[name='locale']")) {
        locale = $("meta[name='locale']").attr("content");
      }
    }
		jQuery.i18n.properties({
	  		name: path,
	  		mode: 'map',
	  		language: locale,
	  		callback: function () {

	  			var copiedMap = {};

	  			// Copy elements and remove elements for next file load
	  			for (configProp in jQuery.i18n.map) {
	  				copiedMap[configProp] = jQuery.i18n.map[configProp];
	  				delete jQuery.i18n.map[configProp];
	  			}

				// Simply copy values into context
	  			if (addToContext) {
	  				for (configProp in copiedMap) {
		  				context[configProp] = copiedMap[configProp];
		  			}
	  			}

	  			// Execute generic post load of context
	  			if (postFileLoad) {
	  				postFileLoad(context, copiedMap);
	  			}
	  		}
	  	});
	}

	function getUrlVars() {
	    var vars = {};
	    var parts = window.top.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
	        vars[key] = value;
	    });
	    return vars;
	}


	/**
	 * Retrieve the context, accepting a post load method for the context and a configuration array.
	 */
	function get(postContextLoad, config) {
		if (!loaded) {
			recursiveInit(config, 0, postContextLoad);
		} else { 
			postContextLoad(context);
		} 		
	}

	/**
	 * Appends a property to the context
	 */
	function addProperty(property, value) {
		context[property] = value;
	}

	return {
		get:get,
		addProperty:addProperty
	};
});
