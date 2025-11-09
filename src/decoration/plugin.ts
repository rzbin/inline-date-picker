import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder } from "@codemirror/state";
import {
	ViewUpdate,
	PluginValue,
	EditorView,
	ViewPlugin,
	DecorationSet,
	Decoration,
	WidgetType,
	PluginSpec,
} from "@codemirror/view";
import moment from "moment";

class InlineDatePickerWidget extends WidgetType {
	from: number;
	to: number;
	date: moment.Moment;
	format: string;

	input?: HTMLInputElement;

	constructor(from: number, to: number, date: moment.Moment, format: string) {
		super();
		this.from = from;
		this.to = to;
		this.date = date;
		this.format = format;
	}

	toDOM(view: EditorView): HTMLElement {
		const input = createEl("input");
		input.type = "date";
		input.value = this.date.format("YYYY-MM-DD");
		input.classList.add("inline-date-picker-input");

		// To prevent using the text input
		input.addEventListener("mouseup", (e) => {
			e.preventDefault();
			input.blur();
			input.showPicker();
		});

		input.onchange = () => {
			const date = moment(input.value);
			const formattedDate = date.format(this.format);

			const transaction = view.state.update({
				changes: {
					from: this.from,
					to: this.to,
					insert: formattedDate,
				},
				selection: { anchor: this.from + formattedDate.length },
			});
			view.dispatch(transaction);
			view.focus();
		};

		this.input = input;

		return input;
	}

	showPicker() {
		this.input?.focus({ preventScroll: true });
		this.input?.showPicker();
	}
}

type WidgetPointer = {
	from: number;
	to: number;
	widget: InlineDatePickerWidget;
};

export class InlineDatePickerPluginValue implements PluginValue {
	decorations: DecorationSet;
	widgetPointers: WidgetPointer[];

	constructor(view: EditorView) {
		this.decorations = this.buildDecorations(view);
	}

	update(update: ViewUpdate) {
		if (update.docChanged || update.viewportChanged) {
			this.decorations = this.buildDecorations(update.view);
		}
	}

	destroy() {}

	buildDecorations(view: EditorView): DecorationSet {
		this.widgetPointers = [];
		const builder = new RangeSetBuilder<Decoration>();

		for (let { from, to } of view.visibleRanges) {
			syntaxTree(view.state).iterate({
				from,
				to,
				enter: (node) => {
					if (node.type.name.startsWith("hmd-internal-link")) {
						const nodeText = view.state.doc.sliceString(
							node.from,
							node.to
						);
						// TODO: Get date format from settings.
						const format = "YYYY-MM-DD";
						const date = moment(nodeText, format, true);

						if (!date.isValid()) {
							return;
						}

						const widget = new InlineDatePickerWidget(
							node.from,
							node.to,
							date,
							format
						);

						this.widgetPointers.push({
							from: node.from,
							to: node.to,
							widget,
						});

						builder.add(
							node.from,
							node.from,
							Decoration.replace({
								widget,
							})
						);
					}
				},
			});
		}

		return builder.finish();
	}
}

const pluginSpec: PluginSpec<InlineDatePickerPluginValue> = {
	decorations: (value: InlineDatePickerPluginValue) => value.decorations,
};

export const inlineDatePickerViewPlugin = ViewPlugin.fromClass(
	InlineDatePickerPluginValue,
	pluginSpec
);
