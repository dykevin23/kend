CREATE OR REPLACE FUNCTION public.handle_user_follow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.profiles SET stats = jsonb_set(stats, '{followers}', ((stats->>'followers')::int + 1)::text::jsonb) 
    WHERE profile_id = NEW.following_id;
    UPDATE public.profiles SET stats = jsonb_set(stats, '{following}', ((stats->>'following')::int + 1)::text::jsonb) 
    WHERE profile_id = NEW.follower_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER user_follow_trigger
AFTER INSERT ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.handle_user_follow();


CREATE OR REPLACE  FUNCTION public.handle_user_unfollow()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.products SET stats = jsonb_set(stats, '{followers}', ((stats->>'followers')::int - 1)::text::jsonb) 
    WHERE product_id = OLD.following_id;
    UPDATE public.products SET stats = jsonb_set(stats, '{following}', ((stats->>'following')::int - 1)::text::jsonb) 
    WHERE product_id = OLD.follower_id;
    RETURN OLD;
END;
$$;

CREATE TRIGGER user_unfollow_trigger
AFTER DELETE ON public.follows
FOR EACH ROW EXECUTE FUNCTION public.handle_user_unfollow();