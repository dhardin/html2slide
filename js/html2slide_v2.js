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
        + '<div class="settings">'
            + 'Settings: <br/>'
            + 'Width (inches): <input class="width" type="number" value="11" step="0.5"><br/>'
            + 'Height (inches): <input class="height" type="number" value="8.5" step="0.5"><br/>'
            + 'Font Size (inches): <input class="fontSize" type="number" value="0.2" step="0.1"><br/>'
            + '<div class="formatAlert">Conflicting Font-Size to Height ratio.</div>'
        +'</div>'
        + '<input type="button" class="convert" value="Convert"/> <input type="button" class="random" value="Generate Random Deck"/>'
        + '<div class="slideDeck"></div>',
        settable_map: {
            font_size: true,
            slide_height: true,
            slide_width: true,
            margin: true
        },
        font_size: 0.2,
        slide_height: 8.5,
        slide_width: 11,
        height: 2,
        margin: 0.5
    },
    stateMap = {
      $container: null
    },
    jqueryMap = {},
    dateArr = [],
    setJqueryMap, configModule, initModule,
    setWordLineNumber, convertSlideToImg,
    addSlides, onConvertClick, onRandomClick,
    Slide;
    //----------------- END MODULE SCOPE VARIABLES ---------------
    //----------------- BEGIN OBJECT CONSTRUCTORS ----------------
    Slide = function (header, content, width, height, margin, fontSize) {
        this.header = header;
        this.content = content;
        this.width = width;
        this.height = height;
        this.margin = margin;
        this.fontSize = fontSize;
        this.slides = this.buildSlides(header, content);
    };

    Slide.prototype.buildSlides = function (header, content) {
        var
            $slideContent = jqueryMap.$slideContent,
            height,
            width,
            numSlides,
            i, $textElement, $slide,
            $slides = $('<div/>'),
            $slideContainer,
            INCH_TO_PX = 96;

        $slideContent.html('<h5>' + this.header + '</h5>' + '<p>' + this.content + '</p>');
        height = $slideContent.height();
        width = $slideContent.width();

        $slide = $('<div class="slide"></div>');
        $slide.css({
            //  lineHeight: configMap.font_size + "in", // Needs to be the same as font size
            fontSize: this.fontSize + "in",
            width: this.width + "in",
            height: this.height - this.margin + "in"
        });

        $slideContent.find('h5').css({
            //  lineHeight: configMap.font_size + "in", // Needs to be the same as font size
            fontSize: 2 * this.fontSize + "in",
            margin: "0"
        });


        numSlides = height / (this.height * INCH_TO_PX);

        for (i = 0; i < numSlides; i++) {
            $textElement = $('<div/>');
            $textElement.html($slideContent.html());
            $slide = $('<div class="slide"></div>');
            $slideContainer = $('<div class="slideContainer"></div>');
            $slide.appendTo($slideContainer);
            $slide.css({
                fontSize: this.fontSize + "in",
                width: this.width + "in",
                height: this.height + "in",
                margin: this.margin + "in"
            });
            $slideContainer.css({
                fontSize: this.fontSize + "in",
                width: this.width + "in",
                height: this.height + "in",
                margin: this.margin + "in"
            });

            $textElement.appendTo($slide);
            $textElement.css('margin-top', this.height * INCH_TO_PX * i * -1);
            $slideContainer.appendTo($slides);
        }

        return $slides;
    };

    Slide.prototype.appendTo = function ($target) {
        if ($target.length == 0) {
            return false;
        }
       
        this.slides.appendTo($target);
    };
    //----------------- END OBJECT CONSTRUCTORS ------------------
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
            $randomBtn: $container.find('.random'),
            $width: $container.find('.width'),
            $height: $container.find('.height'),
            $fontSize: $container.find('.fontSize'),
            $settings: $container.find('.settings'),
            $warning: $container.find('.formatAlert')
        };
    };
    // End DOM method /setJqueryMap/

    // Begin DOM method /setWordLineNumber/
    setWordLineNumber = function ($elem) {
        var words = $elem.html().split(/\s/);
        var text = '';
        var line = 0;
        var prevTop = -15;
            $.each(words, function (i, w) {
                if ($.trim(w)) {
                    text = text + '<span class="word">' + w + '</span> '
                }
            }
                  ); //each word 
            $elem.html(text);
        
            $('.word', $elem).each(function () {
                var word = $(this);
                var top = word.offset().top;
                if (top != prevTop) {
                    prevTop = top;
                    line++;
                }
                word.addClass('line' + line);
            });//each 
    };
    // End DOM method /setWordLineNumber/

    // Begin DOM method /addSlides/
    addSlides = function (slideContentObjArr, index) {
        var
            i, key,
            content_map = {
                header: "",
                content: ""
            },
            slide = {}
        ;

        index = index || 0;

        if (!(slideContentObjArr instanceof Array)) {
            return false;
        }

        if (index >= slideContentObjArr.length) {
            return;
        }

     
        if (!(slideContentObjArr[index] instanceof Object)) {
            return false;
        }

        //populate content map
        for (key in content_map) {
            //reset content map key value
            content_map[key] = "";
            //check to see if proptery exists in slide content object
            if (slideContentObjArr[index].hasOwnProperty(key)) {
                content_map[key] = slideContentObjArr[index][key];
            }
        }


        //build slide(s) based on content map
        setTimeout(function () {
            slide = new Slide(content_map.header, content_map.content, configMap.slide_width, configMap.slide_height, configMap.slide_margin, configMap.font_size);
            //add slides to deck
            slide.appendTo(jqueryMap.$slideDeck);
            addSlides(slideContentObjArr, index + 1);
        }, 100);


    };
    // End DOM method /addSlides/

    // Begin DOM method /convertSlideToImg/
    convertSlideToImg = function ($slide) {
        var $img = $('<canvas/>');

        return $img;
    }
    // End DOM method /convertSlideToImg/
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
                i, $textElement, $slide,$slideContainer,
                INCH_TO_PX = 96;

            configMap.slide_height = jqueryMap.$height.val();
            configMap.slide_width = jqueryMap.$width.val();
            configMap.font_size = jqueryMap.$fontSize.val();
            //clear out any existing content from slide deck
            $slideDeck.empty();
              
            $slide = $('<div class="slide"></div>');
            $slide.css({
                fontSize: configMap.font_size + "in",
                width: configMap.slide_width + "in",
                height: configMap.slide_height - 0.5 + "in"
            });

            numSlides = height / (configMap.slide_height * INCH_TO_PX);
          //  setWordLineNumber(jqueryMap.$slideContent);
            for (i = 0; i < numSlides; i++) {
                $textElement = $('<div/>');
                $textElement.html(html);
                $slide = $('<div class="slide"></div>');
                $slideContainer = $('<div class="slideContainer"></div>');
                $slide.appendTo($slideContainer);
                $slide.css({
                    fontSize: configMap.font_size + "in",
                    width: configMap.slide_width + "in",
                    height: configMap.slide_height+ "in"
                });
                $slideContainer.css({
                    fontSize: configMap.font_size + "in",
                    width: configMap.slide_width + "in",
                    height: configMap.slide_height + "in"
                });

                $textElement.appendTo($slide);
                $textElement.css('margin-top', configMap.slide_height * INCH_TO_PX * i * -1);
                $slideContainer.appendTo($slideDeck);
            }
    }
    // End event handler /onConvertClick/

    // Begin event handler /onRandomClick/
    onRandomClick = function (e) {
        var
            RAND_MAX = 10,
            CONTENT_RAND_MAX = 100,
            i, numSlides, slides = [],
            randContentNum,
            header, content,
            lorem = ["Lorem ipsum dolor sit amet, consectetuer adipiscing elit.",
                "Maecenas porttitor congue massa.",
                "Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna.",
                "Nunc viverra imperdiet enim. Fusce est. Vivamus a tellus.",
                "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.",
                "Proin pharetra nonummy pede. Mauris et orci."];

        jqueryMap.$slideDeck.empty();

        numSlides = Math.floor((Math.random() * RAND_MAX) + 1);
        
        //generate random slides
        for (i = 0; i < numSlides; i++) {
            header = "Header " + (i + 1);
            content = "";

            //generate random content
            randContentNum = Math.floor((Math.random() * CONTENT_RAND_MAX) + 20);
            for (j = 0; j < randContentNum; j++) {
                content += lorem[ Math.floor(Math.random() * lorem.length) ] + "  ";
            }
            randContentNum = Math.floor((Math.random() * CONTENT_RAND_MAX) + 20);
            content += '<ul>';
            for (j = 0; j < randContentNum; j++) {
                content += '<li>' + lorem[Math.floor(Math.random() * lorem.length)] + '</li>';
            }
            content += '</ul>';
            slides.push(new Slide(header, content, configMap.slide_width, configMap.slide_height, configMap.margin, configMap.font_size));
        }
        addSlides(slides);
    };
    // End event handler /onRandomClick/

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
          //  lineHeight: configMap.font_size + "in", // Needs to be the same as font size
            fontSize: configMap.font_size + "in",
            width: configMap.slide_width + "in",
            height: configMap.height + "in"
        });

        jqueryMap.$slideContentEntry.css({
           // lineHeight: configMap.font_size + "in", // Needs to be the same as font size
            fontSize: configMap.font_size + "in",
            width: configMap.slide_width + "in"
        });

        jqueryMap.$convertBtn.on('click', onConvertClick);
        jqueryMap.$randomBtn.on('click', onRandomClick);

        jqueryMap.$fontSize.on('input', function (e) {
            jqueryMap.$slideContentEntry.css({
               // lineHeight: $(this).val() + "in", // Needs to be the same as font size
                fontSize: $(this).val() + "in"
            });
            jqueryMap.$slideContent.css({
              //  lineHeight: $(this).val() + "in", // Needs to be the same as font size
                fontSize: $(this).val() + "in"
            });
        });

        jqueryMap.$settings.find('input').on('input', function (e) {
            configMap.font_size = jqueryMap.$fontSize.val();
            configMap.slide_height = jqueryMap.$height.val();
            configMap.slide_width = jqueryMap.$width.val();

            if ((configMap.slide_height * 10) % (configMap.font_size * 10) != 0) {
                jqueryMap.$warning.show();
            } else {
                jqueryMap.$warning.hide();
            }
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