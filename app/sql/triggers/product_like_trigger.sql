CREATE OR REPLACE FUNCTION public.handle_product_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.products SET stats = jsonb_set(stats, '{likes}', ((stats->>'likes')::int + 1)::text::jsonb) WHERE product_id = NEW.product_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER product_like_trigger
AFTER INSERT ON public.product_likes
FOR EACH ROW EXECUTE FUNCTION public.handle_product_like();


CREATE OR REPLACE  FUNCTION public.handle_product_unlike()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.products SET stats = jsonb_set(stats, '{likes}', ((stats->>'likes')::int - 1)::text::jsonb) WHERE product_id = OLD.product_id;
    RETURN OLD;
END;
$$;

CREATE TRIGGER product_unlike_trigger
AFTER DELETE ON public.product_likes
FOR EACH ROW EXECUTE FUNCTION public.handle_product_unlike();