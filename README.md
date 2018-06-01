# NGRX TSLint Rules

This was hastily thrown together but fully tested, welcome any feedback.

#### Deprecated:
These rules no longer reflect how to accurately manage NGRX. Consider using typescript enums to manage Action Names.

## `ngrx-action-class-suffix`

### **AutoFixable**

### Description

Will pick up any class that `implements Action` and enforce a suffix to be placed on that class name, **Defaults to 'Action'**

### Example

`"ngrx-action-class-suffix": [true, "CustomSuffix"]`

Error:

    export class UserButtonSubmit implements Action { }

Success:

    export class UserButtonSubmitCustomSuffix implements Action { }

## `ngrx-action-type-property-name`

### **AutoFixable**

### Description

Will enforce case naming conventions on any object terminating with the desired suffix, **Defaults to ActionTypes and CONSTANT_CASE**

### Example

```
"ngrx-action-type-property-name": [
    true,
    "ActionTypes",
    "constant"
]
```

Error:

    export const UserActionTypes = {
        userButtonSubmit: 'user submit button',
        userTextSubmit: type('user submit text')
    }

Success:

    export const UserActionTypes = {
        USER_BUTTON_SUBMIT: 'user submit button',
        USER_TEXT_SUBMIT: type('user submit text')
    }

## `ngrx-action-type-property-value`

### **AutoFixable**

### Description

Will require the property name to be displayed within the property value with case changes when the object name terminates with the given suffix, **Defaults to ActionTypes and 'Title Case'**.

### Example

    "ngrx-action-type-property-value": [
        true,
        "ActionTypes",
        "title",
        true,
        "title"
    ]

Error:

    export const UserActionTypes = {
        USER_BUTTON_SUBMIT: 'user submit button',
        USER_TEXT_SUBMIT: type('user submit text')
    }

Success:

    export const UserActionTypes = {
        USER_BUTTON_SUBMIT: '[User] User Button Submit',
        USER_TEXT_SUBMIT: type('[User] User Text Submit')
    }

### **New**
    Added the rule to require the ActionType prefix inside the property value.

## Notes

All of the above case strings can be replaced with those available here: [NPM Case](https://www.npmjs.com/package/case)

Supports:
- camel: 'thisIsNiceAndTidyNathan',
- snake: 'this_is_nice_and_tidy_nathan',
- kebab: 'this-is-nice-and-tidy-nathan',
- upper: 'THIS IS NICE AND TIDY, NATHAN.',
- lower: 'this is nice and tidy, nathan.',
- header: 'This-Is-Nice-And-Tidy-Nathan',
- sentence: 'This is nice and tidy, nathan.',
- capital: 'This Is Nice And Tidy, Nathan.',
- title: 'This Is Nice and Tidy, Nathan.',
- constant: 'THIS_IS_NICE_AND_TIDY_NATHAN'

## TODO
- Write a rule that will detect when an action class uses a type outside of the allowed rules, example:


```
export class MyAction implements Action {
    type = QuoteActionsList.MY_ACTION;
}
```


Should Be
```
export class MyAction implements Action {
    type = QuoteActionTypes.MY_ACTION;
}
```
