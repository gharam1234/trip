"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useController } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client/react";
import { getPath } from "@/commons/constants/url";
import { BoardAddressInput, BoardFormData } from "@/commons/constants/enum";
import { CREATE_BOARD, CreateBoardInput } from "../graphql/mutations";

// Zod 스키마 정의
const boardFormSchema = z.object({
  writer: z
    .string()
    .min(1, '작성자를 입력해주세요.')
    .max(20, '작성자는 20자를 초과할 수 없습니다.'),
  password: z
    .string()
    .min(4, '비밀번호는 4자 이상이어야 합니다.')
    .max(20, '비밀번호는 20자를 초과할 수 없습니다.'),
  title: z
    .string()
    .min(1, '제목을 입력해주세요.')
    .max(100, '제목은 100자를 초과할 수 없습니다.'),
  contents: z
    .string()
    .min(1, '내용을 입력해주세요.'),
  youtubeUrl: z
    .string()
    .optional()
    .refine((val) => !val || val.includes('youtube.com') || val.includes('youtu.be'), {
      message: '유효한 유튜브 URL을 입력해주세요.'
    }),
  boardAddress: z.object({
    zipcode: z.string().optional(),
    address: z.string().optional(),
    addressDetail: z.string().optional()
  }),
  images: z.array(z.string()).optional()
});

// 게시판 폼 훅
export function useBoardForm({ isEdit = false, boardId }: { isEdit?: boolean; boardId?: string } = {}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showFailureAlert, setShowFailureAlert] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [createdBoardId, setCreatedBoardId] = useState<string | null>(null);

  // Apollo Client useMutation
  const [createBoard, { loading: mutationLoading, error: mutationError }] = useMutation(CREATE_BOARD);

  // React Hook Form 설정
  const form = useForm<BoardFormData>({
    resolver: zodResolver(boardFormSchema),
    defaultValues: {
      writer: '',
      password: '',
      title: '',
      contents: '',
      youtubeUrl: '',
      boardAddress: {
        zipcode: '',
        address: '',
        addressDetail: ''
      },
      images: []
    },
    mode: 'onChange', // 실시간 유효성 검사
    reValidateMode: 'onChange' // 실시간 재검증
  });

  // 폼 제출 핸들러
  const onSubmit = async (data: BoardFormData) => {
    try {
      setIsSubmitting(true);
      setShowFailureAlert(false);

      // Apollo Client를 사용한 createBoard mutation 요청
      const createBoardInput: CreateBoardInput = {
        writer: data.writer,
        password: data.password,
        title: data.title,
        contents: data.contents,
        youtubeUrl: data.youtubeUrl,
        boardAddress: data.boardAddress.zipcode || data.boardAddress.address || data.boardAddress.addressDetail
          ? {
              zipcode: data.boardAddress.zipcode,
              address: data.boardAddress.address,
              addressDetail: data.boardAddress.addressDetail
            }
          : undefined,
        images: data.images && data.images.length > 0 ? data.images : undefined
      };

      const result = await createBoard({
        variables: {
          createBoardInput
        }
      });

      // 성공 시 응답에서 _id 추출
      const boardId = result.data?.createBoard?._id;

      if (boardId) {
        setCreatedBoardId(boardId);
        // 성공 알림 표시
        setShowSuccessAlert(true);
      } else {
        // _id가 없는 경우 실패로 처리
        throw new Error('게시물 ID를 받지 못했습니다.');
      }

    } catch (error) {
      console.error('게시물 등록 중 오류가 발생했습니다:', error);
      // 실패 알림 표시
      setShowFailureAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 성공 알림 확인 핸들러
  const handleSuccessAlertConfirm = () => {
    setShowSuccessAlert(false);

    // 응답받은 _id를 사용하여 게시판 상세페이지로 이동
    if (createdBoardId) {
      const detailPath = getPath('BOARD_DETAIL', { BoardId: createdBoardId });
      router.push(detailPath);
    }
  };

  // 실패 알림 확인 핸들러
  const handleFailureAlertConfirm = () => {
    setShowFailureAlert(false);
    // 페이지 이동 금지 (사용자가 데이터 수정 가능하도록)
  };

  // 폼 리셋
  const resetForm = () => {
    form.reset();
  };

  // useController를 사용하여 필드 제어
  const titleController = useController({
    name: 'title',
    control: form.control,
    defaultValue: ''
  });

  const contentsController = useController({
    name: 'contents',
    control: form.control,
    defaultValue: ''
  });

  const writerController = useController({
    name: 'writer',
    control: form.control,
    defaultValue: ''
  });

  const passwordController = useController({
    name: 'password',
    control: form.control,
    defaultValue: ''
  });

  const youtubeUrlController = useController({
    name: 'youtubeUrl',
    control: form.control,
    defaultValue: ''
  });
  
  // 폼 값 변경 감지 및 유효성 검사 (writer, password, title, contents 필수)
  useEffect(() => {
    const writerValue = writerController.field.value || '';
    const passwordValue = passwordController.field.value || '';
    const titleValue = titleController.field.value || '';
    const contentsValue = contentsController.field.value || '';
    
    // 모든 필수 필드가 입력되었는지 확인
    const writerValid = writerValue.trim().length > 0 && writerValue.length <= 20;
    const passwordValid = passwordValue.length >= 4 && passwordValue.length <= 20;
    const titleValid = titleValue.trim().length > 0 && titleValue.length <= 100;
    const contentsValid = contentsValue.trim().length > 0;
    
    const isValid = writerValid && passwordValid && titleValid && contentsValid;
    setIsFormValid(isValid);
  }, [writerController.field.value, passwordController.field.value, titleController.field.value, contentsController.field.value]);

  return {
    form,
    onSubmit: form.handleSubmit(onSubmit),
    isSubmitting,
    showSuccessAlert,
    showFailureAlert,
    handleSuccessAlertConfirm,
    handleFailureAlertConfirm,
    resetForm,
    isFormValid,
    errors: form.formState.errors,
    titleController,
    contentsController,
    writerController,
    passwordController,
    youtubeUrlController
  };
}
