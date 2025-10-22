"use client";

import { useState, useCallback } from 'react';
import { useForm, useController } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useModal } from '@/commons/providers/modal/modal.provider';
import { getPath } from '@/commons/constants/url';

// 회원가입 폼 데이터 타입 정의
export interface SignupFormData {
  email: string;
  name: string;
  password: string;
  passwordConfirm: string;
}

// Zod 스키마 정의
const signupFormSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요.')
    .refine((val) => val.includes('@'), {
      message: '유효한 이메일 형식이 아닙니다. (@를 포함해야 합니다.)',
    }),
  name: z
    .string()
    .min(1, '이름을 입력해주세요.')
    .max(100, '이름은 100자를 초과할 수 없습니다.'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .refine((val) => /[a-zA-Z]/.test(val) && /[0-9]/.test(val), {
      message: '비밀번호는 영문과 숫자를 포함해야 합니다.',
    }),
  passwordConfirm: z
    .string()
    .min(1, '비밀번호 확인을 입력해주세요.'),
}).refine((data) => data.password === data.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['passwordConfirm'],
});

// GraphQL API 호출 함수
async function createUserApi(email: string, password: string, name: string) {
  const query = `
    mutation CreateUser($createUserInput: CreateUserInput!) {
      createUser(createUserInput: $createUserInput) {
        _id
      }
    }
  `;

  const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'https://main-practice.codebootcamp.co.kr/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: {
        createUserInput: {
          email,
          password,
          name,
        },
      },
    }),
  });

  const data = await response.json();

  if (data.errors) {
    throw new Error(data.errors[0]?.message || '회원가입 중 오류가 발생했습니다.');
  }

  return data.data?.createUser;
}

// 회원가입 폼 훅
export function useSignupForm() {
  const router = useRouter();
  const { closeAllModals } = useModal();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [failureMessage, setFailureMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // React Hook Form 설정
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      passwordConfirm: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  // 폼 제출 핸들러
  const onSubmit = useCallback(async (data: SignupFormData) => {
    try {
      setIsSubmitting(true);

      // API 요청 시에는 원본 이메일을 사용 (테스트에서만 timestamp 추가)
      const result = await createUserApi(data.email, data.password, data.name);

      // 성공 응답 확인
      if (result?._id) {
        setShowSuccessModal(true);
      } else {
        throw new Error('회원가입 응답이 유효하지 않습니다.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.';
      setFailureMessage(errorMessage);
      setShowFailureModal(true);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // 성공 모달 확인 핸들러
  const handleSuccessConfirm = useCallback(() => {
    setShowSuccessModal(false);
    // 로그인 페이지로 이동
    router.push(getPath('AUTH_LOGIN'));
  }, [router]);

  // 실패 모달 확인 핸들러
  const handleFailureConfirm = useCallback(() => {
    setShowFailureModal(false);
    closeAllModals();
  }, [closeAllModals]);

  // useController를 사용하여 각 필드 제어
  const emailController = useController({
    name: 'email',
    control: form.control,
    defaultValue: '',
  });

  const nameController = useController({
    name: 'name',
    control: form.control,
    defaultValue: '',
  });

  const passwordController = useController({
    name: 'password',
    control: form.control,
    defaultValue: '',
  });

  const passwordConfirmController = useController({
    name: 'passwordConfirm',
    control: form.control,
    defaultValue: '',
  });

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    showSuccessModal,
    showFailureModal,
    failureMessage,
    handleSuccessConfirm,
    handleFailureConfirm,
    errors: form.formState.errors,
    emailController,
    nameController,
    passwordController,
    passwordConfirmController,
  };
}
