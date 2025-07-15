import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Form, redirect } from "react-router";
import InputPair from "~/common/components/input-pair";
import SubHeader from "~/common/components/sub-header";
import { Button } from "~/common/components/ui/button";
import { cn } from "~/lib/utils";
import type { Route } from "./+types/submit-page";
import { makeSSRClient } from "~/supa-client";
import { getLoggedInUserId } from "~/features/users/queries";
import { z } from "zod";
import {
  createProduct,
  createProductHashTags,
  createProductImages,
} from "../mutations";
import { Badge } from "~/common/components/ui/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "~/common/components/ui/alert";

interface PreviewImage {
  url: string;
  file: File;
}

const formSchema = z.object({
  title: z.string(),
  price: z.coerce.number(),
  description: z.string(),
  location: z.string(),
  hashTags: z.string().transform((value) => {
    const parsed = JSON.parse(value);
    return parsed;
  }),
});

export const action = async ({ request }: Route.ActionArgs) => {
  const { client, headers } = makeSSRClient(request);
  const userId = await getLoggedInUserId(client);
  const formData = await request.formData();

  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData)
  );
  if (!success) {
    return { formErrors: error.flatten().fieldErrors };
  }
  const { title, price, description, location, hashTags } = data;
  const {
    data: { product_id },
  } = await createProduct(client, {
    title,
    price,
    description,
    location,
    userId,
  });

  const images = formData.getAll("images") as File[];
  const imagePublicUrls: string[] = [];
  if (images) {
    for (const file of images) {
      if (file instanceof File) {
        if (file.size <= 2097152 && file.type.startsWith("image/")) {
          const { data, error } = await client.storage
            .from("products")
            .upload(`${userId}/${product_id}/${Date.now()}`, file, {
              contentType: file.type,
              upsert: true,
            });

          if (error) {
            console.warn("업로드 실패 : ", file.name);
            continue;
          }

          const {
            data: { publicUrl },
          } = await client.storage.from("products").getPublicUrl(data.path);

          imagePublicUrls.push(publicUrl);
        }
      }
    }
  }

  await createProductImages(client, {
    images: imagePublicUrls,
    productId: product_id,
  });

  if (hashTags) {
    await createProductHashTags(client, { hashTags, productId: product_id });
  }

  return redirect(`/`, { headers });
};

export default function SubmitPage({ actionData }: Route.ComponentProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<PreviewImage[]>([]);
  const [hashTag, setHashTag] = useState<string>("");
  const [hashTags, setHashTags] = useState<string[]>([]);
  const isComposing = useRef(false); // 조합 중 여부

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChangeImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newImages: PreviewImage[] = Array.from(files).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleDeleteImage = (url: string) => () => {
    setImages((prev) => prev.filter((img) => img.url !== url));
  };

  const handleKeyDownTag = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !isComposing.current) {
      event.preventDefault();
      if (hashTag.trim() !== "") {
        if (!hashTags.includes(hashTag.trim())) {
          setHashTags((prev) => [...prev, hashTag.trim()]);
        }
        setHashTag("");
      }
    }
  };

  const onClickDeleteHashTag = (tag: string) => {
    console.log("### onClickDeleteHashTag => ", tag);
    setHashTags((prev) => prev.filter((str) => str !== tag));
  };

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, [images]);

  return (
    <div>
      <SubHeader title="등록하기" />
      <Form method="post" encType="multipart/form-data">
        {/* 이미지 업로드 영역 start */}
        <div className="flex py-2 pl-4 items-center gap-2.5 shrink-0">
          <div
            className="flex size-18 m-2 p-2 flex-col justify-center items-center gap-1 shrink-0 rounded-xl border-solid border-1"
            onClick={handleClick}
          >
            <ImagePlus className="size-8 shrink-0 aspect-square" />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              name="images"
              onChange={handleChangeImage}
            />

            <div className="flex py-1 px-2 justify-center items-center gap-2.5 bg-muted-foreground/20 rounded-full">
              <span className="text-[10px] font-medium leading-2.75 -tracking-[0.4px] text-muted-foreground/50">
                <span className={cn({ "text-black": images.length > 0 })}>
                  {images.length}
                </span>{" "}
                / 10
              </span>
            </div>
          </div>
          {images.length > 0 ? (
            <div className="flex grow py-2 shrink-0 basis-0 items-start gap-2.5 overflow-x-scroll">
              <div className="flex items-center space-x-4">
                {images.map((image) => (
                  <div
                    key={image.url}
                    className="relative size-18 shrink-0 rounded-xl"
                  >
                    <img
                      src={image.url}
                      className="size-full object-cover rounded-xl border-1"
                    />
                    <Button
                      variant="ghost"
                      className="absolute -top-4 -right-4"
                      onClick={handleDeleteImage(image.url)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <rect width="16" height="16" rx="8" fill="black" />
                        <path
                          d="M8.70449 7.99957L11.8522 4.85685C11.9463 4.76277 11.9991 4.63516 11.9991 4.50211C11.9991 4.36906 11.9463 4.24145 11.8522 4.14737C11.7581 4.05328 11.6305 4.00043 11.4975 4.00043C11.3644 4.00043 11.2368 4.05328 11.1427 4.14737L8 7.29509L4.85728 4.14737C4.76319 4.05328 4.63559 4.00043 4.50253 4.00043C4.36948 4.00043 4.24188 4.05328 4.14779 4.14737C4.05371 4.24145 4.00085 4.36906 4.00085 4.50211C4.00085 4.63516 4.05371 4.76277 4.14779 4.85685L7.29551 7.99957L4.14779 11.1423C4.10096 11.1887 4.06379 11.244 4.03843 11.3049C4.01306 11.3658 4 11.4311 4 11.497C4 11.563 4.01306 11.6283 4.03843 11.6892C4.06379 11.7501 4.10096 11.8053 4.14779 11.8518C4.19424 11.8986 4.2495 11.9358 4.31039 11.9611C4.37127 11.9865 4.43658 11.9996 4.50253 11.9996C4.56849 11.9996 4.6338 11.9865 4.69468 11.9611C4.75557 11.9358 4.81083 11.8986 4.85728 11.8518L8 8.70406L11.1427 11.8518C11.1892 11.8986 11.2444 11.9358 11.3053 11.9611C11.3662 11.9865 11.4315 11.9996 11.4975 11.9996C11.5634 11.9996 11.6287 11.9865 11.6896 11.9611C11.7505 11.9358 11.8058 11.8986 11.8522 11.8518C11.899 11.8053 11.9362 11.7501 11.9616 11.6892C11.9869 11.6283 12 11.563 12 11.497C12 11.4311 11.9869 11.3658 11.9616 11.3049C11.9362 11.244 11.899 11.1887 11.8522 11.1423L8.70449 7.99957Z"
                          fill="white"
                        />
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        {/* 이미지 업로드 영역 end */}

        <div className="flex w-full pb-4 flex-col items-start gap-4">
          <InputPair
            label="제목"
            id="title"
            name="title"
            placeholder="제목을 입력해주세요."
          />
          {actionData && "formErrors" in actionData ? (
            <Alert>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {actionData?.formErrors.title}
              </AlertDescription>
            </Alert>
          ) : null}

          <InputPair
            label="금액"
            type="number"
            id="price"
            name="price"
            placeholder="가격을 입력해주세요."
          />
          {actionData && "formErrors" in actionData ? (
            <Alert>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {actionData?.formErrors.price}
              </AlertDescription>
            </Alert>
          ) : null}
          <InputPair
            label="설명"
            id="description"
            name="description"
            textArea
            placeholder={`판매하는 제품의 설명을 작성해주세요.\n(판매를 금지하는 물품은 게시 후 삭제 될 수 있습니다.)\n\n우리 아이만을 위한 거래를 시작하세요.`}
          />
          {actionData && "formErrors" in actionData ? (
            <Alert>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {actionData?.formErrors.description}
              </AlertDescription>
            </Alert>
          ) : null}
          <InputPair
            label="거래장소"
            id="location"
            name="location"
            placeholder="희망 거래 장소를 입력해주세요."
          />
          {actionData && "formErrors" in actionData ? (
            <Alert>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {actionData?.formErrors.location}
              </AlertDescription>
            </Alert>
          ) : null}
          <InputPair
            label="해시태그"
            value={hashTag}
            placeholder="#해시태그를 입력해주세요."
            onCompositionStart={() => {
              isComposing.current = true;
            }}
            onCompositionEnd={() => {
              isComposing.current = false;
            }}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const {
                target: { value },
              } = event;
              setHashTag(value);
            }}
            onKeyDown={handleKeyDownTag}
          />
          {hashTags ? (
            <div className="flex w-full px-4 gap-1 overflow-x-auto">
              {hashTags.map((hashTag: string, index: number) => (
                <Badge variant="secondary" key={`hashTag_${index + 1}`}>
                  {hashTag}
                  <X onClick={() => onClickDeleteHashTag(hashTag)} />
                </Badge>
              ))}
              <input
                className="hidden"
                name="hashTags"
                value={JSON.stringify(hashTags)}
              />
            </div>
          ) : null}
          {actionData && "formErrors" in actionData ? (
            <Alert>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {actionData?.formErrors.hashTags}
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
        {/* Floating Area */}
        <div className="flex w-full flex-col items-start">
          <div className="flex w-full h-18 py-2 px-4 justify-center items-center gap-4 border-1 border-muted">
            <Button
              className={cn(
                "flex px-4 h-14 justify-center items-center gap-2.5 grow shrink-0 basis-0 self-stretch rounded-full",
                "font-pretendard text-sm not-italic font-semibold leading-3.5 tracking-[-0.4px]"
              )}
              type="submit"
            >
              게시글 올리기
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
