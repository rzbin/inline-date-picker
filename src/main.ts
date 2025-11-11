import { type App, moment, Plugin, PluginSettingTab, Setting } from "obsidian"
import { insertTodaysDate } from "src/commands/insertTodaysDate"
import { insertTodaysDateLink } from "src/commands/insertTodaysDateLink"
import { openDatePicker } from "src/commands/openDatePicker"
import { inlineDatePickerViewPlugin } from "src/decoration/plugin"

export interface InlineDatePickerSettings {
	dateFormat: string
}

const DEFAULT_SETTINGS: InlineDatePickerSettings = {
	dateFormat: "YYYY-MM-DD",
}

export default class InlineDatePickerPlugin extends Plugin {
	public static settings: InlineDatePickerSettings

	override async onload() {
		await this.loadSettings()

		this.addCommand(insertTodaysDate)
		this.addCommand(insertTodaysDateLink)
		this.addCommand(openDatePicker)

		this.addSettingTab(new InlineDatePickerSettingTab(this.app, this))

		this.registerEditorExtension([inlineDatePickerViewPlugin])
	}

	override onunload() {}

	async loadSettings() {
		InlineDatePickerPlugin.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		)
	}

	async saveSettings() {
		await this.saveData(InlineDatePickerPlugin.settings)
		await this.loadSettings()
	}
}

class InlineDatePickerSettingTab extends PluginSettingTab {
	plugin: InlineDatePickerPlugin

	constructor(app: App, plugin: InlineDatePickerPlugin) {
		super(app, plugin)
		this.plugin = plugin
	}

	display(): void {
		const { containerEl } = this

		containerEl.empty()

		const dateFormatDescription = () => {
			const format = InlineDatePickerPlugin.settings.dateFormat
			const example = moment().format(format)
			return `Set the format for inserted dates. Uses Moment.js formatting. Your current syntax looks like this: ${example}`
		}

		const dateFormatSetting = new Setting(containerEl)
			.setName("Date format")
			.setDesc(dateFormatDescription())
			.addText((text) =>
				text
					.setPlaceholder(DEFAULT_SETTINGS.dateFormat)
					.setValue(InlineDatePickerPlugin.settings.dateFormat)
					.onChange(async (value) => {
						InlineDatePickerPlugin.settings.dateFormat = value
						await this.plugin.saveSettings()
						dateFormatSetting.setDesc(dateFormatDescription())
					}),
			)
	}
}
