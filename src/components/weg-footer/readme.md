# weg-footer



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute               | Description                                                                                                                                                                                           | Type                         | Default      |
| --------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------ |
| `additionalGroups`    | `additional-groups`     | Additional footer groups as a JSON string. Example: `[{"id":"set-1","links":[{"label":"Services","href":"/services"}]}]`                                                                              | `string`                     | `undefined`  |
| `additionalGroupsSrc` | `additional-groups-src` | Optional URL to a JSON file for additional groups. If provided, this takes precedence over `additionalGroups`.                                                                                        | `string`                     | `undefined`  |
| `companyName`         | `company-name`          |                                                                                                                                                                                                       | `string`                     | `'WEG'`      |
| `companyNumber`       | `company-number`        |                                                                                                                                                                                                       | `string`                     | `''`         |
| `socialLinks`         | `social-links`          | Social links as a JSON string (for HTML usage). Example: `[{"platform":"LinkedIn","href":"https://..."},{"platform":"X","href":"https://..."}]`  Icons render only for items with a non-empty `href`. | `string`                     | `undefined`  |
| `socialLinksSrc`      | `social-links-src`      | Optional URL to a JSON file for social links. If provided, this takes precedence over `socialLinks`.                                                                                                  | `string`                     | `undefined`  |
| `standardLinks`       | `standard-links`        | Standard footer links as a JSON string. Example: `[{"label":"Privacy Policy","href":"/privacy"}]`                                                                                                     | `string`                     | `undefined`  |
| `standardLinksSrc`    | `standard-links-src`    | Optional URL to a JSON file for standard links. If provided, this takes precedence over `standardLinks`.                                                                                              | `string`                     | `undefined`  |
| `variant`             | `variant`               | `standard` matches the "single group of links" footer. `additional` matches the "multiple link sets" footer.                                                                                          | `"additional" \| "standard"` | `'standard'` |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
