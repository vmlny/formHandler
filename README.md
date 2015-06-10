# jQuery Form Toolkit Plugin
============================
## jquery.formHandler

The formHandler jQuery plug provides Validation, Messaging, Formatting, and Custom Eventing through simple HTML5 markup and customization variables.

## Features

Through HTML5 data attributes and a configuration object the formHandler plugin provides:

* Simple built-in validation of:
  + the presence of a value
  + email and phone numbers
  + detection of numeric values
  + required lengths and length ranges
  + equality to an expected value
  + custom regular expression patterns

* The ability to extend validation to custom functions

* Simple field value transformation/formatting:
  + Capitalize/Lowercase/Uppercase input value
  + Provide a custom pattern to insert characters or control case.

* The ability to extend formatting/transformation with custom functions

* Custom form event triggering based on specific field input/focus to monitor progress and execute javascript prior to submission at any point.


## Getting Started

FormHandler is a standard jQuery Plugin that provides the `formHandler` method to jQuery objects in web browser javascript environments. As such, the primary prerequisite is jQuery.

### Downloading the Plugin

This repo houses both the development and minified/obfuscated versions of the plugin as well as sample code.

#### Repository File Structure

      .
      ├─ src
      │   └─ ui
      │       └─ js
      │           └─ components
      │              └─ jquery.formHandler.js
      ├─ bin
      │   └─ ui
      │       └─ js
      │           └─ components
      │              └─ jquery.formHandler.js
      └─ examples

  __`./src/ui/js/components/jquery.formHandler.js`__ is the location of the commented development version of the plugin.

  __`./bin/ui/js/components/jquery.formHandler.js`__ is the location of the minified/obfuscated version of the plugin.

  __`./examples/`__ is the location of working sample code.

### Requirements

* jQuery > 1.9.0
* target browsers IE9 and above (for now)

### Including it in your page

Include jQuery and the plugin on your page, select the form to process then and call the formHandler method.

```html
<!DOCTYPE html>
<html lang="en">
  <body>
    <form action="#" id="handledForm">
      <input type="text" name="firstName" id="firstName" required>
    </form>
    <script src='path-to-js/jquery.js'></script>
    <script src='path-to-js/jquery.formHandler.js'></script>
    <script>
      $('#handledForm').formHandler();
    </script>
  </body>
</html>
```

## Configuration & Invocation:

Configuration of the plugin is done when the plugin is invoked. Configuration tasks include providing selector strings for fields, regexp and formatting patterns as well as custom form processing functions for validation or processing. The configuration object passed to the formHandler method can also be used to override the default validators and formatters as well.

```javascript
$('form').formHandler({
  'selectors' : {
    'event' : '.break-form'
  },
  'attributes':{
    'customEvents' : [
      'data-keyup-event'
    ]
  }
});
```

### Default Configuration Object:

For the purpose of overriding the default configuration and as a reference the default object is outlined below. Please note that unless you are overriding the default form methods the keys in this object should not be changed or removed. View the source code for more detail.

```javascript
{
  'selectors' : {
    'validation'       : '[data-validation-types]',
    'required'         : '[required]',
    'format'           : '[data-formatter]',
    'event'            : '[data-focus-event], [data-blur-event], [data-keydown-event]',
  }
  'attributes' : {
    'validationType'   : 'data-validation-types',
    'errorMsgSelector' : 'data-error-message-area',
    'errorMsg'         : 'data-error-message',
    'errorClass'       : 'data-error-class',
    'errorHandler'     : 'data-error-handler',
    'formatter'        : 'data-formatter',
    'format'           : 'data-formatter-pattern',
    'formatXformCase'  : 'data-formatter-transform-case',
    'trimFormatting'   : 'data-formatter-trim',
    'lengthMax'        : 'data-length-max',
    'lengthMin'        : 'data-length-min',
    'length'           : 'data-length',
    'disclude'         : 'data-disclude',
    'dontCount'        : 'data-do-not-count',
    'regex'            : 'data-pattern',
    'customEvents'     : [
                           'data-focus-event',
                           'data-blur-event',
                           'data-keydown-event'
                         ]
  },
  'dontCount' : /(\-|\.|\s|\(|\))/g,
  'formatPatternWildCard' : 'x',
  'genericErrorMessage' : 'Please complete all required fields.',
  'errrorBucketSelector' : '.error-area',
  'formatters' : {
    'uppercase'        : function(_value, _settings){ ... },
    'lowercase'        : function(_value, _settings){ ... },
    'capitalize'       : function(_value, _settings){ ... },
    'match-pattern'    : function(_value, _settings){ ... }
  },
  'validators' : {
    'not-empty'        : function(_value, _settings){ ... },
    'in-length-range'  : function(_value, _settings){ ... },
    'is-length'        : function(_value, _settings){ ... },
    'is-numeric'       : function(_value, _settings){ ... },
    'is-inequal'       : function(_value, _settings){ ... },
    'is-email'         : function(_value, _settings){ ... },
    'is-phone'         : function(_value, _settings){ ... },
    'is-url'           : function(_value, _settings){ ... },
    'match-regex'      : function(_value, _settings){ ... }
  },
  'messageHandlers' : {
    'general'          : function(_value, _settings){ ... }
  }
}
```

__`selectors`__ These are the jQuery sizzle selectors used to target the form fields for validation, formatting, custom event triggering and requirement.

__`attributes`__ These are the HTML5 data attribute names used to gather information for form methods

__`formatPatternWildCard`__ This is the string value replaced with field value characters within a formatter pattern. By default 'x' is used so a pattern for a US Social Security Number using this character may be expressed as 'XXX-XX-XXXX' or 'xxx xx xxxx'.

__`formatters` `validators` & `messageHandlers`__ Represent the customizable form methods for the plugin. All of these methods have the same signature. They are passed the value of the field they are acting on and the settings object derived by extending this default object with the object passed in at the formHandler invocation. They execute with the `this` keyword set to the element they are acting on to permit access to the data-attributes on the element. Only validators are required to return a value, formatters and messageHandlers are expected to act on either the value of the field or the markup of the feedback area.

__`formatters`__ Formatters transform the value of a field in some way when the focus on said field is blurred. They do not return a value

__`validators`__ Validators test the value of a field in some way and return their validity as a boolean value.

__`messageHandlers`__ MessageHandlers provide feedback to the user in some way. They are executed when a validation fails.


## Use

Within forms the plugin is used through a combination of HTML5 data-attributes and the required attribute.

### Example:

```html
<!DOCTYPE html>
<html lang="en">
  <body>
    <form action="#" id="handledForm">
      <input
             type="text"
             name="homePhone"
             id="homePhone"
             required
             data-validation-types="is-phone"
             data-error-class="validation-error"
             data-error-message-area=".error-bin"
             data-error-message="<p>Phone numbers should contain no letters and be 10 digits long.</p>"
             data-blur-event="phoneComplete"
             data-formatter="match-pattern"
             data-formatter-transform-case="false"
             data-formatter-pattern="(XXX)XXX-XXXX">
    </form>
    <div class="error-bin"></div>
    <script src='path-to-js/jquery.js'></script>
    <script src='path-to-js/jquery.formHandler.js'></script>
    <script>
      $('#handledForm').formHandler();
    </script>
  </body>
</html>
```
### Default Attributes

__`required`__ The `required` HTML5 attribute is used to indicate a field is required. Default HTML5 validation is disabled on the form allowing custom validators to run. With no other validators assigned the presence of this attribute triggers `not-empty` validation.

__`data-validation-types`__ This attribute specifies the validators to run on the input as a space deliminated list of the keys to functions in the `validators` configuration object.

__`data-error-message-area`__ This attribute specifies the selector for the area where the errors for this field should be displayed.

__`data-error-message`__ This attribute specifies the text displayed when validation fails

__`data-error-class`__ This attribute allows the definition of a classname to be applied to the field and the error message area for error styling.

__`data-error-handler`__ This attribute corresponds to the key(s) to a custom form method defined in the `messageHandler` configuration object if there is one. `general` is used if none is provided.

__`data-formatter`__ This attribute corresponds to the key(s) to a form method defined in the `formatter` configuration object. Multiple functions can be run if the provided value is a space delimited string.

__`data-formatter-pattern`__ This attribute is used by the `match-pattern` formatter form method to define the pattern used in transforming the output.

__`data-formatter-transform-case`__ This boolean attribute is used to toggle the case sensitivity of the value of the replacement character (defined in the `formatPatternWildCard` configuration value) when the `data-formatter-pattern` (above) is used.

__`data-formatter-trim`__ This boolean attribute is used to toggle whether the output string contains all of the input characters when the `data-formatter-pattern` (above) is used and the input exceeds the pattern's length.

__`data-length-max`__ This numeric value is the maximum length the value can be when used with the `in-length-range` validation method

__`data-length-min`__ This numeric value is the minimum length the value can be when used with the `in-length-range` validation method

__`data-length`__ This numeric value is the expected length of the value when used with the `is-length` validation method

__`data-donut-accept`__ This attribute value allows 'do not allow'(donut allow) words when used together with the `is-inequal` validation form method. Values passed here are used as a haystack where field values are searched for (as needle). If the value of the attribute was 'abcdef', a filed value of 'cde' would fail validation.

__`data-do-not-count`__ This attribute is converted to a RegExp that allows the implementer to disclude certain characters when comparing lengths. This overrides the configuration option and is used with the `in-length-range` and `is-length` validation methods.

__`data-pattern`__ This attribute is converted to RegExp that the field value is tested against when used in conjunction with the `match-regex` validation form method.

__`data-focus-event`__, __`data-blur-event`__, __`data-keydown-event`__ The value of these attributes will be the name of an event dispatched from the form element on focus, blur or keydown of the field. Other events will require a custom event to be defined. Custom events for fields should have the following naming convention: "data-{EVENT_NAME}-event".