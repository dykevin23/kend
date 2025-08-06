import InputPair from "~/common/components/input-pair";
import SubHeader from "~/common/components/sub-header";
import { Button } from "~/common/components/ui/button";
import type { Route } from "./+types/modify-profile-page";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId, getProfileByUserId } from "../queries";
import UserAvatar from "~/common/components/user-avatar";
import { Form, useNavigate } from "react-router";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { updateProfile } from "../mutations";
import { toast } from "sonner";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const profile = await getProfileByUserId(client, { userId });
  return { profile };
};

const formSchema = z.object({
  nickname: z.string(),
  introduction: z.string().optional(),
  comment: z.string().optional(),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const { client } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const formData = await request.formData();

  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!success) {
    return {
      formErrors: error.flatten().fieldErrors,
    };
  }

  const avatar = formData.get("avatar");
  const avatarStatus = formData.get("avatarStatus");

  if (avatarStatus === "update") {
    if (avatar && avatar instanceof File) {
      if (avatar.size <= 2097152 && avatar.type.startsWith("image/")) {
        const { data: files, error: listError } = await client.storage
          .from("profiles")
          .list(userId);

        if (listError) {
          console.error("목록 조회 오류:", listError.message);
        }

        if (files && files.length > 0) {
          const pathsToDelete = files.map((f) => `${userId}/${f.name}`);
          const { error: deleteError } = await client.storage
            .from("profiles")
            .remove(pathsToDelete);

          if (deleteError) {
            console.error("삭제 실패:", deleteError.message);
          }
        }

        const { data: uploadData, error: uploadError } = await client.storage
          .from("profiles")
          .upload(`${userId}/${Date.now()}`, avatar, {
            contentType: avatar.type,
            upsert: true,
          });

        if (uploadError) {
          console.log("### uploadError => ", uploadError);
          return { formErrors: { avatar: ["Invalid file size or type"] } };
        }

        const {
          data: { publicUrl },
        } = await client.storage.from("profiles").getPublicUrl(uploadData.path);

        await updateProfile(client, {
          userId,
          nickname: data.nickname,
          introduction: data.introduction ?? "",
          comment: data.comment ?? "",
          avatar: publicUrl,
        });
      } else {
        return { formErrors: { avatar: ["Invalid file size or type"] } };
      }
    }
  } else {
    await updateProfile(client, {
      userId,
      nickname: data.nickname,
      introduction: data.introduction ?? "",
      comment: data.comment ?? "",
    });
  }

  return { ok: true };
};

export default function ModifyProfilePage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState<string>(loaderData.profile.avatar);
  const [avatarStatus, setAvatarStatus] = useState<"none" | "keep" | "update">(
    "none"
  );

  useEffect(() => {
    if (loaderData.profile.avatar) {
      setAvatarStatus("keep");
    }
  }, [loaderData.profile.avatar]);

  useEffect(() => {
    if (actionData?.ok) {
      toast("수정되었습니다.");
      navigate(-1);
    }
  }, [actionData?.ok]);

  // useEffect(() => {
  //   if (actionData?.formErrors) {
  //   }
  // }, [actionData?.formErrors]);

  return (
    <Form method="post" encType="multipart/form-data">
      <SubHeader title="프로필 수정" />

      <div className="flex justify-center items-center py-6">
        <div className="size-26">
          <UserAvatar
            name={loaderData.profile.username}
            avatar={avatar}
            className="size-26"
            mode="modify"
            onClick={() => fileInputRef.current?.click()}
          />

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            id="avatar"
            name="avatar"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              if (event.target.files) {
                const file = event.target.files[0];
                setAvatar(URL.createObjectURL(file));
                setAvatarStatus("update");
              }
            }}
          />
          <input
            className="hidden"
            id="avatarStatus"
            name="avatarStatus"
            value={avatarStatus}
            readOnly
          />
        </div>
      </div>

      <div className="flex w-full flex-col items-start gap-4 pb-6">
        <InputPair
          label="닉네임"
          id="nickname"
          name="nickname"
          defaultValue={loaderData.profile.nickname ?? ""}
        />

        <InputPair
          label="한줄소개"
          id="introduction"
          name="introduction"
          defaultValue={loaderData.profile.introduction}
        />

        <InputPair
          label="기타 메세지"
          id="comment"
          name="comment"
          textArea
          defaultValue={loaderData.profile.comment}
        />
      </div>

      <div className="flex w-full flex-col items-start">
        <div className="flex h-18 py-2 px-4 justify-center items-center gap-4 self-stretch border-t-1">
          <Button
            type="submit"
            className="flex h-full px-4 justify-center items-center gap-2.5 grow shrink-0 basis-0 self-stretch rounded-full font-semibold"
          >
            저장하기
          </Button>
        </div>
      </div>
    </Form>
  );
}
