import {
  bigint,
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { products } from "../products/schema";
import { profiles } from "../users/schema";

/**
 * 채팅방(chatRooms) 테이블
 * chat_room_id       채팅방ID(key)
 * product_id         상품ID
 * created_at         등록일시
 */
export const chatRooms = pgTable("chat_rooms", {
  chat_room_id: bigint({ mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  product_id: bigint({ mode: "number" }).references(() => products.product_id, {
    onDelete: "cascade",
  }),
  created_at: timestamp().notNull().defaultNow(),
});

/**
 * 채팅방 멤버(chatRoomMembers) 테이블
 * chat_room_id       채팅방ID(key)
 * profile_id         사용자ID
 * created_at         등록일시
 */
export const chatRoomMembers = pgTable("chat_room_members", {
  chat_room_id: bigint({ mode: "number" }).references(
    () => chatRooms.chat_room_id,
    { onDelete: "cascade" }
  ),
  profile_id: uuid().references(() => profiles.profile_id, {
    onDelete: "cascade",
  }),
  created_at: timestamp().notNull().defaultNow(),
});

/**
 * 메세지(messages) 테이블
 * message_id         메세지ID(key)
 * chat_room_id       채팅방ID
 * sender_id          보낸사용자ID
 * content            메세지
 * seen               읽음여부
 * created_at         등록일시
 */
export const messages = pgTable("messages", {
  message_id: bigint({ mode: "number" })
    .primaryKey()
    .generatedAlwaysAsIdentity(),
  chat_room_id: bigint({ mode: "number" }).references(
    () => chatRooms.chat_room_id,
    { onDelete: "cascade" }
  ),
  sender_id: uuid().references(() => profiles.profile_id, {
    onDelete: "cascade",
  }),
  content: text().notNull(),
  seen: boolean().notNull().default(false),
  created_at: timestamp().notNull().defaultNow(),
});
