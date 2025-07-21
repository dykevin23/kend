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
    stats->>'likes' AS likes
FROM public.products p