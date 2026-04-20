import os

# Prevent import-time Gemini client validation errors from sibling tool modules.
os.environ.setdefault("GOOGLE_API_KEY", "test-key")

from backend.tools import doctor_matching_tools as dmt


def test_advisory_lock_keys_are_deterministic():
    key_hex = "a" * 64
    k1_a, k2_a = dmt._advisory_lock_keys(key_hex)
    k1_b, k2_b = dmt._advisory_lock_keys(key_hex)

    assert (k1_a, k2_a) == (k1_b, k2_b)


def test_advisory_lock_keys_change_for_different_hashes():
    k1_a, k2_a = dmt._advisory_lock_keys("1" * 64)
    k1_b, k2_b = dmt._advisory_lock_keys("2" * 64)

    assert (k1_a, k2_a) != (k1_b, k2_b)


def test_advisory_lock_keys_fit_int32_range():
    for key_hex in ["f" * 64, "0" * 64, "89abcdef" * 8]:
        k1, k2 = dmt._advisory_lock_keys(key_hex)
        assert -(2**31) <= k1 <= (2**31 - 1)
        assert -(2**31) <= k2 <= (2**31 - 1)


def test_advisory_lock_keys_reject_short_hash():
    try:
        dmt._advisory_lock_keys("1234")
        assert False, "Expected ValueError for short key hex"
    except ValueError as exc:
        assert "too short" in str(exc)
