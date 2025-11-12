# Date Picker

Pick dates using a calendar view in Obsidian.

![Date Picker demo](./assets/demo.gif)

Next to links containing dates, a calendar icon can be used to open a visual date picker to modify the date.

## Commands

- Insert today's date: Inserts the current date at the cursor position.
- Insert today's date as link: Inserts the current date as a link at the cursor position.
- Open date picker: If the cursor touches a date link, open the date picker.

## Settings

- Date format: Set the format of inserted and detected dates using [Moment.js formatting](https://momentjs.com/docs/#/displaying/format/).

## Development

This plugin is built using [Bun](https://bun.sh/).

To install dependencies, run:

```bash
bun install
```

To build the plugin, run:

```bash
bun run build
```

To watch for changes and rebuild automatically, run:

```bash
bun run dev
```

To format, lint, and type-check the code, run:

```bash
bun run check
```

## Manual Installation

Go to the releases page and download `main.js`, `manifest.json`, and `styles.css`. Place them in `<Vault>/.obsidian/plugins/date-picker/`.
