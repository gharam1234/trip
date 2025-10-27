import svgPaths from "../../../public/icons/svg-35larhhclq";
import svgPathsEdit from "../../../public/icons/svg-kk6hs9thik";
import { useState } from "react";
import { User } from "lucide-react";
import styles from "./styles.module.css";

interface CommentItemProps {
  id: string;
  author: string;
  rating: number;
  content: string;
  date: string;
  onEdit: (id: string, content: string, rating: number) => void;
  onDelete: (id: string) => void;
}

interface CommentEditFormProps {
  initialContent: string;
  initialRating: number;
  initialAuthor: string;
  onSave: (content: string, rating: number, author: string, password: string) => void;
  onCancel: () => void;
}

function ProfileImg() {
  return (
    <div className={styles.profileImg}>
      <User className={styles.profileIcon} />
    </div>
  );
}

function ReadOnlyStar({ filled }: { filled: boolean }) {
  return (
    <div className={styles.star}>
      <svg className={styles.starSvg} fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g>
          <path d={svgPaths.pe83d900} fill={filled ? "#FADA67" : "#C7C7C7"} />
        </g>
      </svg>
    </div>
  );
}

function EditableStarButton({ filled, onClick }: { filled: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={styles.starButton} type="button">
      <div className={styles.star}>
        <svg className={styles.starSvg} fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <g>
            <path d={svgPathsEdit.pe83d900} fill={filled ? "#FADA67" : "#C7C7C7"} />
          </g>
        </svg>
      </div>
    </button>
  );
}

function CommentEditForm({
  initialContent,
  initialRating,
  initialAuthor,
  onSave,
  onCancel,
}: CommentEditFormProps) {
  const [content, setContent] = useState(initialContent);
  const [rating, setRating] = useState(initialRating);
  const [author, setAuthor] = useState(initialAuthor);
  const [password, setPassword] = useState("");

  const maxLength = 100;
  const contentLength = content.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && author.trim()) {
      onSave(content, rating, author, password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.editFormContainer}>
      <div className={styles.starSection}>
        <div className={styles.starContainer}>
          {[1, 2, 3, 4, 5].map((starIndex) => (
            <EditableStarButton
              key={starIndex}
              filled={starIndex <= rating}
              onClick={() => setRating(starIndex)}
            />
          ))}
        </div>

        <div className={styles.inputRow}>
          <div className={styles.inputGroup}>
            <div className={styles.label}>
              <p className={styles.labelText}>작성자</p>
              <p className={styles.required}>*</p>
            </div>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.label}>
              <p className={styles.labelText}>비밀번호</p>
              <p className={styles.required}>*</p>
            </div>
            <div className={styles.inputWrapper}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력해 주세요."
                className={`${styles.input} ${styles.inputBordered}`}
                required
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.textareaContainer}>
        <div className={styles.textareaWrapper}>
          <textarea
            value={content}
            onChange={(e) => {
              if (e.target.value.length <= maxLength) {
                setContent(e.target.value);
              }
            }}
            placeholder="댓글을 입력해 주세요."
            className={styles.textarea}
            required
          />
          <p className={styles.charCount}>
            {contentLength}/{maxLength}
          </p>
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>
          취소
        </button>
        <button type="submit" className={styles.submitButton}>
          수정 하기
        </button>
      </div>
    </form>
  );
}

function IconEdit() {
  return (
    <div className={styles.icon}>
      <svg className={styles.iconSvg} fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g>
          <path d={svgPaths.p25c1d00} fill="var(--color-text-secondary)" />
        </g>
      </svg>
    </div>
  );
}

function IconClose() {
  return (
    <div className={styles.icon}>
      <svg className={styles.iconSvg} fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g>
          <path d={svgPaths.pf6bf000} fill="var(--color-text-secondary)" />
        </g>
      </svg>
    </div>
  );
}

export default function CommentItem({ id, author, rating, content, date, onEdit, onDelete }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = (newContent: string, newRating: number, newAuthor: string, password: string) => {
    // 실제 환경에서는 비밀번호 검증이 필요합니다
    onEdit(id, newContent, newRating);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={styles.commentContainer}>
        <CommentEditForm
          initialContent={content}
          initialRating={rating}
          initialAuthor={author}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className={styles.commentContainer}>
      <div className={styles.header}>
        <div className={styles.profileSection}>
          <div className={styles.profile}>
            <ProfileImg />
            <p className={styles.authorName}>{author}</p>
          </div>
          <div className={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((starIndex) => (
              <ReadOnlyStar key={starIndex} filled={starIndex <= rating} />
            ))}
          </div>
        </div>
        <div className={styles.actionButtons}>
          <button onClick={() => setIsEditing(true)} className={styles.iconButton} type="button">
            <IconEdit />
          </button>
          <button onClick={() => onDelete(id)} className={styles.iconButton} type="button">
            <IconClose />
          </button>
        </div>
      </div>
      <div className={styles.content}>
        {content}
      </div>
      <div className={styles.dateContainer}>
        <p className={styles.date}>{date}</p>
      </div>
    </div>
  );
}