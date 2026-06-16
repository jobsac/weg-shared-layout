# weg-header



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute          | Description                                                                                                                                                                                                                                                                                                                        | Type                                                                                    | Default     |
| ---------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------- |
| `accountBaseUrl` | `account-base-url` | Account portal origin for sign-in, register, dashboard, and manage-account links. Defaults to production when omitted.                                                                                                                                                                                                             | `string`                                                                                | `undefined` |
| `layout`         | `layout`           | Layout payload, supplied by the host application.  Expected shape: ```json {   "header": {     "menu": [       { "label": "Find a job", "items": [{ "label": "Graduates", "href": "..." }] },       { "label": "Career advice", "href": "/career-advice" },       { "label": "Sign in", "href": "/account/login" }     ]   } } ``` | `string \| { header?: Partial<LayoutHeaderData>; footer?: Partial<LayoutFooterData>; }` | `undefined` |
| `signedIn`       | `signed-in`        | When true, the header uses the built-in signed-in menu instead of the CMS layout.                                                                                                                                                                                                                                                  | `boolean`                                                                               | `false`     |
| `userName`       | `user-name`        | Signed-in user's first name, shown beside the profile icon on Manage Account.                                                                                                                                                                                                                                                      | `string`                                                                                | `undefined` |


## Events

| Event          | Description                                                                                                                     | Type                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `wegAuthClick` | Fired when the user clicks Sign in or Sign out. Call `event.preventDefault()` in the host to handle navigation/logout yourself. | `CustomEvent<{ action: LayoutHeaderAuthAction; }>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
