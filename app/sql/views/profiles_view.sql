create or replace view profiles_view as
select
  profile_id,
  nickname,
  username,
  avatar,
  introduction,
  comment,
  stats->>'followers' AS followers,
  stats->>'following' AS following,
  (SELECT COUNT(*) FROM public.products WHERE profile_id = profiles.profile_id) as sales_product_count,
  (SELECT EXISTS (SELECT 1 FROM public.follows WHERE following_id = profiles.profile_id AND follower_id = auth.uid())) as is_following
from profiles;