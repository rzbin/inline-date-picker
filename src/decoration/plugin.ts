import { syntaxTree } from "@codemirror/language"
import { RangeSetBuilder } from "@codemirror/state"
import {
	Decoration,
	type DecorationSet,
	type EditorView,
	type PluginSpec,
	type PluginValue,
	ViewPlugin,
	type ViewUpdate,
	WidgetType,
} from "@codemirror/view"
import { moment } from "obsidian"
import InlineDatePickerPlugin from "src/main"

class InlineDatePickerWidget extends WidgetType {
	from: number
	to: number
	date: moment.Moment
	format: string

	input: HTMLInputElement

	constructor(from: number, to: number, date: moment.Moment, format: string) {
		super()
		this.from = from
		this.to = to
		this.date = date
		this.format = format
		this.input = createEl("input")
	}

	toDOM(view: EditorView): HTMLElement {
		this.input.type = "date"
		this.input.value = this.date.format("YYYY-MM-DD")
		this.input.classList.add("inline-date-picker-input")

		// To prevent using the text input
		this.input.addEventListener("mouseup", (e) => {
			e.preventDefault()
			this.input.blur()
			this.input.showPicker()
		})

		// Workaround to return focus to the editor when the picker is closed
		this.input.addEventListener("mouseup", () => {
			view.focus()
		})
		this.input.addEventListener("blur", () => {
			view.focus()
		})
		this.input.addEventListener("keydown", () => {
			view.focus()
		})

		this.input.onchange = () => {
			const date = moment(this.input.value)
			const formattedDate = date.format(this.format)
			const link = `[[${formattedDate}]]`

			// Check if the cursor is within the range from-to, if so, move it to the end of the inserted date
			const cursor = view.state.selection.main
			const isCursorInRange =
				cursor.anchor >= this.from && cursor.anchor <= this.to
			const selection = isCursorInRange
				? {
						anchor: this.from + link.length,
					}
				: undefined

			const transaction = view.state.update({
				changes: {
					from: this.from,
					to: this.to,
					insert: link,
				},
				selection,
			})
			view.dispatch(transaction)
		}

		return this.input
	}

	showPicker() {
		this.input.focus({ preventScroll: true })
		this.input.showPicker()
	}

	override eq(other: InlineDatePickerWidget): boolean {
		return (
			this.from === other.from &&
			this.to === other.to &&
			this.date.isSame(other.date) &&
			this.format === other.format
		)
	}
}

export class InlineDatePickerViewPlugin implements PluginValue {
	decorations: DecorationSet
	widgets: InlineDatePickerWidget[] = []

	constructor(view: EditorView) {
		this.decorations = this.buildDecorations(view)
	}

	update(update: ViewUpdate) {
		if (update.docChanged || update.viewportChanged || update.focusChanged) {
			this.decorations = this.buildDecorations(update.view)
		}
	}

	destroy() {}

	buildDecorations(view: EditorView): DecorationSet {
		this.widgets = []
		const builder = new RangeSetBuilder<Decoration>()

		for (const { from, to } of view.visibleRanges) {
			syntaxTree(view.state).iterate({
				from,
				to,
				enter: (node) => {
					if (node.type.name.startsWith("hmd-internal-link")) {
						const nodeText = view.state.doc.sliceString(node.from, node.to)
						const format = InlineDatePickerPlugin.settings.dateFormat
						const date = moment(nodeText, format, true)

						if (!date.isValid()) {
							return
						}

						const widget = new InlineDatePickerWidget(
							node.from - 2,
							node.to + 2,
							date,
							format,
						)

						this.widgets.push(widget)

						builder.add(
							node.from,
							node.from,
							Decoration.replace({
								widget,
							}),
						)
					}
				},
			})
		}

		return builder.finish()
	}
}

const pluginSpec: PluginSpec<InlineDatePickerViewPlugin> = {
	decorations: (value: InlineDatePickerViewPlugin) => value.decorations,
}

export const inlineDatePickerViewPlugin = ViewPlugin.fromClass(
	InlineDatePickerViewPlugin,
	pluginSpec,
)
