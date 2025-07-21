CREATE OR REPLACE FUNCTION track_event(
    event_type event_type,
    event_data jsonb
) returns void AS $$
BEGIN
    INSERT INTO events (event_type, event_data) VALUES (event_type, event_data);
END;
$$ language plpgsql;