CREATE OR REPLACE VIEW chats_view AS
SELECT 
  crm1.chat_room_id,
  profiles.nickname,
  profiles.avatar,
  crm1.profile_id as profile_id,
  crm2.profile_id as other_profile_id,
  (
    SELECT content
    FROM messages
    WHERE chat_room_id = crm1.chat_room_id
    ORDER BY message_id DESC
    LIMIT 1
  ) as last_message,
  (
    SELECT COUNT(*)
    FROM messages
    WHERE chat_room_id = crm1.chat_room_id
    AND sender_id = crm2.profile_id
    AND messages.seen = false
  ) as not_seen_count,
  (
    SELECT created_at
    FROM messages
    WHERE chat_room_id = crm1.chat_room_id
    ORDER BY message_id DESC
    LIMIT 1
  ) as created_at,
  crm1.is_out,
  (
    SELECT product_id
    FROM chat_rooms
    WHERE crm1.chat_room_id = chat_room_id
  ) as product_id
FROM chat_room_members crm1
INNER JOIN chat_room_members crm2
ON crm1.chat_room_id = crm2.chat_room_id
INNER JOIN profiles
ON profiles.profile_id = crm2.profile_id
WHERE crm1.profile_id != crm2.profile_id