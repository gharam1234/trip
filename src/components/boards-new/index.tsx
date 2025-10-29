"use client";

import React from "react";
import Image from "next/image";
import styles from "./styles.module.css";
import { Input } from "@/commons/components/input";
import { Textarea } from "@/commons/components/textarea";
import { Button } from "@/commons/components/button";
import { Modal as AntdModal } from "antd";
import DaumPostcodeEmbed from "react-daum-postcode";
import { useBoardForm } from "./hooks/index.form.hook";
import { useBoardUpdateForm } from "./hooks/index.update.form.hook";
import { useAddressSearch } from "./hooks/index.address.hook";
import { useImageUpload } from "./hooks/index.image.hook";
import { Modal as ProviderModal } from "@/commons/providers/modal/modal.provider";
import { Modal as FeedbackModal } from "@/commons/components/modal";

/**
 * 보드 작성 UI 컴포넌트
 * - 피그마 노드 레이아웃을 기준으로 고정 사이즈를 적용
 * - 공통컴포넌트는 variant/size/className만 사용 (원본 수정 금지)
 */
export default function BoardsWriteUI({ isEdit = false, boardId }: { isEdit?: boolean; boardId?: string }): JSX.Element {
  // 수정 모드일 때는 수정 전용 훅 사용, 그렇지 않으면 일반 폼 훅 사용
  const formHook = isEdit && boardId 
    ? useBoardUpdateForm({ boardId })
    : useBoardForm({ isEdit, boardId });

  const {
    form,
    onSubmit,
    isSubmitting,
    showSuccessAlert,
    showFailureAlert,
    handleSuccessAlertConfirm,
    handleFailureAlertConfirm,
    isFormValid,
    errors,
    titleController,
    contentsController,
    writerController,
    passwordController,
    youtubeUrlController
  } = formHook;

  // 주소 검색 훅 초기화 - 주소 선택 완료 시 폼 필드 업데이트
  const addressHook = useAddressSearch((data) => {
    // 우편번호 설정 - shouldValidate, shouldDirty, shouldTouch 옵션으로 UI 업데이트 강제
    if (data.zipcode) {
      form.setValue('boardAddress.zipcode', data.zipcode, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    }
    // 주소 설정 - shouldValidate, shouldDirty, shouldTouch 옵션으로 UI 업데이트 강제
    if (data.address) {
      form.setValue('boardAddress.address', data.address, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
    }
  });

  // 이미지 업로드 훅 초기화
  const {
    imageUrls,
    fileRefs,
    onChangeFile,
    onClickDeleteFile,
    onClickGrayBox,
    getUploadedImageUrls,
  } = useImageUpload();

  // 이미지 URL이 변경될 때마다 폼 필드 업데이트
  React.useEffect(() => {
    const uploadedUrls = getUploadedImageUrls();
    form.setValue('images', uploadedUrls);
  }, [imageUrls, form, getUploadedImageUrls]);

  return (
    <section className={styles.writeContainer} data-testid="boards-write-page">
      {/* {gap}: 1280 * 40 */}
      <div className={styles.gap} />

      {/* write-header: 1280 * 68 (노드: 285:32386) */}
      <header className={styles.writeHeader}>
        <h1 className={styles.headerTitle}>{isEdit ? '게시물 수정' : '게시물 등록'}</h1>
      </header>
      {/* 수평선 */}
      <div className={styles.divider} />
      {/* {gap}: 1280 * 40 */}
      <div className={styles.gap} />
    
      
      {/* write-writer: 1280 * 80 */}
      <div className={styles.writeWriter}>
        <h2 className={styles.sectionTitle}>
          작성자<span className={styles.requiredMark}>*</span>
        </h2>
        <Input
          variant="primary"
          placeholder="작성자를 입력해 주세요."
          maxLength={20}
          className={styles.fullWidth}
          {...writerController.field}
          data-testid="board-writer-input"
        />
        {errors.writer && (
          <div className={styles.errorMessage} data-testid="writer-error-message">
            {errors.writer.message}
          </div>
        )}
      </div>

      {/* {gap}: 1280 * 40 */}
      <div className={styles.gap} />

      {/* write-password: 1280 * 80 */}
      <div className={styles.writePassword}>
        <h2 className={styles.sectionTitle}>
          비밀번호<span className={styles.requiredMark}>*</span>
        </h2>
        <Input
          variant="primary"
          type="password"
          placeholder="비밀번호를 입력해 주세요."
          maxLength={20}
          className={styles.fullWidth}
          {...passwordController.field}
          data-testid="board-password-input"
        />
        {errors.password && (
          <div className={styles.errorMessage} data-testid="password-error-message">
            {errors.password.message}
          </div>
        )}
      </div>

      {/* {gap}: 1280 * 40 */}
      <div className={styles.gap} />

      {/* write-title: 1280 * 80 (노드: 285:32394) */}
      <div className={styles.writeTitle}>
        <h2 className={styles.sectionTitle}>
          제목<span className={styles.requiredMark}>*</span>
        </h2>
        <Input
          variant="primary"
          placeholder="제목을 입력해 주세요."
          maxLength={100}
          className={styles.fullWidth}
          {...titleController.field}
          onChange={(e) => {
            titleController.field.onChange(e);
            // 100자 초과 시 입력 제한
            if (e.target.value.length > 100) {
              e.target.value = e.target.value.substring(0, 100);
            }
          }}
          data-testid="board-title-input"
        />
        {errors.title && (
          <div className={styles.errorMessage} data-testid="title-error-message">
            {errors.title.message}
          </div>
        )}
      </div>

      {/* {gap}: 1280 * 40 */}
      <div className={styles.gap} />

      {/* 수평선 */}
      <div className={styles.divider} />

      {/* {gap}: 1280 * 40 */}
      <div className={styles.gap} />

      {/* write-contents: 1280 * 368 (노드: 285:32396) */}
      <div className={styles.writeContents}>
        <h2 className={styles.sectionTitle}>
          내용<span className={styles.requiredMark}>*</span>
        </h2>
        <Textarea
          variant="primary"
          placeholder="내용을 입력해 주세요."
          className={styles.contentTextarea}
          size="large"
          {...contentsController.field}
          data-testid="board-content-input"
        />
        {errors.contents && (
          <div className={styles.errorMessage} data-testid="content-error-message">
            {errors.contents.message}
          </div>
        )}
      </div>

      {/* {gap}: 1280 * 40 */}
      <div className={styles.gap} />

      

      {/* {gap}: 1280 * 40 */}
      <div className={styles.gap} />

      {/* write-address: 1280 * 192 (노드: 285:32401) */}
      <div className={styles.writeAddress}>
        <h2 className={styles.sectionTitle}>
          주소
        </h2>
        <div className={styles.addressRow}>
          <Input
            variant="primary"
            placeholder="01234"
            disabled
            value={form.watch('boardAddress.zipcode') || ''}
            onChange={(e) => form.setValue('boardAddress.zipcode', e.target.value)}
            className={styles.zipInput}
          />
          <Button
            variant="secondary"
            className={styles.zipButton}
            onClick={() => addressHook.handleToggleModal()}
            type="button"
          >
            우편번호 검색
          </Button>
        </div>
        <div className={styles.addressRow}>
          <Input
            variant="primary"
            placeholder="주소를 입력해 주세요,"
            readOnly
            value={form.watch('boardAddress.address') || ''}
            onChange={(e) => form.setValue('boardAddress.address', e.target.value)}
            className={styles.fullWidth}
          />
        </div>
        <div className={styles.addressRow}>
          <Input
            variant="primary"
            placeholder="상세주소"
            value={form.watch('boardAddress.addressDetail') || ''}
            onChange={(e) => form.setValue('boardAddress.addressDetail', e.target.value)}
            className={styles.fullWidth}
          />
        </div>
      </div>

      {/* {gap}: 1280 * 40 */}
      <div className={styles.gap} />

      {/* 수평선 */}
      <div className={styles.divider} />

      {/* {gap}: 1280 * 40 */}
      <div className={styles.gap} />

      {/* write-utube: 1280 * 80 (노드: 285:32406) */}
      <div className={styles.writeUtube}>
        <h2 className={styles.sectionTitle}>
          유튜브 링크
        </h2>
        <Input
          variant="primary"
          placeholder="링크를 입력해 주세요."
          className={styles.fullWidth}
          {...youtubeUrlController.field}
          data-testid="board-youtube-input"
        />
        {errors.youtubeUrl && (
          <div className={styles.errorMessage} data-testid="youtube-error-message">
            {errors.youtubeUrl.message}
          </div>
        )}
      </div>

      {/* {gap}: 1280 * 40 */}
      <div className={styles.gap} />

      {/* 수평선 */}
      <div className={styles.divider} />

      {/* {gap}: 1280 * 40 */}
      <div className={styles.gap} />

      {/* write-images: 1280 * 192 (노드: 285:32408) */}
      <div className={styles.writeImages}>
        <h2 className={styles.sectionTitle}>
          사진 첨부
        </h2>
        <div style={{ display: "flex" }}>
          {imageUrls.map((url, index) => (
            <div key={index} style={{ display: "flex", marginRight: "10px" }}>
              <div
                style={{
                  width: "200px",
                  height: "200px",
                  backgroundColor: "gray",
                  cursor: "pointer",
                }}
                onClick={(event) => onClickGrayBox(index, event)}
              >
                {url ? (
                  <div className={styles.imageBox}>
                    <img
                      src={url}
                      alt={`업로드된 이미지 ${index + 1}`}
                      width={200}
                      height={200}
                      style={{ objectFit: "contain" }}
                    />
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={(event) => onClickDeleteFile(index, event)}
                      data-testid={`delete-image-btn-${index}`}
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <Image
                    src={"/images/add-image.png"}
                    alt="사진업로드"
                    width={200}
                    height={200}
                  />
                )}
              </div>

              <input
                id={`fileInput_${index}`}
                style={{ display: "none" }}
                type="file"
                ref={fileRefs[index]}
                accept="image/jpeg, image/png"
                onChange={(event) => onChangeFile(index, event)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* {gap}: 1280 * 40 */}
      <div className={styles.gap} />

      {/* write-footer: 1280 * 48 (노드: 285:32416) */}
      <footer className={styles.writeFooter}>
        <div className={styles.footerButtons}>
          <Button 
            variant="secondary" 
            className={styles.footerButtonLeft}
            onClick={() => window.history.back()}
            data-testid="cancel-button"
          >
            취소
          </Button>
          <Button 
            variant="primary" 
            className={styles.footerButtonRight}
            data-testid="board-submit-button"
            disabled={!isFormValid || isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? (isEdit ? '수정 중...' : '등록 중...') : (isEdit ? '수정하기' : '등록하기')}
          </Button>
        </div>
      </footer>

      {/* 주소 검색 모달 - antd Modal 사용 */}
      <AntdModal
        title="우편번호 & 주소찾기"
        open={addressHook.isModalOpen}
        onOk={addressHook.handleToggleModal}
        onCancel={addressHook.handleToggleModal}
        width={500}
        data-testid="address-search-modal"
      >
        <DaumPostcodeEmbed onComplete={addressHook.handleAddressComplete} />
      </AntdModal>

      {/* 성공 알림 모달 - antd Modal 사용 */}
      <ProviderModal
        id="board-success-modal"
        isOpen={showSuccessAlert}
        onClose={handleSuccessAlertConfirm}
        data-testid="success-alert"
      >
        <FeedbackModal
          variant="info"
          actions="single"
          title={isEdit ? '수정 완료' : '등록 완료'}
          description={isEdit ? '게시물이 성공적으로 수정되었습니다.' : '게시물이 성공적으로 등록되었습니다.'}
          confirmText="확인"
          onConfirm={handleSuccessAlertConfirm}
          confirmTestId="success-alert-confirm"
        />
      </ProviderModal>

      {/* 실패 알림 모달 - antd Modal 사용 */}
      <ProviderModal
        id="board-failure-modal"
        isOpen={showFailureAlert}
        onClose={handleFailureAlertConfirm}
        data-testid="failure-alert"
      >
        <FeedbackModal
          variant="danger"
          actions="single"
          title={isEdit ? '수정 실패' : '등록 실패'}
          description={isEdit ? '게시물 수정에 실패했습니다.' : '게시물 등록에 실패했습니다.'}
          confirmText="확인"
          onConfirm={handleFailureAlertConfirm}
          confirmTestId="failure-alert-confirm"
        />
      </ProviderModal>
    </section>
  );
}

// === 변경 주석 (자동 생성) ===
// 시각: 2025-10-29 16:25:35
// 변경 이유: 요구사항 반영 또는 사소한 개선(자동 추정)
// 학습 키워드: 개념 식별 불가(자동 추정 실패)

