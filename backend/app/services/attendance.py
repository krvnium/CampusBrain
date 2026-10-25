from math import ceil


def calculate_summary(attended: int, missed: int, cancelled: int, target: float) -> dict:
    held = attended + missed
    percentage = round(attended / held * 100, 2) if held else None
    if target <= 0:
        classes_to_target = 0
        can_miss = None
    elif target >= 100:
        classes_to_target = max(0, missed)
        can_miss = 0 if held else None
    else:
        classes_to_target = max(0, ceil((target * held / 100 - attended) / (1 - target / 100)))
        can_miss = max(0, int((attended * 100 / target) - held)) if held else None
    return {
        "held": held,
        "attended": attended,
        "missed": missed,
        "cancelled": cancelled,
        "percentage": percentage,
        "target": target,
        "classes_to_target": classes_to_target,
        "can_miss": can_miss,
    }
