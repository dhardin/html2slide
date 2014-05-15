/*
* html2slide.js
* 
*/
/*jslint browser : true, continue : true,
devel : true, indent : 2, maxerr : 50,
newcap : true, nomen : true, plusplus : true,
regexp : true, sloppy : true, vars : false,
white : true
*/
/*global $, wbs.menu */
html2slide = (function () {
    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    //datepicker
    var
    configMap = {
        main_html: String()
        + '<div class="slideContentEntry" contenteditable="true"></div>'
        + '<div class="slideContent"></div>'
        + 'Settings: <br/>'
        + 'Width (inches): <input class="width" type="number" value="8.5" step="0.5"><br/>'
        + 'Height (inches): <input class="height" type="number" value="11" step="0.5"><br/>'
        + 'Font Size (inches): <input class="fontSize" type="number" value="0.2" step="0.1"><br/>'
        + '<input type="button" class="convert" value="Convert">'
        + '<div class="slideDeck"></div>',
        settable_map: {
            font_size: true,
            slide_height: true,
            slide_width: true
        },
        font_size: 0.2,
        slide_height: 8.5,
        slide_width: 11,
        height: 2
    },
    stateMap = {
      $container: null
    },
    jqueryMap = {},
    dateArr = [],
    setJqueryMap, configModule, initModule,
    onConvertClick;
    //----------------- END MODULE SCOPE VARIABLES ---------------
    //------------------- BEGIN UTILITY METHODS ------------------
    // Begin Public method /setConfigMap/
    // Purpose: Common code to set configs in feature modules
    // Arguments:
    // * input_map - map of key-values to set in config
    // * settable_map - map of allowable keys to set
    // * config_map - map to apply settings to
    // Returns: true
    // Throws : Exception if input key not allowed
    //
    setConfigMap = function (arg_map) {
        var
        input_map = arg_map.input_map,
        settable_map = arg_map.settable_map,
        config_map = arg_map.config_map,
        key_name, error;
        for (key_name in input_map) {
            if (input_map.hasOwnProperty(key_name)) {
                if (settable_map.hasOwnProperty(key_name)) {
                    config_map[key_name] = input_map[key_name];
                }
                else {
                    error = makeError('Bad Input',
                    'Setting config key |' + key_name + '| is not supported'
                    );
                    throw error;
                }
            }
        }
    };
    // End Public method /setConfigMap/
    //-------------------- END UTILITY METHODS -------------------
    //--------------------- BEGIN DOM METHODS --------------------
    // Begin DOM method /setJqueryMap/
    setJqueryMap = function () {
        var
        $container = stateMap.$container;

        jqueryMap = {
            $slideContent: $container.find('.slideContent'),
            $slideContentEntry : $container.find('.slideContentEntry'),
            $slideDeck: $container.find('.slideDeck'),
            $convertBtn: $container.find('.convert'),
            $width: $container.find('.width'),
            $height: $container.find('.height'),
            $fontSize: $container.find('.fontSize')
        };
    };
    // End DOM method /setJqueryMap/


    //---------------------- END DOM METHODS ---------------------
    //------------------- BEGIN EVENT HANDLERS -------------------
    // Begin event handler /onConvertClick/
    onConvertClick = function (e) {
        jqueryMap.$slideContent.html(jqueryMap.$slideContentEntry.html());
            var
                $slideContent = jqueryMap.$slideContent,
                $slideDeck = jqueryMap.$slideDeck,
                height = $slideContent.height(),
                width = $slideContent.width(),
                numSlides,
                html = $slideContent.html(),
                i, $textElement, $slide,
                INCH_TO_PX = 96;

            configMap.slide_height = jqueryMap.$height.val();
            configMap.slide_width = jqueryMap.$width.val();
            configMap.font_size = jqueryMap.$fontSize.val();
            //clear out any existing content from slide deck
            $slideDeck.empty();

            $slide = $('<div class="slide"></div>');
            $slide.css({
                lineHeight: configMap.font_size + "in", // Needs to be the same as font size
                fontSize: configMap.font_size + "in",
                width: configMap.slide_width + "in",
                height: configMap.slide_height + "in"
            });

            numSlides = height / ($slide.height() * INCH_TO_PX);

            for (i = 0; i < numSlides; i++) {
                $textElement = $('<div/>');
                $textElement.html(html);
                $slide = $('<div class="slide"></div>');

                $slide.css({
                    lineHeight: configMap.font_size + "in", // Needs to be the same as font size
                    fontSize: configMap.font_size + "in",
                    width: configMap.slide_width + "in",
                    height: configMap.slide_height + "in"
                });

                $textElement.appendTo($slide);
                $textElement.css('margin-top', $slide.height() * INCH_TO_PX * i * -1);
                $slide.appendTo($slideDeck);
            }
    }
    // End event handler /onConvertClick/

    //-------------------- END EVENT HANDLERS --------------------
    //------------------- BEGIN PUBLIC METHODS -------------------
    // Begin public method /configModule/
    // Purpose : Adjust configuration of allowed keys
    // Arguments : A map of settable keys and values
    // * color_name - color to use
    // Settings :
    // * configMap.settable_map declares allowed keys
    // Returns : true
    // Throws : none
    //
    configModule = function (input_map) {
        setConfigMap({
            input_map: input_map,
            settable_map: configMap.settable_map,
            config_map: configMap
        });
        return true;
    };
    // End public method /configModule/
    // Begin public method /initModule/
    // Purpose : Initializes module
    // Arguments :
    // * $container the jquery element used by this feature
    // Returns : true
    // Throws : nonaccidental
    //
    initModule = function ($container) {
        stateMap.$container = $container;
        $(configMap.main_html).appendTo($container);

        setJqueryMap();

     

        //set specified styling
        jqueryMap.$slideContentEntry.css({
            lineHeight: configMap.font_size + "in", // Needs to be the same as font size
            fontSize: configMap.font_size + "in",
            width: configMap.slide_width + "in",
            height: configMap.height + "in"
        });

        jqueryMap.$slideContentEntry.css({
            lineHeight: configMap.font_size + "in", // Needs to be the same as font size
            fontSize: configMap.font_size + "in",
            width: configMap.slide_width + "in"
        });

        jqueryMap.$convertBtn.on('click', onConvertClick);

        jqueryMap.$fontSize.on('input', function (e) {
            jqueryMap.$slideContentEntry.css({
                lineHeight: $(this).val() + "in", // Needs to be the same as font size
                fontSize: $(this).val() + "in"
            });
            jqueryMap.$slideContent.css({
                lineHeight: $(this).val() + "in", // Needs to be the same as font size
                fontSize: $(this).val() + "in"
            });
        });
      
        return true;
    };
    // End public method /initModule/
    // End public method /initModule/
    // return public methods
    return {
        configModule: configModule,
        initModule: initModule
    };
    //------------------- END PUBLIC METHODS ---------------------
}());