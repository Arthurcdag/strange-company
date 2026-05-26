@tool
extends VBoxContainer


const VAURuntime := preload("res://addons/vautool/vau_runtime.gd")


var scenario_select: OptionButton
var depth_spin: SpinBox
var branches_spin: SpinBox
var observed_select: OptionButton
var output: TextEdit

var current_state: Dictionary = {}
var predicted_futures: Array = []
var observed_events: Array = []


func _ready() -> void:
	if not Engine.is_editor_hint():
		return
	_build_ui()
	_run_vau()


func _build_ui() -> void:
	custom_minimum_size = Vector2(360, 520)

	var title := Label.new()
	title.text = "VAUtool"
	title.add_theme_font_size_override("font_size", 18)
	add_child(title)

	var subtitle := Label.new()
	subtitle.text = "Future branching test dock"
	add_child(subtitle)

	scenario_select = OptionButton.new()
	scenario_select.add_item("Balanced dungeon")
	scenario_select.add_item("Low health danger")
	scenario_select.add_item("Boss pressure")
	scenario_select.item_selected.connect(_on_scenario_selected)
	add_child(scenario_select)

	var controls := HBoxContainer.new()
	add_child(controls)

	var depth_label := Label.new()
	depth_label.text = "Depth"
	controls.add_child(depth_label)

	depth_spin = SpinBox.new()
	depth_spin.min_value = 1
	depth_spin.max_value = 6
	depth_spin.value = 3
	depth_spin.step = 1
	depth_spin.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	controls.add_child(depth_spin)

	var branch_label := Label.new()
	branch_label.text = "Keep"
	controls.add_child(branch_label)

	branches_spin = SpinBox.new()
	branches_spin.min_value = 1
	branches_spin.max_value = 20
	branches_spin.value = 6
	branches_spin.step = 1
	branches_spin.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	controls.add_child(branches_spin)

	var button_row := HBoxContainer.new()
	add_child(button_row)

	var run_button := Button.new()
	run_button.text = "Run VAU"
	run_button.pressed.connect(_run_vau)
	button_row.add_child(run_button)

	var observe_button := Button.new()
	observe_button.text = "Observe"
	observe_button.pressed.connect(_observe_selected_event)
	button_row.add_child(observe_button)

	observed_select = OptionButton.new()
	observed_select.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	add_child(observed_select)

	output = TextEdit.new()
	output.editable = false
	output.wrap_mode = TextEdit.LINE_WRAPPING_BOUNDARY
	output.size_flags_vertical = Control.SIZE_EXPAND_FILL
	output.custom_minimum_size = Vector2(320, 340)
	add_child(output)


func _state_for_scenario(index: int) -> Dictionary:
	var state: Dictionary = VAURuntime.default_state()
	if index == 1:
		state["player"]["health"] = 22
		state["player"]["supplies"] = 0
		state["world"]["threat"] = 4
	elif index == 2:
		state["player"]["keys"] = 1
		state["world"]["threat"] = 5
		state["world"]["boss_pressure"] = 4
	return state


func _on_scenario_selected(_index: int) -> void:
	_run_vau()


func _run_vau() -> void:
	current_state = _state_for_scenario(scenario_select.selected if scenario_select != null else 0)
	var futures := VAURuntime.create_initial_future(current_state)
	predicted_futures = VAURuntime.simulate_futures(
		futures,
		int(depth_spin.value if depth_spin != null else 3),
		int(branches_spin.value if branches_spin != null else 6)
	)
	_refresh_observed_events()
	_show_futures("Predicted futures", predicted_futures)


func _refresh_observed_events() -> void:
	observed_events = VAURuntime.generate_possible_next_events({
		"state": current_state,
		"timeline": [],
		"probability": 1.0,
		"confidence": 1.0,
		"observed_events": 0,
	})
	observed_select.clear()
	for event in observed_events:
		observed_select.add_item(event.get("name", "event"))


func _observe_selected_event() -> void:
	if observed_events.is_empty() or predicted_futures.is_empty():
		return
	var index := observed_select.selected
	if index < 0 or index >= observed_events.size():
		return
	var real_event: Dictionary = observed_events[index]
	var surviving := VAURuntime.update_futures_with_real_event(
		predicted_futures,
		real_event,
		current_state
	)
	current_state = VAURuntime.apply_state_delta(current_state, real_event.get("state_delta", {}))
	predicted_futures = surviving
	_show_futures("After reality observed: %s" % real_event.get("name", "event"), surviving)


func _show_futures(header: String, futures: Array) -> void:
	var lines: Array[String] = []
	lines.append("%s" % header)
	lines.append("State: health=%s supplies=%s keys=%s threat=%s boss_pressure=%s" % [
		VAURuntime.get_path(current_state, "player.health", "?"),
		VAURuntime.get_path(current_state, "player.supplies", "?"),
		VAURuntime.get_path(current_state, "player.keys", "?"),
		VAURuntime.get_path(current_state, "world.threat", "?"),
		VAURuntime.get_path(current_state, "world.boss_pressure", "?"),
	])
	lines.append("")

	for index in range(futures.size()):
		var future: Dictionary = futures[index]
		var names: Array[String] = []
		for event in future.get("timeline", []):
			names.append(String(event.get("name", "event")))
		lines.append("%d. p=%.4f confidence=%.2f" % [
			index + 1,
			float(future.get("probability", 0.0)),
			float(future.get("confidence", 0.0)),
		])
		lines.append("   %s" % " -> ".join(names))
		var next_event: Variant = VAURuntime.next_predicted_event(future)
		if next_event != null:
			lines.append("   next: %s" % next_event.get("name", "event"))
		lines.append("")

	output.text = "\n".join(lines)
