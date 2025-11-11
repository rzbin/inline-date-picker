import { type Command, moment } from "obsidian"
import InlineDatePickerPlugin from "src/main"

export const insertTodaysDateLink: Command = {
	id: "insert-todays-date-link",
	name: "Insert today's date as link",
	editorCallback: (editor) => {
		const format = InlineDatePickerPlugin.settings.dateFormat
		const formattedDate = moment().format(format)
		const link = `[[${formattedDate}]]`
		const cursor = editor.getCursor()
		editor.replaceRange(link, cursor)
		editor.setCursor(cursor.line, cursor.ch + link.length)
	},
}
