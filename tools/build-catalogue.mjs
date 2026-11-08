#!/usr/bin/env node
// SPDX-License-Identifier: GPL-3.0-or-later
//
// Builds catalogue.json, the one file Hachidori's Script Store reads, from
// scripts/<slug>/. Each package is checked as Hachidori runs it.
//
//   node tools/build-catalogue.mjs           writes catalogue.json
//   node tools/build-catalogue.mjs --check   fails if a package is invalid or
//                                            catalogue.json is out of date
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;
const TEXT_FIELDS = ["name", "description", "author", "version", "license"];
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/u;

function readPackage(slug) {
  const folder = join(ROOT, "scripts", slug);
  const where = `scripts/${slug}`;
  if (!SLUG.test(slug)) throw new Error(`${where}: name the folder with lowercase letters, digits and single hyphens`);
  if (!existsSync(join(folder, "script.json"))) throw new Error(`${where}: add script.json`);
  if (!existsSync(join(folder, "README.md"))) throw new Error(`${where}: add README.md`);
  const meta = JSON.parse(readFileSync(join(folder, "script.json"), "utf8"));
  const keys = Object.keys(meta).sort();
  const expected = ["schema", ...TEXT_FIELDS].sort();
  if (JSON.stringify(keys) !== JSON.stringify(expected)) {
    throw new Error(`${where}/script.json: give exactly ${expected.join(", ")}`);
  }
  if (meta.schema !== 1) throw new Error(`${where}/script.json: schema is 1`);
  for (const field of TEXT_FIELDS) {
    if (typeof meta[field] !== "string" || meta[field].trim() === "" || CONTROL_CHARACTERS.test(meta[field])) {
      throw new Error(`${where}/script.json: ${field} is one line of text`);
    }
  }
  const read = name => (existsSync(join(folder, name)) ? readFileSync(join(folder, name), "utf8") : "");
  const javascript = read("script.js");
  const css = read("script.css");
  if (javascript.trim() === "" && css.trim() === "") throw new Error(`${where}: add script.js, script.css or both`);
  if (javascript) {
    // Hachidori runs a package's JavaScript inside a function of its own.
    try {
      new vm.Script(`(function () {\n${javascript}\n}).call(globalThis);`, { filename: `${where}/script.js` });
    } catch (error) {
      throw new Error(`${where}/script.js: ${error.message}`);
    }
  }
  const { name, description, author, version, license } = meta;
  return { slug, name, description, author, version, license, javascript, css };
}

const slugs = readdirSync(join(ROOT, "scripts"), { withFileTypes: true })
  .filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
const catalogue = `${JSON.stringify({ schema: 1, scripts: slugs.map(readPackage) }, null, 2)}\n`;
const path = join(ROOT, "catalogue.json");
if (process.argv.includes("--check")) {
  if (!existsSync(path) || readFileSync(path, "utf8") !== catalogue) {
    throw new Error("catalogue.json is out of date: run node tools/build-catalogue.mjs and commit it");
  }
  console.log(`${slugs.length} packages; catalogue.json is up to date`);
} else {
  writeFileSync(path, catalogue);
  console.log(`${slugs.length} packages -> catalogue.json`);
}
