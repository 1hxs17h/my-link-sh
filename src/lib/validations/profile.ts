import { z } from "zod";

export const USERNAME_REGEX = /^[a-zA-Z0-9._-]+$/;

export const profileFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, "사용자 이름은 최소 2자 이상 입력해주세요.")
    .max(20, "사용자 이름은 최대 20자까지 입력할 수 있어요.")
    .regex(
      USERNAME_REGEX,
      "사용자 이름은 영문, 숫자, 밑줄(_), 하이픈(-), 마침표(.)만 사용할 수 있어요."
    ),
  bio: z
    .string()
    .max(200, "소개글은 최대 200자까지 입력할 수 있어요.")
    .optional()
    .or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
