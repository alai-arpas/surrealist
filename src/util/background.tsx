import { adapter } from "~/adapter";
import { useConfigStore } from "~/stores/config";
import { useInterfaceStore } from "~/stores/interface";
import { setEditorTheme } from "./editor";

function savePreference({ matches }: { matches: boolean }) {
	useInterfaceStore.getState().setColorPreference(matches ? "light" : "dark");
}

/**
 * Watch for browser color preference changes and save them to the store
 */
export function watchColorPreference() {
	const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');

	savePreference(mediaQuery);

	mediaQuery.addEventListener('change', savePreference);
}

function computeColorScheme() {
	const { colorScheme } = useConfigStore.getState();
	const { colorPreference } = useInterfaceStore.getState();

	const actualScheme = colorScheme === "auto" ? colorPreference : colorScheme;

	useInterfaceStore.getState().setColorScheme(actualScheme);
	setEditorTheme(actualScheme);
}

export function watchColorScheme() {
	useConfigStore.subscribe((state, prev) => {
		if (state.colorScheme !== prev.colorScheme) {
			computeColorScheme();
		}
	});

	useInterfaceStore.subscribe((state, prev) => {
		if (state.colorPreference !== prev.colorPreference) {
			computeColorScheme();
		}
	});
}

/**
 * Watch for changes to the store and save the config to the adapter
 */
export async function watchConfigStore() {
	const config = await adapter.loadConfig();

	useConfigStore.setState(JSON.parse(config));

	useConfigStore.subscribe((state) => {
		adapter.saveConfig(JSON.stringify(state));
	});
}