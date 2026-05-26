@tool
extends RefCounted


const SYSTEM_NAME := "VAUtool"


static func default_state() -> Dictionary:
	return {
		"scene": "test_dungeon",
		"player": {
			"health": 60,
			"supplies": 1,
			"keys": 0,
		},
		"world": {
			"threat": 2,
			"boss_pressure": 1,
			"clues_found": 0,
		},
		"flags": {
			"shortcut_open": false,
			"boss_awake": false,
		},
		"notes": [],
	}


static func create_initial_future(current_state: Dictionary) -> Array:
	return [{
		"state": current_state.duplicate(true),
		"timeline": [],
		"probability": 1.0,
		"confidence": 1.0,
		"observed_events": 0,
	}]


static func get_path(data: Dictionary, path: String, fallback: Variant = null) -> Variant:
	var current: Variant = data
	for part in path.split("."):
		if typeof(current) != TYPE_DICTIONARY:
			return fallback
		if not current.has(part):
			return fallback
		current = current[part]
	return current


static func set_path(data: Dictionary, path: String, value: Variant) -> void:
	var current: Variant = data
	var parts := path.split(".")
	for index in range(parts.size() - 1):
		var part := parts[index]
		if typeof(current) != TYPE_DICTIONARY:
			return
		if not current.has(part) or typeof(current[part]) != TYPE_DICTIONARY:
			current[part] = {}
		current = current[part]
	current[parts[parts.size() - 1]] = value


static func apply_state_delta(state: Dictionary, delta: Dictionary) -> Dictionary:
	var updated := state.duplicate(true)
	for path in delta.keys():
		var value: Variant = delta[path]
		if typeof(value) == TYPE_DICTIONARY and value.has("op"):
			var operation := String(value.get("op", "set"))
			var amount: Variant = value.get("value", 1)
			var current: Variant = get_path(updated, path, value.get("default", 0))
			if operation == "increment":
				set_path(updated, path, current + amount)
			elif operation == "decrement":
				set_path(updated, path, current - amount)
			elif operation == "max":
				set_path(updated, path, max(current, amount))
			elif operation == "min":
				set_path(updated, path, min(current, amount))
			elif operation == "append_unique":
				var items: Array = []
				if typeof(current) == TYPE_ARRAY:
					items = current.duplicate(true)
				if not items.has(amount):
					items.append(amount)
				set_path(updated, path, items)
			else:
				set_path(updated, path, amount)
		else:
			set_path(updated, path, value)
	return updated


static func generate_possible_next_events(future: Dictionary) -> Array:
	var state: Dictionary = future.get("state", default_state())
	var health := int(get_path(state, "player.health", 60))
	var supplies := int(get_path(state, "player.supplies", 1))
	var keys := int(get_path(state, "player.keys", 0))
	var threat := int(get_path(state, "world.threat", 2))
	var boss_pressure := int(get_path(state, "world.boss_pressure", 1))
	var shortcut_open := bool(get_path(state, "flags.shortcut_open", false))
	var boss_awake := bool(get_path(state, "flags.boss_awake", false))

	var events: Array = []

	if health < 45 or supplies < 1:
		events.append({
			"name": "health_pickup_spawns",
			"kind": "aid",
			"probability_hint": 0.34,
			"tags": ["survival", "low_health"],
			"state_delta": {
				"player.health": {"op": "increment", "value": 25},
				"player.supplies": {"op": "increment", "value": 1},
				"notes": {"op": "append_unique", "value": "VAU softened a danger spike."},
			},
			"reason": "Low health or low supplies makes a recovery branch likely.",
		})

	if keys < 1:
		events.append({
			"name": "key_found",
			"kind": "progress",
			"probability_hint": 0.26,
			"tags": ["progress", "exploration"],
			"state_delta": {
				"player.keys": {"op": "increment", "value": 1},
				"world.clues_found": {"op": "increment", "value": 1},
			},
			"reason": "The player still needs a clean progression branch.",
		})

	if not shortcut_open:
		events.append({
			"name": "shortcut_discovered",
			"kind": "progress",
			"probability_hint": 0.2,
			"tags": ["exploration", "flow"],
			"state_delta": {
				"flags.shortcut_open": true,
				"world.threat": {"op": "decrement", "value": 1},
			},
			"reason": "A shortcut gives the player a safer route after exploration.",
		})

	events.append({
		"name": "enemy_patrol_tightens",
		"kind": "risk",
		"probability_hint": 0.18 + min(threat, 5) * 0.03,
		"tags": ["threat", "enemy"],
		"state_delta": {
			"world.threat": {"op": "increment", "value": 1},
			"player.health": {"op": "decrement", "value": 10},
		},
		"reason": "Threat can rise if the player remains in hostile territory.",
	})

	if boss_pressure >= 3 and not boss_awake:
		events.append({
			"name": "boss_awakes",
			"kind": "risk",
			"probability_hint": 0.25,
			"tags": ["boss", "threat"],
			"state_delta": {
				"flags.boss_awake": true,
				"world.threat": {"op": "increment", "value": 2},
			},
			"reason": "High pressure can wake the boss.",
		})
	else:
		events.append({
			"name": "boss_pressure_rises",
			"kind": "tension",
			"probability_hint": 0.2,
			"tags": ["boss", "pacing"],
			"state_delta": {
				"world.boss_pressure": {"op": "increment", "value": 1},
			},
			"reason": "The director can increase pressure without forcing a boss fight yet.",
		})

	events.append({
		"name": "quiet_room",
		"kind": "breather",
		"probability_hint": 0.12,
		"tags": ["pacing", "rest"],
		"state_delta": {
			"player.health": {"op": "increment", "value": 5},
		},
		"reason": "A short rest branch keeps pacing readable.",
	})

	return events


static func score_event_likelihood(event: Dictionary, future: Dictionary) -> float:
	var state: Dictionary = future.get("state", default_state())
	var score := float(event.get("probability_hint", 0.5))
	var health := int(get_path(state, "player.health", 60))
	var threat := int(get_path(state, "world.threat", 2))
	var tags: Array = event.get("tags", [])

	if tags.has("low_health") and health < 35:
		score *= 1.35
	if tags.has("threat") and threat >= 4:
		score *= 1.25
	if tags.has("progress") and int(get_path(state, "player.keys", 0)) < 1:
		score *= 1.2
	if tags.has("pacing") and threat >= 4:
		score *= 0.8

	return clamp(score, 0.01, 0.99)


static func simulate_futures(futures: Array, depth: int, max_branches_to_keep: int) -> Array:
	var active := futures.duplicate(true)
	for _step in range(max(depth, 0)):
		var new_futures: Array = []
		for future in active:
			for event in generate_possible_next_events(future):
				var new_future: Dictionary = future.duplicate(true)
				var timeline: Array = new_future.get("timeline", []).duplicate(true)
				timeline.append(event.duplicate(true))
				new_future["timeline"] = timeline
				new_future["state"] = apply_state_delta(
					new_future.get("state", {}).duplicate(true),
					event.get("state_delta", {})
				)
				new_future["probability"] = (
					float(future.get("probability", 1.0))
					* score_event_likelihood(event, future)
				)
				new_futures.append(new_future)
		new_futures.sort_custom(func(left: Dictionary, right: Dictionary) -> bool:
			return float(left.get("probability", 0.0)) > float(right.get("probability", 0.0))
		)
		while new_futures.size() > max(1, max_branches_to_keep):
			new_futures.pop_back()
		active = new_futures
	return active


static func tokenize(text: String) -> Array:
	var normalized := ""
	for index in range(text.length()):
		var character := text.substr(index, 1)
		if character.is_valid_identifier() or character.is_valid_int():
			normalized += character.to_lower()
		else:
			normalized += " "
	return normalized.split(" ", false)


static func _set_similarity(left: Array, right: Array) -> float:
	if left.is_empty() and right.is_empty():
		return 1.0
	if left.is_empty() or right.is_empty():
		return 0.0
	var union: Array = []
	var intersection: Array = []
	for value in left:
		if not union.has(value):
			union.append(value)
		if right.has(value) and not intersection.has(value):
			intersection.append(value)
	for value in right:
		if not union.has(value):
			union.append(value)
	return float(intersection.size()) / float(union.size())


static func next_predicted_event(future: Dictionary) -> Variant:
	var observed := int(future.get("observed_events", 0))
	var timeline: Array = future.get("timeline", [])
	if observed < timeline.size():
		return timeline[observed]
	return null


static func compare_events(real_event: Dictionary, predicted_event: Variant) -> float:
	if predicted_event == null:
		return 0.0
	if String(real_event.get("name", "")) == String(predicted_event.get("name", "")):
		return 1.0

	var name_similarity := _set_similarity(
		tokenize(String(real_event.get("name", ""))),
		tokenize(String(predicted_event.get("name", "")))
	)
	var tag_similarity := _set_similarity(
		real_event.get("tags", []),
		predicted_event.get("tags", [])
	)
	var kind_similarity := 0.0
	if String(real_event.get("kind", "")) == String(predicted_event.get("kind", "")):
		kind_similarity = 1.0

	return clamp(name_similarity * 0.45 + tag_similarity * 0.3 + kind_similarity * 0.25, 0.0, 1.0)


static func update_futures_with_real_event(predicted_futures: Array, real_event: Dictionary, current_state: Dictionary) -> Array:
	var surviving: Array = []
	for future in predicted_futures:
		var similarity := compare_events(real_event, next_predicted_event(future))
		if similarity >= 0.7:
			var corrected: Dictionary = future.duplicate(true)
			corrected["confidence"] = min(1.0, float(corrected.get("confidence", 1.0)) + 0.15)
			corrected["probability"] = float(corrected.get("probability", 1.0)) * (1.0 + similarity * 0.1)
			corrected["observed_events"] = int(corrected.get("observed_events", 0)) + 1
			surviving.append(corrected)
		elif similarity >= 0.35:
			var corrected: Dictionary = future.duplicate(true)
			corrected["confidence"] = float(corrected.get("confidence", 1.0)) * 0.7
			corrected["probability"] = float(corrected.get("probability", 1.0)) * (0.55 + similarity * 0.25)
			corrected["observed_events"] = int(corrected.get("observed_events", 0)) + 1
			surviving.append(corrected)

	if surviving.is_empty():
		return [{
			"state": apply_state_delta(current_state, real_event.get("state_delta", {})),
			"timeline": [real_event.duplicate(true)],
			"probability": 1.0,
			"confidence": 0.35,
			"observed_events": 1,
		}]

	surviving.sort_custom(func(left: Dictionary, right: Dictionary) -> bool:
		if float(left.get("confidence", 0.0)) == float(right.get("confidence", 0.0)):
			return float(left.get("probability", 0.0)) > float(right.get("probability", 0.0))
		return float(left.get("confidence", 0.0)) > float(right.get("confidence", 0.0))
	)
	return surviving
