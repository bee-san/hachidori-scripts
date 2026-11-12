# Anki extra sentences

An example of adding sentences from your chosen service to an Anki card.
It makes one request on **Add**, then exports the response's sentences as
separate lines. It makes no requests on page load or lookup.

Requires Hachidori's Anki preparation-script API. On an older Hachidori it does
nothing. A hosted sentence service is not included.

## Set it up

1. Import `script.js` under **Advanced → User scripts → Import files**, or
   install **Anki extra sentences** from the Script Store.
2. Edit `API_URL` and the optional bearer `API_KEY` at the top. Obtain any key
   from the service you use. Both shipped values are empty, and there are no
   saved settings overriding the source.
3. Allow user scripts in the browser and reload the reading page.
4. Under **Anki**, choose or duplicate a Template. Select this package as its
   preparation script and enter `examples` as its preparation function.
5. Map a field to `{preparation-examples}`. Each returned sentence gets its
   own line. With Handlebars, use `{{preparation.examples}}` inside the HTML
   layout you want, preserving whitespace if needed.
6. Choose that Template on a custom Anki button under **Design** if you want
   to keep the ordinary Add action separate.

For the word 猫, a configured `https://your-service.example/sentences` receives
an HTTP GET with `word=猫` and `reading=ねこ` URL parameters. Existing URL
parameters are preserved. The expected JSON response is:

```json
{"sentences":["猫が寝ている。","庭に猫がいる。"]}
```

Adapt the parameter names or response extraction in `script.js` for another
API. The helper makes cross-origin requests without browser cookies. The word
and reading are sent; the source sentence, address and dictionary definitions
are not sent.

If the request fails or returns a different shape, the card stays unsent.
Sentences are exported as plain text with normal escaping. The Template still
controls the destination, other fields and duplicate behavior.
