import { semver } from "bun"

// Check if the version in package.json and manifest.json are the same
const packageJson = await Bun.file("package.json").json()
const manifestJson = await Bun.file("manifest.json").json()

if (packageJson.version !== manifestJson.version) {
	console.error(
		`Version mismatch: package.json is ${packageJson.version}, manifest.json is ${manifestJson.version}`,
	)
	process.exit(1)
}

console.log(`Version check passed: ${packageJson.version}`)

// Check the new version is greater than the version on the main branch
const oldPackageJson = await Bun.$`git show origin/main:package.json`.json()

if (semver.order(packageJson.version, oldPackageJson.version) !== 1) {
	console.error(
		`Version not increased: package.json is ${packageJson.version}, but main branch has ${oldPackageJson.version}`,
	)
	process.exit(1)
}

console.log(
	`Version increase check passed: ${oldPackageJson.version} -> ${packageJson.version}`,
)
