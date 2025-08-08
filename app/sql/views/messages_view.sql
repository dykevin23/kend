CREATE OR REPLACE VIEW messages_view AS
SELECT
  m.message_id,
  m.chat_room_id,
  m.content,
  m.created_at,
  m.sender_id,
  p.nickname,
  p.avatar,
  (m.sender_id != auth.uid()) as reverse,
  to_char(m.created_at, 'YYYY-MM-DD') AS created_date,
  to_char(m.created_at, 'HH24:MI') AS created_time
FROM messages m
INNER JOIN profiles p
ON p.profile_id = m.sender_id