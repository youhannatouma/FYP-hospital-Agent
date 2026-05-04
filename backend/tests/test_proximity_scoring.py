import os

# Prevent import-time Gemini client validation errors from sibling tool modules.
os.environ.setdefault("GOOGLE_API_KEY", "test-key")

from backend.tools import doctor_matching_tools as dmt


def test_proximity_uses_distance_when_coordinates_exist():
    patient = {
        "address": "Beirut, Lebanon",
        "patient_latitude": 33.8938,
        "patient_longitude": 35.5018,
    }
    doctor = {
        "clinic_address": "Jounieh, Lebanon",
        "clinic_latitude": 33.9808,
        "clinic_longitude": 35.6170,
    }

    score, mode, distance_km = dmt._proximity_score_with_fallback(patient, doctor)

    assert mode == "distance"
    assert distance_km is not None
    assert distance_km > 0
    assert 0 < score <= 1


def test_proximity_falls_back_to_token_overlap_when_geodata_missing():
    patient = {
        "address": "123 Main Street Beirut",
        "patient_latitude": None,
        "patient_longitude": None,
    }
    doctor = {
        "clinic_address": "Main Street Beirut",
        "clinic_latitude": None,
        "clinic_longitude": None,
    }

    score, mode, distance_km = dmt._proximity_score_with_fallback(patient, doctor)

    assert mode == "token_overlap"
    assert distance_km is None
    assert score > 0


def test_proximity_falls_back_when_coordinate_values_invalid():
    patient = {
        "address": "Beirut",
        "patient_latitude": 200,  # invalid
        "patient_longitude": 35.5,
    }
    doctor = {
        "clinic_address": "Beirut",
        "clinic_latitude": 33.9,
        "clinic_longitude": 35.5,
    }

    score, mode, distance_km = dmt._proximity_score_with_fallback(patient, doctor)

    assert mode == "token_overlap"
    assert distance_km is None
    assert 0 <= score <= 1
