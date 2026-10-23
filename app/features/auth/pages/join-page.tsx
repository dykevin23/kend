import { z } from "zod";
import TextField from "~/common/components/text-field";
import { Button } from "~/common/components/ui/button";
import { Form, Link, redirect, useActionData } from "react-router";
import { makeSSRClient } from "~/supa-client";
import { actionErrorResponse } from "~/lib/error-handler";
import type { Route } from "./+types/join-page";
import AuthLayout, { AuthError } from "../components/auth-layout";

const signupSchema = z
  .object({
    email: z.string().min(1, "이메일을 입력해주세요.").email("올바른 이메일 형식을 입력해주세요."),
    password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 해요."),
    passwordConfirm: z.string().min(1, "비밀번호 확인을 입력해주세요."),
    nickname: z.string().min(1, "닉네임을 입력해주세요.").max(20, "닉네임은 20자 이하로 입력해주세요."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않아요.",
    path: ["passwordConfirm"],
  });

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();

  const result = signupSchema.safeParse({
    email: formData.get("email")?.toString().trim() ?? "",
    password: formData.get("password")?.toString() ?? "",
    passwordConfirm: formData.get("passwordConfirm")?.toString() ?? "",
    nickname: formData.get("nickname")?.toString().trim() ?? "",
  });

  if (!result.success) {
    const firstError = result.error.errors[0]?.message ?? "입력값을 확인해주세요.";
    return { error: firstError };
  }

  const { email, password, nickname } = result.data;
  const { client, headers } = makeSSRClient(request);

  const { error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname,
      },
    },
  });

  if (error) {
    return actionErrorResponse(error);
  }

  return redirect("/", {
    headers,
  });
}

export default function JoinPage() {
  const actionData = useActionData<typeof action>();

  return (
    <AuthLayout
      title="회원가입"
      subtitle={
        <>
          이미 회원이신가요?{" "}
          <Link to="/auth/login" className="font-bold text-primary">
            로그인
          </Link>
        </>
      }
    >
      <Form method="post" className="flex flex-col gap-4">
        {actionData?.error && <AuthError message={actionData.error} />}

        <TextField
          label="이메일 주소"
          name="email"
          type="email"
          id="email"
          containerClassName="p-0"
          required
        />
        <TextField
          label="비밀번호"
          name="password"
          type="password"
          id="password"
          containerClassName="p-0"
          required
        />
        <TextField
          label="비밀번호 확인"
          name="passwordConfirm"
          type="password"
          id="passwordConfirm"
          containerClassName="p-0"
          required
        />
        <TextField
          label="닉네임"
          name="nickname"
          type="text"
          id="nickname"
          containerClassName="p-0"
          required
        />

        <Button type="submit" size="lg" className="w-full mt-1">
          가입하기
        </Button>
      </Form>
    </AuthLayout>
  );
}
