import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import Modal, { ModalProps } from './index';

// 한국어 주석: 모달 컴포넌트 스토리 - variant/actions 조합과 컨트롤 제공

const meta: Meta<typeof Modal> = {
  title: 'Commons/Modal',
  component: Modal,
  tags: ['autodocs'],
  parameters: {
    // 모달 컴포넌트를 중앙에 배치
    layout: 'centered',
    // 배경을 어둡게 설정하여 모달이 잘 보이도록 함
    backgrounds: {
      default: 'dark',
    },
  },
  argTypes: {
    // 한국어 주석: variant 선택 - info/danger
    variant: {
      control: { type: 'radio' },
      options: ['info', 'danger'],
      description: '모달 시각 변형',
    },
    // 한국어 주석: actions 선택 - single/dual
    actions: {
      control: { type: 'radio' },
      options: ['single', 'dual'],
      description: '모달 액션 버튼 구성',
    },
    // 한국어 주석: 기본 텍스트 컨트롤
    title: { control: { type: 'text' }, description: '모달 제목' },
    description: { control: { type: 'text' }, description: '모달 설명' },
    confirmText: { control: { type: 'text' }, description: '확인 버튼 텍스트' },
    cancelText: { control: { type: 'text' }, description: '취소 버튼 텍스트' },
    // 한국어 주석: 외부 클래스는 컨트롤 비활성화
    className: { control: false },
    // 한국어 주석: 액션 핸들러
    onConfirm: { action: 'confirmed' },
    onCancel: { action: 'cancelled' },
  },
  args: {
    // 한국어 주석: 기본 args - info/single/기본 텍스트
    variant: 'info',
    actions: 'single',
    title: '정보 확인',
    description: '이 작업을 계속하시겠습니까?',
    confirmText: '확인',
    cancelText: '취소',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 한국어 주석: 정보 모달 (단일 액션)
export const InfoSingle: Story = {
  name: 'Info / Single',
};

// 한국어 주석: 정보 모달 (이중 액션)
export const InfoDual: Story = {
  name: 'Info / Dual',
  args: {
    actions: 'dual',
    title: '작업 확인',
    description: '변경사항이 저장되지 않습니다. 정말로 나가시겠습니까?',
    confirmText: '나가기',
  },
};

// 한국어 주석: 위험 모달 (단일 액션)
export const DangerSingle: Story = {
  name: 'Danger / Single',
  args: {
    variant: 'danger',
    title: '삭제 확인',
    description: '이 항목을 삭제하시겠습니까?',
    confirmText: '삭제',
  },
};

// 한국어 주석: 위험 모달 (이중 액션)
export const DangerDual: Story = {
  name: 'Danger / Dual',
  args: {
    variant: 'danger',
    actions: 'dual',
    title: '계정 삭제',
    description: '계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 정말로 삭제하시겠습니까?',
    confirmText: '삭제',
  },
};

// 한국어 주석: 긴 텍스트가 포함된 모달
export const LongText: Story = {
  name: 'Long Text',
  args: {
    actions: 'dual',
    title: '서비스 이용약관 변경 안내',
    description: '서비스 이용약관이 변경되었습니다. 새로운 약관은 2024년 1월 1일부터 적용됩니다. 주요 변경사항은 다음과 같습니다: 개인정보 처리방침 업데이트, 서비스 이용 규정 변경, 고객 지원 정책 개선 등이 포함되어 있습니다.',
    confirmText: '동의',
    cancelText: '거부',
  },
};

// 한국어 주석: 커스텀 버튼 텍스트
export const CustomButtons: Story = {
  name: 'Custom Buttons',
  args: {
    actions: 'dual',
    title: '사용자 정의 버튼',
    description: '버튼 텍스트를 사용자 정의할 수 있습니다.',
    confirmText: '저장하기',
    cancelText: '닫기',
  },
};


