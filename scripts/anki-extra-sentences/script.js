// SPDX-License-Identifier: GPL-3.0-or-later
// Configuration: set your sentence API's address and optional bearer key here.
const API_URL = "";
const API_KEY = "";

if (!globalThis.HDAnkiPreparation) return;

HDAnkiPreparation.register("examples", async (context, { request }) => {
  if (!API_URL) throw new Error("Set API_URL in the Anki extra sentences script.");
  const address = new URL(API_URL);
  address.searchParams.set("word", context.term.expression);
  address.searchParams.set("reading", context.term.reading);
  const response = await request(address.href, { headers: API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {} });
  if (!response.ok) throw new Error("The sentence API did not accept the request.");
  const data = await response.json();
  if (!Array.isArray(data.sentences) || data.sentences.some(sentence => typeof sentence !== "string")) {
    throw new Error("The sentence API must return a sentences array of strings.");
  }
  return { examples: data.sentences.join("\n") };
});
