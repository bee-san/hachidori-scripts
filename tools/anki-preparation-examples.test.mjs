// SPDX-License-Identifier: GPL-3.0-or-later
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";

async function load(slug, configured = true, supported = true) {
  let prepare;
  let source = await readFile(new URL(`../scripts/${slug}/script.js`, import.meta.url), "utf8");
  if (configured) source = source.replace('const API_URL = "";', 'const API_URL = "https://api.example.test/lookup?existing=1";')
    .replace('const API_KEY = "";', 'const API_KEY = "test-only-secret";');
  const context = vm.createContext({ URL, ...(supported ? { HDAnkiPreparation: { register(_id, handler) { prepare = handler; } } } : {}) });
  new vm.Script(`(function () {\n${source}\n}).call(globalThis);`).runInContext(context);
  return prepare;
}
const context = { term: { expression: "猫", reading: "ねこ" }, sentence: "猫が寝ている。", pageUrl: "private-address" };

for (const slug of ["anki-api-summary", "anki-extra-sentences"]) {
  test(`${slug} registers without network work, requires configuration and tolerates older Hachidori`, async () => {
    assert.equal(typeof await load(slug), "function");
    assert.equal(await load(slug, false, false), undefined);
    await assert.rejects((await load(slug, false))(context, { request() { throw new Error("Unexpected request"); } }), /API_URL/u);
  });
  test(`${slug} treats HTTP and malformed response failures as unsent preparation errors`, async () => {
    const prepare = await load(slug);
    await assert.rejects(prepare(context, { request: async () => ({ ok: false }) }), /did not accept/u);
    await assert.rejects(prepare(context, { request: async () => ({ ok: true, json: async () => ({ wrong: true }) }) }), /must return/u);
  });
}

test("summary sends only its documented context, authenticates the request and returns plain named data", async () => {
  const prepare = await load("anki-api-summary");
  const result = await prepare(context, { request: async (url, options) => {
    assert.equal(url, "https://api.example.test/lookup?existing=1");
    assert.equal(options.method, "POST");
    assert.equal(options.headers.Authorization, "Bearer test-only-secret");
    assert.deepEqual(JSON.parse(options.body), { word: "猫", reading: "ねこ", sentence: context.sentence });
    return { ok: true, json: async () => ({ summary: "<b>cat</b>" }) };
  } });
  assert.deepEqual(JSON.parse(JSON.stringify(result)), { summary: "<b>cat</b>" });
});

test("sentences preserve query parameters and export every supplied sentence on its own line", async () => {
  const prepare = await load("anki-extra-sentences");
  const result = await prepare(context, { request: async (url, options) => {
    const address = new URL(url);
    assert.deepEqual([...address.searchParams], [["existing", "1"], ["word", "猫"], ["reading", "ねこ"]]);
    assert.equal(options.headers.Authorization, "Bearer test-only-secret");
    assert.equal(options.body, undefined);
    return { ok: true, json: async () => ({ sentences: ["猫が寝ている。", "庭に猫がいる。"] }) };
  } });
  assert.deepEqual(JSON.parse(JSON.stringify(result)), { examples: "猫が寝ている。\n庭に猫がいる。" });
});
