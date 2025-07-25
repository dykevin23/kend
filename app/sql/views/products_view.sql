CREATE OR REPLACE VIEW products_view AS
SELECT
    p.product_id,
    p.name,
    p.price,
    p.description,
    p.deal_location,
    p.status,
    p.profile_id,
    p.updated_at,
    (
        SELECT i.image
        FROM public.product_images i
        WHERE i.product_id = p.product_id
        LIMIT 1
    ) as product_image,
    stats->>'views' AS views,
    stats->>'chats' AS chats,
    stats->>'likes' AS likes,
    (SELECT EXISTS (SELECT 1 FROM public.product_likes WHERE product_likes.product_id = p.product_id AND product_likes.profile_id = auth.uid())) AS is_liked,
    profiles.username,
    profiles.nickname,
    profiles.avatar
FROM public.products p
INNER JOIN public.profiles ON (profiles.profile_id = p.profile_id)