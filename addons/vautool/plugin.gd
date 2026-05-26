@tool
extends EditorPlugin


var dock: Control


func _enter_tree() -> void:
	var dock_script := preload("res://addons/vautool/vau_dock.gd")
	dock = dock_script.new()
	dock.name = "VAUtool"
	add_control_to_dock(DOCK_SLOT_RIGHT_UL, dock)


func _exit_tree() -> void:
	if dock != null:
		remove_control_from_docks(dock)
		dock.queue_free()
		dock = null
