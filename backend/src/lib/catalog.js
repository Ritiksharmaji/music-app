// All third-party catalogs behind one interface. Each category carries its `source`
// so clients can label rows (YouTube / Jamendo; our uploads are "ours").

import * as jamendo from "./jamendo.js";
import * as youtube from "./youtube.js";

const providers = [
	{ source: "youtube", provider: youtube },
	{ source: "jamendo", provider: jamendo },
];

// providers without an API key are skipped
const enabled = () => providers.filter(({ provider }) => provider.isEnabled());

export const listCategories = () =>
	enabled().flatMap(({ source, provider }) =>
		provider.CATEGORIES.map(({ id, name, group }) => ({ id, name, group, source }))
	);

const findProvider = (categoryId) =>
	enabled().find(({ provider }) => provider.CATEGORIES.some((c) => c.id === categoryId))?.provider;

export const getCategorySongs = async (categoryId) => {
	const provider = findProvider(categoryId);
	return provider ? provider.getCategorySongs(categoryId) : null;
};

export const warmCaches = async () => {
	for (const { source, provider } of providers) {
		if (provider.isEnabled()) await provider.warmCache();
		else console.log(`Discover: ${source} API key not set, skipping`);
	}
};
