# weg-header



<!-- Auto Generated Below -->


## Properties

| Property         | Attribute          | Description                                                                                                                                                                                                                                                                                                                        | Type                                                                                    | Default     |
| ---------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------- |
| `accountBaseUrl` | `account-base-url` | Account portal origin for the built-in signed-in fallback menu (when `header.menu` is empty). Menu links from the CMS use their `href` as-is. Defaults to production when omitted.                                                                                                                                                 | `string`                                                                                | `undefined` |
| `currentPath`    | `current-path`     | Current page path from the host application (e.g. `/career-advice/my-article`). Include a query string when matching dropdown links that use search params.                                                                                                                                                                        | `string`                                                                                | `undefined` |
| `layout`         | `layout`           | Layout payload, supplied by the host application.  Expected shape: ```json {   "header": {     "menu": [       { "label": "Find a job", "items": [{ "label": "Graduates", "href": "..." }] },       { "label": "Career advice", "href": "/career-advice" },       { "label": "Sign in", "href": "/account/login" }     ]   } } ``` | `string \| { header?: Partial<LayoutHeaderData>; footer?: Partial<LayoutFooterData>; }` | `undefined` |
| `signedIn`       | `signed-in`        | Session flag from the host app. Enables signed-in UI (icons, compact manage account). Navigation uses `layout.header.menu` when provided; falls back to the built-in signed-in menu only when signed in and the layout menu is empty.                                                                                              | `boolean`                                                                               | `false`     |
| `userName`       | `user-name`        | Signed-in user's first name, shown beside the profile icon on Manage Account.                                                                                                                                                                                                                                                      | `string`                                                                                | `undefined` |


## Events

| Event          | Description                                                                                                                     | Type                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `wegAuthClick` | Fired when the user clicks Sign in or Sign out. Call `event.preventDefault()` in the host to handle navigation/logout yourself. | `CustomEvent<{ action: LayoutHeaderAuthAction; }>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
