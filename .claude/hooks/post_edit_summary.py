#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Post-Edit Hook (inline version)
- 각 '수정된 파일'에서 마지막 변경 hunk '바로 아래 줄'에 한국어 주석으로
  [변경 이유] + [학습 키워드] 블록을 삽입합니다.
- 별도 _last_reason.txt / _last_keywords.json 없이, git diff 휴리스틱으로 자동 생성.
- 실패/미지원 언어 등 예외면 파일 끝에 Append로 폴백.
"""
import json, sys, subprocess, pathlib, re, datetime

COMMENT_STYLES = {
  ".py": ("", "", "# "),
  ".js": ("", "", "// "), ".ts": ("", "", "// "), ".tsx": ("", "", "// "), ".jsx": ("", "", "// "),
  ".java": ("", "", "// "), ".go": ("", "", "// "), ".rs": ("", "", "// "),
  ".c": ("", "", "// "), ".cpp": ("", "", "// "), ".h": ("", "", "// "),
  ".cs": ("", "", "// "), ".php": ("", "", "// "),
  ".rb": ("", "", "# "), ".sh": ("", "", "# "),
  ".yml": ("", "", "# "), ".yaml": ("", "", "# "), ".toml": ("", "", "# "),
  ".md": ("<!--", "-->", None), ".html": ("<!--", "-->", None),
  ".css": ("/*", "*/", None), ".scss": ("/*", "*/", None),
}

def run(cmd): 
    return subprocess.check_output(cmd, text=True, stderr=subprocess.DEVNULL)

def git_diff(path):
    try:
        # unified=0 → hunk 범위 정확히 잡기 좋음
        return run(["git","diff","--unified=0","--",path])
    except Exception:
        return ""

def parse_last_hunk_pos(diff_text):
    """
    @@ -oldStart,oldCount +newStart,newCount @@
    마지막 hunk의 (newStart, newCount)를 반환.
    """
    hunks = list(re.finditer(r"@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@", diff_text))
    if not hunks:
        return None
    m = hunks[-1]
    new_start = int(m.group(1))
    new_count = int(m.group(2) or "1")
    # 변경 블록의 '마지막 줄 번호'(1-based)
    end_line = new_start + new_count - 1
    return end_line

def parse_added_removed(diff_text):
    add=sum(1 for ln in diff_text.splitlines() if ln.startswith("+") and not ln.startswith("+++"))
    rem=sum(1 for ln in diff_text.splitlines() if ln.startswith("-") and not ln.startswith("---"))
    return add, rem

# --- 변경 이유(한국어) 휴리스틱 ---
def detect_reason_ko(diff):
    if re.search(r"\bfix|bug|error|exception|null|nan|edge case|race|concurrency|deadlock\b", diff, re.I):
        return "버그 수정 및 예외/경계·동시성 대응"
    if re.search(r"\brefactor|rename|extract|inline|clean|format|lint\b", diff, re.I):
        return "리팩터링/가독성 및 유지보수성 개선"
    if re.search(r"\bperf|optimi[sz]e|latency|throughput|complexity|big[-_ ]?o\b", diff, re.I):
        return "성능 최적화/복잡도 개선"
    if re.search(r"\bapi|endpoint|request|response|contract change\b", diff, re.I):
        return "API/인터페이스 변경 대응"
    if re.search(r"\bvalidate|schema|type|typing\b", diff, re.I):
        return "입력 검증/타입 안정성 강화"
    if re.search(r"\bauth|oauth|jwt|csrf|xss|sqli\b", diff, re.I):
        return "보안 강화(인증/인가/취약점 대응)"
    if re.search(r"\blog|metric|trace|telemetry|observab(ility)?\b", diff, re.I):
        return "관측성(로그/메트릭/트레이스) 보강"
    return "요구사항 반영 또는 사소한 개선(자동 추정)"

# --- 공부용 키워드 자동 추출(한국어) ---
KEYWORD_RULES = [
  (r"\basync|await|promise|future|goroutine|thread|lock|race|mutex\b", ["비동기/await","동시성","락/경쟁 상태"]),
  (r"\brefactor|rename|extract|inline|lint|format\b", ["리팩터링","가독성 개선"]),
  (r"\bperf|optimi[sz]e|latency|throughput|big[-_ ]?o|complexity\b", ["성능 최적화","시간복잡도"]),
  (r"\bcache|memo(ize)?|index\b", ["캐싱","인덱스"]),
  (r"\bsql|join|transaction|isolation|deadlock\b", ["SQL","트랜잭션","격리수준"]),
  (r"\bhttp|rest|graphql|grpc|endpoint|contract\b", ["API 설계","인터페이스 변경"]),
  (r"\bvalidate|schema|type|typing\b", ["입력 검증","타입 안정성"]),
  (r"\bauth|oauth|jwt|csrf|xss|sqli\b", ["인증/인가","보안 취약점"]),
  (r"\blog|metric|trace|telemetry|observab(ility)?\b", ["관측성","로그/메트릭"]),
  (r"\bregex|parser|ast\b", ["정규표현식","파서/AST"]),
  (r"\bbfs|dfs|dp|binary search|heap\b", ["알고리즘","자료구조"]),
  (r"\bdebounce|throttle|rate[-_ ]limit\b", ["호출 빈도 제한","디바운스/스로틀"]),
]
def detect_keywords_ko(pool_text, limit=8):
    found=set()
    for pat, kws in KEYWORD_RULES:
        if re.search(pat, pool_text, re.I):
            for k in kws: found.add(k)
    out = sorted(found)
    return out[:limit] if out else ["개념 식별 불가(자동 추정 실패)"]

def make_comment(ext, lines):
    start, end, line = COMMENT_STYLES.get(ext, ("", "", "// "))
    if line:  # 한 줄 주석
        return [line + s for s in lines]
    # 블록 주석
    return [start] + lines + [end]

def insert_after_line(lines, insert_lines, after_line_1based):
    """파일 줄 리스트에, after_line_1based 바로 아래에 insert_lines를 삽입."""
    idx = max(0, min(len(lines), (after_line_1based)))  # 1-based → 아래에 넣으니 그 번호 그대로
    return lines[:idx] + insert_lines + ["\n"] + lines[idx:]

def already_nearby_has_signature(snippet):
    # '변경 이유' 라벨 존재 여부로 간단 중복 방지
    return any("변경 이유:" in s for s in snippet)

def main():
    try:
        payload=json.load(sys.stdin)
    except Exception:
        payload={}
    files = payload.get("files") or payload.get("modified_files") or []

    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    for f in files:
        p = pathlib.Path(f)
        if not p.exists() or p.is_dir():
            continue

        ext = p.suffix.lower()
        diff = git_diff(str(p))
        add, rem = parse_added_removed(diff)
        reason = detect_reason_ko(diff)
        keywords = detect_keywords_ko(diff)

        # 코멘트 라인 구성
        body = [
            "=== 변경 주석 (자동 생성) ===",
            f"시각: {now}",
            f"변경 이유: {reason}",
            "학습 키워드: " + ", ".join(keywords)
        ]
        comment_lines = [ln + "\n" for ln in make_comment(ext, body)]

        # 파일 내용 읽기
        try:
            content = p.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            # 폴백: 파일 끝 Append
            with open(p, "ab") as w:
                w.write(("".join(comment_lines)).encode("utf-8"))
            continue

        lines = content.splitlines(True)  # keepends
        last_hunk_end = parse_last_hunk_pos(diff)

        if last_hunk_end is None:
            # 변경 hunk 못찾으면 파일 끝에 붙임
            if not already_nearby_has_signature(lines[-25:]):
                with open(p, "a", encoding="utf-8") as w:
                    w.write("\n" + "".join(comment_lines) + "\n")
            continue

        # 마지막 hunk '바로 아래'에 삽입
        window_start = max(0, last_hunk_end-5)
        window_end = min(len(lines), last_hunk_end+5)
        if already_nearby_has_signature(lines[window_start:window_end]):
            continue

        new_lines = insert_after_line(lines, comment_lines, last_hunk_end)
        with open(p, "w", encoding="utf-8") as w:
            w.write("".join(new_lines))

if __name__ == "__main__":
    main()

# === 변경 주석 (자동 생성) ===
# 시각: 2025-10-29 16:25:35
# 변경 이유: 요구사항 반영 또는 사소한 개선(자동 추정)
# 학습 키워드: 개념 식별 불가(자동 추정 실패)

