import { watch } from "node:fs"
import { parseArgs } from "node:util"

const BANNER = `/*
THIS IS A BUNDLED FILE BY BUN
if you want to view the source, please visit the github repository of this plugin
*/
`

const { values } = parseArgs({
	args: Bun.argv,
	options: {
		prod: {
			type: "boolean",
			default: false,
		},
	},
	strict: true,
	allowPositionals: true,
})
const isProd = values.prod

async function build() {
	console.log(`Building for ${isProd ? "production" : "development"}...`)

	await Bun.build({
		banner: BANNER,
		entrypoints: ["./src/main.ts"],
		outdir: ".",
		external: [
			"obsidian",
			"electron",
			"@codemirror/autocomplete",
			"@codemirror/collab",
			"@codemirror/commands",
			"@codemirror/language",
			"@codemirror/lint",
			"@codemirror/search",
			"@codemirror/state",
			"@codemirror/view",
			"@lezer/common",
			"@lezer/highlight",
			"@lezer/lr",
		],
		minify: isProd,
		sourcemap: isProd ? false : "inline",
		format: "cjs",
		target: "node",
	})

	console.log("Build completed.")
}

await build()

if (!isProd) {
	console.log("Watching for changes...")
	const SRC = `src`
	const watcher = watch(
		`${import.meta.dir}/${SRC}`,
		{ recursive: true },
		(event, filename) => {
			console.log(`Detected ${event} in ${SRC}/${filename}`)
			build()
		},
	)

	process.on("SIGINT", () => {
		watcher.close()
		process.exit(0)
	})
}
