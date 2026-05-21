# weg-header



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Type                                                                                                                                                | Default     |
| ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `layout`   | `layout`    | Layout payload, supplied by the host application.  Expected shape: ```json {   "header": {     "logoHref": "https://www.warwickemploymentgroup.com/",     "dropdowns": [{ "label": "Find a job", "items": [{ "label": "...", "href": "..." }] }],     "links": [{ "label": "Career advice", "href": "/career-advice" }],     "signIn": { "label": "Sign in", "href": "/account/login" },     "signOut": { "label": "Sign out", "href": "/account/login" }   } } ``` | `string \| { header?: Partial<LayoutHeaderData>; footer?: Partial<{ social: unknown; columns: unknown; credits: unknown; copyright: unknown; }>; }` | `undefined` |
| `signedIn` | `signed-in` | When true, the header shows the signed-in navigation (Find a job, Dashboard, Manage Account, Sign out) instead of the CMS layout.                                                                                                                                                                                                                                                                                                                                   | `boolean`                                                                                                                                           | `false`     |
| `userName` | `user-name` | Signed-in user's first name, shown beside the profile icon on Manage Account.                                                                                                                                                                                                                                                                                                                                                                                       | `string`                                                                                                                                            | `undefined` |


## Events

| Event          | Description                                                                                                                     | Type                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `wegAuthClick` | Fired when the user clicks Sign in or Sign out. Call `event.preventDefault()` in the host to handle navigation/logout yourself. | `CustomEvent<{ action: LayoutHeaderAuthAction; }>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
