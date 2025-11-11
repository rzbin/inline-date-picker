import { type Command, moment } from "obsidian"
import InlineDatePickerPlugin from "src/main"

export const insertTodaysDate: Command = {
	id: "insert-todays-date",
	name: "Insert today's date",
	editorCallback: (editor) => {
		const format = InlineDatePickerPlugin.settings.dateFormat
		const formattedDate = moment().format(format)
		const cursor = editor.getCursor()
		editor.replaceRange(formattedDate, cursor)
		editor.setCursor(cursor.line, cursor.ch + formattedDate.length)
	},
}
