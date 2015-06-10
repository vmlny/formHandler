(function($){

  /* defaults ================================================================ >

  The defaults object is extended by the options passed to the plugin on invocation
  As such it should not be used directly.

  =========================================================================== */

  var defaults = {

    /* ======================================================================= >

      Selectors are used to identify what methods apply to what fields within
      the passed form element jQuery object.

    ========================================================================= */
    'selectors':{
      'validation':'[data-validation-types]',
      'required':'[required]',
      'format':'[data-formatter]',
      'event' : '[data-focus-event], [data-blur-event], [data-keydown-event]',
      /*
        errrorMessageTarget is used as a fallback when field level area is not
        set. This can also be used to place all error messages in the same element.
      */
      'errorMessageTarget' : '.error-area'
    },

    /* ======================================================================= >

      Attributes are used to obtain field-level configuration within methods.
      When using internal default methods key values are not changeable.

    ========================================================================= */
    'attributes' : {
      'validationType' : 'data-validation-types',
      'errorMsgSelector' : 'data-error-message-area',
      'errorMsg' : 'data-error-message',
      'errorClass' : 'data-error-class',
      'errorHandler' : 'data-error-handler',
      'formatter' : 'data-formatter',
      'format' : 'data-formatter-pattern',
      'formatXformCase' : 'data-formatter-transform-case',
      'trimFormatting' : 'data-formatter-trim',
      'lengthMax' : 'data-length-max',
      'lengthMin' : 'data-length-min',
      'length' : 'data-length',
      'disclude' : 'data-donut-accept',
      'include' : 'data-input-to-compare',
      'dontCount' : 'data-do-not-count',
      'regex' : 'data-pattern',

      /* ===================================================================== >

         Custom Events are stored in an array because the event is derived
         from the attribute name. Custom event data attributes should follow
         this pattern:
         'data-EVENT_NAME_STRING-event'

       ====================================================================== */
      'customEvents' : [
        'data-focus-event',
        'data-blur-event',
        'data-keydown-event'
      ]
    },
    /*
      scrollToError is a feature to scroll the viewport to the first errored
      field. By default it is disabled in expectation that the plugin will be
      used with a single error agregation field.
    */
    'scrollToError' : false,
    /*
      dontCount is used to disclude punctuation & whitespce from
      length calculations.
    */
    'dontCount' : /(\-|\.|\s|\(|\))/g,

    /*
      formatPatternWildCard is used within the pattern formatter form method
    */
    'formatPatternWildCard' : 'x',

    /*
      genericErrorMessage is used as a fallback when the field-level error message
      is not set.
    */
    'genericErrorMessage' : 'Please complete all required fields.',

    /*
      errrorClass is also used as a fallback when a field level class is not
      set. This can also be used to css class all error messages the same.
    */
    'errorClass' : 'validation-error',

    /* ======================================================================= >

       All Formatters Validators and Message Handlers accept the same signature
       The element value and the extended defaults (_settings)
       All are all scoped to the element whose value is being transformed/validated
       to allow access to data attributes on the element

    ========================================================================= */

    // Formatters ============================================================ >

    'formatters' : {
      'uppercase' : function(_value, _settings){
        return (_value + '').toUpperCase();
      },
      'lowercase' : function(_value, _settings){
        return (_value + '').toLowerCase();
      },
      'capitalize' : function(_value, _settings){
        var words = _value.split(' ') || [''];
        return $.map(words, function(_word, _index){
          if (_word !== ''){
            return _word[0].toUpperCase() + _word.slice(1).toLowerCase();
          }
          return _word;
        }).join(' ');
      },
      'match-pattern' : function(_value, _settings){
        var $field = $(this),
            // determine if pattern should include case matching
            sensitivity = $field.attr(_settings.attributes.formatXformCase),
            isCaseSensitive = (
              sensitivity &&
              sensitivity.toLowerCase() !== 'false'
            ),
            // determine if the output length should match input or the pattern
            trim = $field.attr(_settings.attributes.trimFormatting),
            shouldTrim = (
              trim &&
              trim.toLowerCase() !== 'false'
            ),
            wildCard = _settings.formatPatternWildCard.toLowerCase(),
            pattern = $field.attr(_settings.attributes.format),
            // break pattern into an Array to use with Array.prototype.map or $.map
            patArr = pattern.split('') || [],
            // escape pattern used below to prevent regex special characters from
            // being interpretted by the RegExp constructor in patRegex
            regexEscapePattern = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,
            // generate regex from string to test value to prevent double-applying
            patRegex = new RegExp(
              pattern.replace(
                regexEscapePattern,
                "\\$&"
              ).replace(
                new RegExp(wildCard, 'gi'),
                '(\\w|\\s)?'
              )
            ),
            // counter to manage the place within the _value while filling the pattern.
            curIndex = 0;
        // check for previous formatting
        if( !patRegex.test(_value) && _value !== ''){
          // return the joined result of mapping the pattern Array (patArr)
          return $.map(patArr, function(_character){
            var output = _character, // initially the output is set to the pattern character
                isUppercase = _character.toLowerCase() !== _character;
            // if the character is a wildcard, set output to the curIndex of _value
            if(_character.toLowerCase() === wildCard){
              output = curIndex < _value.length ? _value[curIndex] : '';
              // if the pattern is case sensitive, set the case of the output character
              if( isCaseSensitive ){
                output = isUppercase ? output.toUpperCase() : output.toLowerCase();
              }
              curIndex ++;
            }
            return output;
          // add the rest of the input string if the pattern shoudl not trim
          }).join('')+( shouldTrim ? '' : _value.slice(curIndex) );
        }
        return _value;
      }
    },

    // Validators ============================================================ >

    'validators' : {
      'not-empty' : function(_value, _settings){
        var $field = $(this),
            type = $field.attr('type'),
            isArray = $field.attr('name').indexOf('[]') > 0,
            dontCount = $field.attr(_settings.attributes.dontCount) || _settings.dontCount,
            value;

        if(type === 'radio' || type === 'checkbox'){
          if(isArray){
            return $('[name^='+ $field.attr('name').replace('[]','') + ']:checked').length > 0;
          }else{
            return $('[name='+ $field.attr('name') + ']:checked').length > 0;
          }

        }else if( $field.is('select') ){

          var $defaultOption = $('option[default]', $field),
              defaultVal = $defaultOption.length > 0 ? $defaultOption.attr('value') : '';

          return $field.val() !== defaultVal;

        }

        value = _value.replace(dontCount, '');

        return value.length > 0;

      },
      'in-length-range' : function(_value, _settings){
        var dontCount = $(this).attr(_settings.attributes.dontCount) || _settings.dontCount,
            value = _value.replace(dontCount, ''),
            length = value.length,
            maxLength = $(this).attr(_settings.attributes.lengthMax),
            minLength = $(this).attr(_settings.attributes.lengthMin);
        checkTypeSupport($(this).attr('type'));
        if(maxLength && minLength){
          return length >= Number(minLength) && length <= Number(maxLength);
        }
        return length <= Number(maxLength);
      },
      'is-length' : function(_value, _settings){
        var lengthVal = parseInt($(this).attr(_settings.attributes.length), 10);
        checkTypeSupport($(this).attr('type'));
        return _value.length === lengthVal;
      },
      'is-numeric' : function(_value, _settings){
        var dontCount = $(this).attr(_settings.attributes.dontCount) || _settings.dontCount,
            value = _value.replace(dontCount, '');
        checkTypeSupport($(this).attr('type'));
        return !isNaN(value) && (value % 1 === 0) && (_value !== '');
      },
      'is-inequal' : function(_value, _settings){
        var disclude = $(this).attr(_settings.attributes.disclude);
        checkTypeSupport($(this).attr('type'));
        return disclude.indexOf(_value) < 0;
      },
      'is-equal' : function(_value, _settings){
        var include = $($(this).attr(_settings.attributes.include)).val();
        checkTypeSupport($(this).attr('type'));
        return _value === include;
      },
      'is-email' : function(_value, _settings){
        checkTypeSupport($(this).attr('type'));
        return /.+@.+\..+/.test(_value);
      },
      'is-phone' : function(_value, _settings){
        var phone_ptrn = /^1?[\s-.]?\(?\d{3}\)?[\s-.]?\d{3}[\s-.]?\d{4}([\s]?[xX]?\d{1,9})?$/,
            digit_ptrn = /^\d{10}$/;
        checkTypeSupport($(this).attr('type'));
        return phone_ptrn.test(_value) || digit_ptrn.test(_value);
      },
      'is-url' : function(_value, _settings){
        var URL_ptrn = /(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/;
        checkTypeSupport($(this).attr('type'));
        return URL_ptrn.test(_value);
      },
      'match-regex' : function(_value, _settings){
        var regexAttrVal = $(this).attr(_settings.attributes.regex),
            regexStr = regexAttrVal,
            regexParams = '',
            regex;
        if(regexAttrVal.indexOf('/') === 0){
          regexParams = regexAttrVal.substr(regexAttrVal.lastIndexOf('/')+1);
          regexStr = regexAttrVal.substr(1, regexAttrVal.lastIndexOf('/')-1);
          regex = new RegExp(regexStr, regexParams);
        }
        regex = new RegExp(regexStr, regexParams);
        checkTypeSupport($(this).attr('type'));
        return regex.test(_value);
      }
    },

    // messageHandlers ======================================================= >

    'messageHandlers' : {
      'general' : function(_value, _settings){
        var $field = $(this),
            $form = $field.parents('form'),
            targetSelector = $field.attr(_settings.attributes.errorMsgSelector) ||
                             _settings.selectors.errorMessageTarget,
            $messageArea = $(targetSelector),
            $preExistingErrors = $('.error-msg', $messageArea),
            $messageTarget = $('<div>').addClass('error-msg'),
            message = $field.attr(_settings.attributes.errorMsg) ||
                      _settings.genericErrorMessage,
            errorClass = $field.attr(_settings.attributes.errorClass) ||
                         _settings.errorClass;
        $messageArea.add($field).add($form).addClass(errorClass);
        if( $preExistingErrors.length === 0 || $preExistingErrors.html().indexOf( message ) < 0 ){
          $messageTarget.html( message );
          $messageTarget.appendTo($messageArea);
        }
      },
      'remove-messages' : function(_value, _settings){
        var $field = $(this),
            $form = $field.parents('form'),
            targetSelector = $field.attr(_settings.attributes.errorMsgSelector) ||
                             _settings.selectors.errorMessageTarget,
            $messageTarget = $(targetSelector),
            $messages = $('div.error-msg', $messageTarget);
        $messageTarget.add($field).add($form).removeClass(_settings.attributes.errorClass);
        $messages.remove();
      }
    }
  },
  // END defaults ============================================================ >

  /* ========================================================================= >

    checkTypeSupport is a utility method to consistently throw errors if
    inputs do not support validation type

  =========================================================================== */

  checkTypeSupport = function checkTypeSupport(_type){
    if(_type === 'radio' || _type === 'checkbox'){
      throw new Error('input type "' + _type + '" can only be validated as "not-empty".');
    }
  };

  // Plugin code ============================================================= >

  $.fn.formHandler = function formHandler(_options){
    var // extend defaults with _options to override default functionality
        // and extend with new functionality
        settings = $.extend(true, {}, defaults, _options),
        // okToSubmit is set in validation and checked prior to submission
        okToSubmit = true,
        // utility function to run a single validator by name with the proper
        //signature and 'this' value on a single field
        validateByName = function validateByName(_validatorName, _$field){
          var valid = true,
              fieldRequired = _$field.is('[required]');
          // only attempt validation if a field is required or not empty
          if(fieldRequired || _$field.val() !== ''){
            valid = settings.validators[_validatorName].call(
              _$field[0],
              _$field.val(),
              settings
            );
          }
          return valid;
        },
        // utility function to loop all validators on a field and pass them to
        // validateByName
        runFieldValidators = function runFieldValidators(_$field){
          var validatorString = _$field.attr( settings.attributes.validationType ),
              validatorNames = (validatorString || 'not-empty').split(' '),
              validated = true;
          clearMessages( _$field );
          // test validator names for dev feedback
          $.each(validatorNames, function( _index, _validatorName ){
            if(typeof settings.validators[_validatorName] !== 'function'){
              window.console.error(
                [ _validatorName,
                  ' is not a valid data-validation-type for: ',
                  _$field[0].nodeName.toLowerCase(),
                  '[name="',
                  _$field[0].name,
                  '"]'
                ].join('')
              );
            }
          });
          // run each validator until one fails
          $.each(validatorNames, function( _index, _validatorName ){
            var fieldRequired = _$field.is('[required]');
            validated = validated ? validateByName( _validatorName, _$field ) : validated;
            // required fields or validating non-required fields get a shot at
            // invalidating the form
            if((fieldRequired || !validated) && okToSubmit){
              // set okToSubmit to false if the field invalid and not required
              // or to the value of validated (true or false) if the field is required
              okToSubmit = validated;
            }
          });
          if(!validated){
            displayValidationMessage( _$field );
          }
        },
        clearMessages = function clearMessage(_$field){
          settings.messageHandlers['remove-messages'].call(
            _$field[0],
            _$field.val(),
            settings
          );
        },
        // utility function to display messaging
        displayValidationMessage = function displayValidationMessage( _$field ){
          var handler = _$field.attr(settings.attributes.errorHandler) || 'general';
          settings.messageHandlers[handler].call(
            _$field[0],
            _$field.val(),
            settings
          );
        },

        /* =================================================================== >
          Configuration functions set event handlers for form methods within a
          jQuery each (thus controlling the signature) below.
        ===================================================================== */

        // set required field label classes
        configRequired = function configRequired(_i, _field){
          var $field = $(_field),
              $label = $('label[for=' + $field.attr('name').replace('[]', '')+']');
          $label = $label.add('label[for='+$field.attr('id')+']');
          $label.addClass('required-label');
        },
        // set formatters to execute formatting functions on blur with the proper
        // signature and 'this' scope
        configFormatter = function configFormatter(_i, _field){
          var $field = $(_field);
          $field.on('blur', function(_e){
            var formatters = $field.attr(settings.attributes.formatter).split(' '),
                formattedVal = $field.val();
            $.each(formatters, function(_index, _formatter){
              formattedVal = settings.formatters[_formatter].call(
                $field[0],
                formattedVal,
                settings
              );
            });
            $field.val(formattedVal);
          });
        },

        // set up event emmitting based on attributes
        configEventEmitter = function configEventEmitter(_i, _field){
          var $field = $(_field),
              uiEvents = $.map(
                settings.attributes.customEvents,
                function(_item, _index){
                  if( $field.attr(_item) ){
                    return _item.split('-')[1];
                  }
                }
              ),
              broadcastEvents = $.map(
                settings.attributes.customEvents,
                function(_attr, _index){
                  return $field.attr(_attr);
                }
              ),
              $form;
          $field.on( uiEvents.join(' '), function(_e){
            var eventIndex = uiEvents.indexOf(_e.type);
            $form = $form || $field.parents('form');
            _e.type = broadcastEvents[eventIndex];
            $form.trigger( _e, [$field.val()] );
          });
        };

    // plugin boilerplate and main app code ================================== >
    return this.each(function(_i, _form){
      var $form = $(_form),
          $requiredFields = $( settings.selectors.required, $form ),
          $validatedFields = $( settings.selectors.validation, $form ),
          $formattedFields = $( settings.selectors.format, $form ),
          $eventedFields = $( settings.selectors.event, $form ),

          // form processing master function delegate
          processForm = function processForm(_event){
            var $toProcess = typeof _event !== 'undefined' &&
                             _event.currentTarget !== _event.target ?
                              $(_event.currentTarget) :
                              $validatedFields.add($requiredFields),
                errorDisplayed = false;

            // reset
            okToSubmit = true;

            // validate
            $toProcess.each(function(_i, _field){
              runFieldValidators($(_field));

              // roboscroll
              if(!okToSubmit && !errorDisplayed && settings.scrollToError){
                var fieldTop = $(_field).offset().top,
                    $container = $(_field).parent(),
                    containerTop = $container.offset().top;

                errorDisplayed = true;

                $('html, body').animate({
                    scrollTop: ( containerTop - 200 )
                  },
                  300
                );
              }
            });
          };

      // configure fields with the above functions where applicable
      $requiredFields.each( configRequired );
      $formattedFields.each( configFormatter );
      $eventedFields.each( configEventEmitter );

      // allow custom validators by overriding HTML5 validators
      $form.attr('novalidate', 'novalidate');

      // listen for validation requests
      $form.on('validate', processForm);

      // trigger validation on submit
      $form.on('submit', function(_e){
        _e.preventDefault();
        processForm();
        if(okToSubmit){
          $form[0].submit();
        }
      });

    });
  };

}(jQuery));