"use client";

import { useState, useRef } from "react";
import { useMutation } from "@apollo/client/react";
import { UPLOAD_FILE, UploadFileResponse } from "../graphql/mutations";

/**
 * 이미지 업로드 커스텀 훅
 *
 * 기능:
 * - 최대 3개의 이미지 업로드
 * - 파일 선택 시 서버에 업로드 후 미리보기 URL 생성
 * - 이미지 삭제 기능
 * - JPEG, PNG 확장자만 허용
 * - Google Cloud Storage에 파일 업로드
 *
 * @returns {Object} 이미지 업로드 관련 상태 및 함수
 * - imageUrls: 업로드된 이미지 URL 배열 (string[])
 * - fileRefs: 파일 input ref 배열 (RefObject<HTMLInputElement>[])
 * - onChangeFile: 파일 선택 핸들러 (index: number, event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
 * - onClickDeleteFile: 이미지 삭제 핸들러 (index: number, event: React.MouseEvent) => void
 * - onClickGrayBox: gray box 클릭 핸들러 (index: number, event: React.MouseEvent) => void
 * - getUploadedImageUrls: 업로드된 이미지 URL 배열 반환 (빈 문자열 제외) () => string[]
 */
export const useImageUpload = () => {
  // 이미지 URL 상태 - 초기값: 3개의 빈 문자열
  const [imageUrls, setImageUrls] = useState<string[]>(["", "", ""]);

  // 각 이미지 업로드 input에 대한 ref 배열
  const fileRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Apollo Client useMutation - uploadFile
  const [uploadFile] = useMutation<UploadFileResponse>(UPLOAD_FILE);

  /**
   * 파일 선택 시 호출되는 핸들러
   * - 선택된 파일을 서버에 업로드
   * - 업로드 성공 시 Google Cloud Storage URL을 imageUrls 상태에 저장
   */
  const onChangeFile = async (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // GraphQL uploadFile mutation 호출
      const result = await uploadFile({
        variables: {
          file,
        },
      });

      // 업로드 성공 시 반환된 URL을 상태에 저장
      const fileUrl = result.data?.uploadFile?.url;
      if (fileUrl) {
        setImageUrls((prev) => {
          const newImageUrls = [...prev];
          // Google Cloud Storage URL 형식으로 저장
          newImageUrls[index] = `https://storage.googleapis.com/${fileUrl}`;
          return newImageUrls;
        });
      }
    } catch (error) {
      console.error("파일 업로드 중 오류가 발생했습니다:", error);
      // 업로드 실패 시 input 초기화
      if (fileRefs[index].current) {
        fileRefs[index].current!.value = "";
      }
    }
  };

  /**
   * 이미지 삭제 버튼 클릭 시 호출되는 핸들러
   * - 해당 인덱스의 이미지 URL을 빈 문자열로 변경
   * - input value 초기화
   * - 이벤트 전파 중단 (gray box 클릭 이벤트 방지)
   */
  const onClickDeleteFile = (index: number, event: React.MouseEvent) => {
    event.stopPropagation(); // 부모 요소(gray box)의 클릭 이벤트 전파 방지

    setImageUrls((prev) => {
      const newUrls = [...prev];
      newUrls[index] = "";
      return newUrls;
    });

    // input value 초기화
    if (fileRefs[index].current) {
      fileRefs[index].current!.value = "";
    }
  };

  /**
   * gray box 클릭 시 호출되는 핸들러
   * - 숨겨진 file input을 프로그래밍 방식으로 클릭
   */
  const onClickGrayBox = (index: number, event: React.MouseEvent) => {
    event.preventDefault();
    fileRefs[index].current?.click();
  };

  /**
   * 업로드된 이미지 URL 배열 반환 (빈 문자열 제외)
   * - 폼 제출 시 사용
   */
  const getUploadedImageUrls = (): string[] => {
    return imageUrls.filter((url) => url !== "");
  };

  return {
    imageUrls,
    fileRefs,
    onChangeFile,
    onClickDeleteFile,
    onClickGrayBox,
    getUploadedImageUrls,
  };
};
