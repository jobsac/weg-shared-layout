# weg-footer



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Type                                                                                                                                    | Default     |
| -------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `data`   | `data`    | Layout data, supplied by the host application.  In JS / framework templates, pass the object directly (e.g. Angular `[data]="layoutData"`, vanilla `el.data = layoutData`).  In plain HTML, pass the same JSON as a string attribute.  Expected shape: ```json {   "footer": {     "social": [{ "platform": "LinkedIn", "href": "https://..." }],     "standardLinks": [{ "label": "About Us", "href": "/about" }],     "credits": "...",     "copyright": "..."   } } ``` | `string \| { header?: unknown; footer?: Partial<{ social: unknown; standardLinks: unknown; credits: unknown; copyright: unknown; }>; }` | `undefined` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
