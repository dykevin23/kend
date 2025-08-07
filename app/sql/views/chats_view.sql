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
  cr.product_id,
  product.name as product_name,
  product.status as product_status,
  product.profile_id as owner_profile_id,
  (
    SELECT pi.image
    FROM product_images pi
    WHERE pi.product_id = product.product_id
    ORDER BY pi.image_id ASC
    LIMIT 1
  ) as product_image
FROM chat_room_members crm1
INNER JOIN chat_room_members crm2
ON crm1.chat_room_id = crm2.chat_room_id
INNER JOIN profiles
ON profiles.profile_id = crm2.profile_id
INNER JOIN chat_rooms cr
ON cr.chat_room_id = crm1.chat_room_id
INNER JOIN products product
ON product.product_id = cr.product_id
WHERE crm1.profile_id != crm2.profile_id