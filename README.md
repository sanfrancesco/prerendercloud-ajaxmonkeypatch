![image](https://cloud.githubusercontent.com/assets/22159102/21554484/9d542f5a-cdc4-11e6-8c4c-7730a9e9e2d1.png)

# JavaScript client-side Monkey patches for Headless-Render-API.com server-side rendering

This project includes the source and tests for the JavaScript injected into sites running on Headless-Render-API.com

## Ajax-Preload

service.headless-render-api.com caches the AJAX responses from the prerender phase and uses this monkey patch to include them in your HTML as a base64 encoded payload. This solves the "initial state" problem of server-side rendered apps. (where otherwise, there's a screen flash between the initial HTML payload and JavaScript repaint)

## Ajax-Bypass

Adds a header, `X-Prerendered` to all XHR requests that signals to your middleware to skip service.headless-render-api.com and go straight to the origin. (XHR requests don't need to be prerendered because the client has already loaded the app, and most of the time, these payloads are JSON or XML and thus not prerenderable)

## Head DeDupe

Head DeDupe monkeypatches insertBefore and appendChild for children of the head element. Its purpose is to prevent frameworks/libs (React, Angular, Vue, etc.) from insert
ing/appending a script/meta/style tag if it already exists, e.g.:

* duplicate meta tags (SEO)
* duplicate script tags (read: analytics)
* style tags being re-inserted causing incorrect overrides/specificity

Some libraries don't need this because they check the children to see what already exists before inserting/appending (some React style libraries for example). Most Angular libraries do need this.

It's designed to be conservative: if matching script/meta/style is found, remove it, then proceed with normal insert/append. If a match can't be found, or we're inserting an empty style tag, remove nothing and proceed with normal insert/append

Caveats/Issues/Obersvations:

* some libraries ([styled-components](https://github.com/styled-components/styled-components)) won't insert/append style tags if the elements within body are already pre-rendered (so we cannot _always_ delete all pre-rendered style tags)
* some libraries ([react-native-web](https://github.com/necolas/react-native-web)) insert/append empty style tags and then update them (so we can't rely on comparisons during insert/append if the innerHTML is empty)
* some libraries ([JSS](https://github.com/cssinjs/jss)) do search for specific UUIDs of element inserted into head and will re-attach to pre-rendered elements with those UUIDs instead of re-creating

# Running the tests locally

`make start` (now view the results of the tests in your various browsers, e.g.: Chrome, Firefox, Safari, IE etc...)

* http://localhost:8888

# Building (what gets injected)

`make build`
