// Rebuilds ../../resume.pdf from resume.json.
// Usage: pnpm install && pnpm run build   (needs the macOS Georgia fonts)
import { createElement as h } from "react";
import { Document, Page, Text, View, Link, Font, StyleSheet, renderToFile } from "@react-pdf/renderer";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(path.join(here, "resume.json"), "utf8"));
const out = path.resolve(here, "../../resume.pdf");

const fonts = "/System/Library/Fonts/Supplemental/";
Font.register({
  family: "Georgia",
  fonts: [
    { src: fonts + "Georgia.ttf" },
    { src: fonts + "Georgia Bold.ttf", fontWeight: 700 },
    { src: fonts + "Georgia Italic.ttf", fontStyle: "italic" },
    { src: fonts + "Georgia Bold Italic.ttf", fontWeight: 700, fontStyle: "italic" },
  ],
});
Font.registerHyphenationCallback((word) => [word]);

const BODY = Number(process.env.RESUME_FONT_SIZE || 8.5);
const LH = Number(process.env.RESUME_LINE_HEIGHT || 1.14);
const s = StyleSheet.create({
  page: { fontFamily: "Georgia", fontSize: BODY, lineHeight: LH, paddingTop: 16, paddingBottom: 14, paddingHorizontal: 34, color: "#000" },
  name: { fontSize: 20, lineHeight: 1.2, textAlign: "center", marginBottom: 1 },
  contact: { fontSize: BODY - 0.4, lineHeight: 1.3, textAlign: "center", marginBottom: 3 },
  link: { color: "#000", textDecoration: "underline" },
  section: { fontSize: BODY + 1.5, lineHeight: 1.3, fontWeight: 700, textTransform: "uppercase", borderBottomWidth: 0.8, borderBottomColor: "#000", paddingBottom: 1, marginTop: 4, marginBottom: 2.5 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  title: { fontSize: BODY + 1, lineHeight: 1.25, fontWeight: 700 },
  when: { fontSize: BODY + 1, lineHeight: 1.25, fontWeight: 700, marginLeft: 8 },
  sub: { fontStyle: "italic", fontSize: BODY + 0.3 },
  entry: { marginBottom: 2.5 },
  bullet: { flexDirection: "row", marginTop: 0.5 },
  dot: { width: 8 },
  btext: { flex: 1 },
  bold: { fontWeight: 700 },
});

const bullet = (children, key) =>
  h(View, { style: s.bullet, key }, h(Text, { style: s.dot }, "•"), h(Text, { style: s.btext }, ...(Array.isArray(children) ? children : [children])));

const sectionTitle = (t) => h(Text, { style: s.section }, t);
const headRow = (left, right) => h(View, { style: s.row }, left, right ? h(Text, { style: s.when }, right) : null);
const subRow = (left, right) => h(View, { style: s.row }, h(Text, { style: s.sub }, left), right ? h(Text, { style: s.sub }, right) : null);

const c = data.contact;
const contactLine = h(Text, { style: s.contact },
  c.location, "  |  ",
  h(Link, { style: s.link, src: "mailto:" + c.email }, c.email),
  ...c.links.flatMap((l) => ["  |  ", h(Link, { style: s.link, src: l.href }, l.label)]),
);

const education = data.education.map((e, i) =>
  h(View, { style: s.entry, key: "edu" + i },
    headRow(h(Text, { style: s.title }, e.school), e.when),
    subRow(e.degree, e.where),
    ...e.bullets.map((b, j) => bullet([h(Text, { style: s.bold, key: "l" }, b.label), b.text], "b" + j)),
  ));

const experience = data.experience.map((e, i) =>
  h(View, { style: s.entry, key: "xp" + i },
    headRow(h(Text, { style: s.title }, e.org), e.when),
    subRow(e.title, e.where),
    ...e.bullets.map((b, j) => bullet(b, "b" + j)),
  ));

const projects = data.projects.map((p, i) =>
  h(View, { style: s.entry, key: "pr" + i },
    headRow(
      h(Text, { style: s.title }, p.name, h(Text, { style: { fontWeight: 400 } }, "  |  ", h(Link, { style: s.link, src: p.link.href }, p.link.label))),
      p.when,
    ),
    ...p.bullets.map((b, j) => bullet(b, "b" + j)),
  ));

const skills = data.skills.map((k, i) => bullet([h(Text, { style: s.bold, key: "l" }, k.label + ": "), k.text], "sk" + i));

const doc = h(Document, { title: data.name + " Resume", author: data.name },
  h(Page, { size: "LETTER", style: s.page },
    h(Text, { style: s.name }, data.name),
    contactLine,
    sectionTitle("Education"), ...education,
    sectionTitle("Experience"), ...experience,
    sectionTitle("Projects"), ...projects,
    sectionTitle("Technical Skills"), ...skills,
  ));

await renderToFile(doc, out);
console.log("wrote", out);
