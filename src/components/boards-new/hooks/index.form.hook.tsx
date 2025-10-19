"use client";

import { useForm, useController } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getPath } from '@/commons/constants/url';

// 주소 입력 타입 정의
export interface BoardAddressInput {
  zipcode: string;
  address: string;
  addressDetail: string;
}

// 게시판 폼 데이터 타입 정의
export interface BoardFormData {
  writer: string;
  password: string;
  title: string;
  contents: string;
  youtubeUrl: string;
  boardAddress: BoardAddressInput;
  images: string[];
}

// 로컬스토리지에 저장될 게시판 데이터 타입
export interface BoardData {
  boardId: string;
  writer: string;
  password: string;
  title: string;
  contents: string;
  youtubeUrl: string;
  boardAddress: BoardAddressInput;
  images: string[];
  createdAt: string;
}

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
export function useBoardForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

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

      // 로컬스토리지에서 기존 boards 데이터 가져오기
      const existingBoards = getBoardsFromLocalStorage();
      
      // 새로운 게시물 ID 생성 (기존 데이터가 있으면 가장 큰 ID + 1, 없으면 1)
      const newBoardId = existingBoards.length > 0 
        ? String(Math.max(...existingBoards.map(board => parseInt(board.boardId))) + 1)
        : '1';

      // 새로운 게시물 데이터 생성
      const newBoard: BoardData = {
        boardId: newBoardId,
        writer: data.writer,
        password: data.password,
        title: data.title,
        contents: data.contents,
        youtubeUrl: data.youtubeUrl || '',
        boardAddress: data.boardAddress,
        images: data.images || [],
        createdAt: new Date().toISOString()
      };

      // 기존 데이터에 새 게시물 추가
      const updatedBoards = [...existingBoards, newBoard];
      
      // 로컬스토리지에 저장
      saveBoardsToLocalStorage(updatedBoards);

      // 성공 알림 표시
      setShowSuccessAlert(true);

    } catch (error) {
      console.error('게시물 등록 중 오류가 발생했습니다:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 성공 알림 확인 핸들러
  const handleSuccessAlertConfirm = () => {
    setShowSuccessAlert(false);
    
    // 폼 데이터에서 boardId 가져오기 (방금 저장한 데이터)
    const formData = form.getValues();
    const existingBoards = getBoardsFromLocalStorage();
    const newBoardId = existingBoards.length > 0 
      ? String(Math.max(...existingBoards.map(board => parseInt(board.boardId))))
      : '1';

    // 게시판 상세페이지로 리다이렉트
    const detailPath = getPath('BOARD_DETAIL', { BoardId: newBoardId });
    router.push(detailPath);
  };

  // 로컬스토리지에서 boards 데이터 가져오기
  const getBoardsFromLocalStorage = (): BoardData[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem('boards');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('로컬스토리지에서 boards 데이터를 가져오는 중 오류가 발생했습니다:', error);
      return [];
    }
  };

  // 로컬스토리지에 boards 데이터 저장하기
  const saveBoardsToLocalStorage = (boards: BoardData[]) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('boards', JSON.stringify(boards));
    } catch (error) {
      console.error('로컬스토리지에 boards 데이터를 저장하는 중 오류가 발생했습니다:', error);
    }
  };

  // 폼 리셋
  const resetForm = () => {
    form.reset();
  };

  // useController를 사용하여 title과 contents 필드 제어
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
    handleSuccessAlertConfirm,
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
