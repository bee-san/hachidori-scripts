// SPDX-License-Identifier: GPL-3.0-or-later
// Configuration: set your JSON API's address and optional bearer key here.
const API_URL = "";
const API_KEY = "";

if (!globalThis.HDAnkiPreparation) return;

HDAnkiPreparation.register("summary", async (context, { request }) => {
  if (!API_URL) throw new Error("Set API_URL in the Anki API summary script.");
  const response = await request(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}) },
    body: JSON.stringify({ word: context.term.expression, reading: context.term.reading, sentence: context.sentence }),
  });
  if (!response.ok) throw new Error("The summary API did not accept the request.");
  const data = await response.json();
  if (typeof data.summary !== "string") throw new Error("The summary API must return a summary string.");
  return { summary: data.summary };
});
