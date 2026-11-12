# Anki API summary

An example of adding API-provided content to an Anki card. On **Add**, it sends
the word, reading and source sentence to the JSON endpoint you configure and
exports the returned summary. There are no requests when the script loads or
while you look up words.

Requires Hachidori's Anki preparation-script API. On an older Hachidori it does
nothing. This package supplies the integration example; it does not include a
hosted summary service or choose an AI provider.

## Set it up

1. Import `script.js` under **Advanced → User scripts → Import files**, or
   install **Anki API summary** from the Script Store.
2. Edit the script. Set `API_URL` at the top to your service's HTTP(S) address
   and, if it uses bearer authentication, set `API_KEY`. Get the key from your
   service; the shipped key is empty. These source values are the only
   configuration: there are no saved settings that override them.
3. Allow user scripts in your browser, then reload the reading page.
4. Under **Anki**, choose or duplicate a Template. Select this package as its
   preparation script and enter `summary` as its preparation function.
5. Map a field to `{preparation-summary}`. With Handlebars syntax, use
   `{{preparation.summary}}` to retain normal HTML escaping.
6. To keep the ordinary Add button as it is, choose the new Template on a
   custom Anki button under **Design**.

The request is a JSON POST:

```json
{"word":"猫","reading":"ねこ","sentence":"猫が寝ている。"}
```

The expected response is:

```json
{"summary":"A cat; the animal sleeping in this sentence."}
```

Adapt the request body and response extraction in `script.js` to your chosen
AI or dictionary API. Hachidori's `request` helper supports cross-origin
requests and sends no browser cookies. Only the word, reading and sentence
above are sent; the page address and dictionary collection are not sent.

A failed request or response in another shape leaves the card unsent. The
returned summary is plain text, including when it contains HTML-looking text.
Anki's configured destination, duplicate policy, media handling and write
confirmation continue to be owned by Hachidori.
