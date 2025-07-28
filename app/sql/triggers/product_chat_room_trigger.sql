CREATE OR REPLACE FUNCTION public.handle_product_chat()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.products SET stats = jsonb_set(stats, '{chats}', ((stats->>'chats')::int + 1)::text::jsonb) WHERE product_id = NEW.product_id;
    RETURN NEW;
END;
$$;

CREATE TRIGGER product_chat_room_trigger
AFTER INSERT ON public.chat_rooms
FOR EACH ROW EXECUTE FUNCTION public.handle_product_chat();