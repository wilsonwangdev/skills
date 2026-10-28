import manifest from "../package.json" with { type: "json" };

export const repository = manifest.repository.url.replace(/^git\+/, "").replace(/\.git$/, "");
const owner = new URL(repository).pathname.split("/")[1];
export const siteOrigin = `https://${owner}.github.io`;
export const base = (process.env.DOCS_BASE_PATH ?? `/${manifest.name}`).replace(/\/$/, "");
export { manifest };
