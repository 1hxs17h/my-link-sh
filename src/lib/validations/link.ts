import { z } from "zod";

export const linkFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "링크 제목을 1자 이상 입력해주세요.")
    .max(30, "링크 제목은 최대 30자까지 입력할 수 있어요."),
  url: z
    .string()
    .trim()
    .min(1, "연결할 웹 주소를 입력해주세요.")
    .refine(
      (val) => {
        if (/\s/.test(val)) return false; // 공백 불허
        let formatted = val;
        if (!/^https?:\/\//i.test(formatted) && !/^mailto:/i.test(formatted)) {
          formatted = `https://${formatted}`;
        }
        try {
          const parsed = new URL(formatted);
          // 최소한 호스트명에 온점(.)이 포함되어 정상적인 도메인 형태인지 검사
          return parsed.hostname.includes(".") && parsed.hostname.length > 3;
        } catch {
          return false;
        }
      },
      {
        message: "올바른 인터넷 주소(예: https://example.com)인지 확인해주세요.",
      }
    ),
  description: z
    .string()
    .trim()
    .max(80, "부가 설명은 최대 80자까지 입력할 수 있어요.")
    .optional()
    .or(z.literal("")),
});

export type LinkFormValues = z.infer<typeof linkFormSchema>;
