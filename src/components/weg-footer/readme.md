# weg-footer



<!-- Auto Generated Below -->


## Properties

| Property | Attribute | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Type                                                                                                                                    | Default     |
| -------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `layout` | `layout`  | Layout payload, supplied by the host application.  In JS / framework templates, pass the object directly (e.g. Angular `[layout]="layoutData"`, React `layout={layoutData}`, vanilla `el.layout = layoutData`).  In plain HTML, pass the same JSON as a string on the `layout` attribute.  Expected shape: ```json {   "footer": {     "social": [{ "platform": "LinkedIn", "href": "https://..." }],     "standardLinks": [{ "label": "About Us", "href": "/about" }],     "credits": "...",     "copyright": "..."   } } ``` | `string \| { header?: unknown; footer?: Partial<{ social: unknown; standardLinks: unknown; credits: unknown; copyright: unknown; }>; }` | `undefined` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
