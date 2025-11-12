import type { EditorView } from "@codemirror/view"
import { type Command, Notice } from "obsidian"
import {
	type InlineDatePickerViewPlugin,
	inlineDatePickerViewPlugin,
} from "src/decoration/plugin"

export const openDatePicker: Command = {
	id: "open-date-picker",
	name: "Open date picker",
	editorCallback: (editor, view) => {
		// @ts-expect-error, not typed
		const editorView = view.editor?.cm as EditorView

		const plugin = editorView.plugin(
			inlineDatePickerViewPlugin,
		) as InlineDatePickerViewPlugin

		if (!plugin) {
			console.error("`inlineDatePickerViewPlugin` not found.")
		}

		// Attempt to open the date picker of an existing widget at the cursor position
		const offset = editor.posToOffset(editor.getCursor())
		const widgets = plugin.widgets
		for (const widget of widgets) {
			if (offset >= widget.from && offset <= widget.to) {
				widget.showPicker()
				return
			}
		}

		new Notice("No date picker found at cursor position.")
	},
}
