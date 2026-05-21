# weg-header



<!-- Auto Generated Below -->


## Properties

| Property   | Attribute   | Description                                                                                                                                                                                                                                                                                                                                                                    | Type                                                                                                                                                | Default     |
| ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `layout`   | `layout`    | Layout payload, supplied by the host application.  Expected shape: ```json {   "header": {     "dropdowns": [{ "label": "Find a job", "items": [{ "label": "...", "href": "..." }] }],     "links": [{ "label": "Career advice", "href": "/career-advice" }],     "signIn": { "label": "Sign in", "href": "/account/login" },     "signOut": { "label": "Sign out" }   } } ``` | `string \| { header?: Partial<LayoutHeaderData>; footer?: Partial<{ social: unknown; columns: unknown; credits: unknown; copyright: unknown; }>; }` | `undefined` |
| `signedIn` | `signed-in` | When true, the auth control shows `header.signOut` instead of `header.signIn`. Set by the host app based on session state.                                                                                                                                                                                                                                                     | `boolean`                                                                                                                                           | `false`     |


## Events

| Event          | Description                                                                                                                     | Type                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `wegAuthClick` | Fired when the user clicks Sign in or Sign out. Call `event.preventDefault()` in the host to handle navigation/logout yourself. | `CustomEvent<{ action: LayoutHeaderAuthAction; }>` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
