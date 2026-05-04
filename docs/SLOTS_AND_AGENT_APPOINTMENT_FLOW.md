# Slots and Agent Appointment Flow

## Purpose of Slots

A slot is a doctor-owned time window in the `time_slot` table that represents a real, bookable availability block.

Canonical table name: `time_slot` table.

Each slot includes:
- `slot_id` (stable unique identifier)
- `doctor_id`
- `start_time`
- `end_time`
- `is_available`
- lifecycle metadata (`created_at`, `updated_at`, `deleted_at`)

Slots are the source of truth for availability. The system should not treat free-text time alone as the final booking key.

## Why Slots Matter for Reliability

Using `slot_id` prevents booking errors caused by:
- timezone conversion differences
- seconds or microseconds precision mismatches
- ambiguous time formatting from clients

A slot gives the backend a precise target to lock and book atomically.

## How Slots Connect to the Agent

The doctor-matching agent uses slots in two stages:

1. Recommendation stage
- The agent profiles the patient and interprets the need.
- It ranks doctors by specialty, availability, proximity, and price.
- It reads available slots and suggests doctors that have real upcoming availability.

2. Booking stage
- Preferred path: the client sends `slot_id` selected from suggestions.
- The booking tool locks that slot row (`FOR UPDATE`), verifies ownership and availability, creates the appointment, and marks slot unavailable in one transaction.
- This ensures two users cannot successfully book the same slot.

## Fallback and Compatibility

If an older client does not send `slot_id`, the system can still use date/time fallback with UTC normalization and bounded matching.

This fallback keeps compatibility, but `slot_id` is the target design because it is safer and more deterministic.

## User Benefit

For users, slots make the agent's help practical:
- suggested doctors are tied to real openings
- booking succeeds more consistently
- fewer "slot not found" or duplicate-booking issues

In short: slots are the bridge between AI suggestions and dependable appointment booking.
