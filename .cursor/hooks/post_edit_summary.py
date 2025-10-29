#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Post-Edit Hook (inline version, improved)
- 각 '수정된 파일'에서 마지막 변경 hunk '바로 아래 줄'에 한국어 주석으로
  [변경 이유] + [학습 키워드] 블록을 삽입합니다.
- 별도 _last_reason.txt / _last_keywords.json 없이, git diff 휴리스틱으로 자동 생성.
- 실패/미지원 언어 등 예외면 파일 끝에 Append로 폴백.
- 개선 사항:
  * git diff를 HEAD / --cached / 워킹트리 순으로 다단계 시도(-U0, --no-color)
  * 삭제 전용 hunk(+count == 0) 위치 보정
  * payload 파일 키 다양성 지원(files | modified_files | file | filepath | path)
  * 중복 방지 윈도우 확장(±10줄)
  * run() stderr 합류로 디버깅 편의
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
    """subprocess wrapper: stderr를 stdout으로 합쳐 한쪽으로 모음."""
    return subprocess.check_output(cmd, text=True, stderr=subprocess.STDOUT)

def git_diff(path):
    """
    마지막 변경 hunk 포착을 위해 -U0, --no-color 사용.
    다양한 편집/스테이징 상황 대비: HEAD → --cached → 워킹트리 순으로 시도.
    """
    cmds = [
        ["git","diff","-U0","--no-color","HEAD","--",path],      # HEAD 기준
        ["git","diff","-U0","--no-color","--cached","--",path], # index 기준(이미 stage된 경우)
        ["git","diff","-U0","--no-color","--",path],            # 워킹트리 vs index
    ]
    for cmd in cmds:
        try:
            out = run(cmd)
            if out and out.strip():
                return out
        except Exception:
            pass
    return ""

def parse_last_hunk_pos(diff_text):
    """
    @@ -oldStart,oldCount +newStart,newCount @@
    마지막 hunk의 '주석을 꽂을 기준 라인 번호'(1-based)를 반환.
      - 추가/변경: 마지막 추가 라인 번호(newStart + newCount - 1)
      - 삭제 전용(+count == 0): 삭제 블록 '다음' 라인에 꽂아야 하므로 after_line = newStart
    """
    hunks = list(re.finditer(r"@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@", diff_text))
    if not hunks:
        return None
    m = hunks[-1]
    new_start = int(m.group(1))
    new_count = int(m.group(2) or "1")

    if new_count == 0:
        after_line = max(new_start, 1)     # insert_after_line에서 '아래'로 들어가므로 OK
    else:
        after_line = new_start + new_count - 1
    return after_line

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
    if line:  # 한 줄 주석 스타일
        return [line + s for s in lines]
    # 블록 주석 스타일
    return [start] + lines + [end]

def insert_after_line(lines, insert_lines, after_line_1based):
    """파일 줄 리스트에, after_line_1based '바로 아래'에 insert_lines를 삽입."""
    idx = max(0, min(len(lines), after_line_1based))  # 1-based → 아래에 넣으니 그 번호 그대로
    return lines[:idx] + insert_lines + ["\n"] + lines[idx:]

def already_nearby_has_signature(snippet):
    """주변에 이미 우리 자동 주석 시그니처가 있는지 검사(중복 방지)."""
    sig_keywords = ("변경 이유:", "=== 변경 주석 (자동 생성) ===")
    text = "".join(snippet) if isinstance(snippet, list) else str(snippet)
    return any(kw in text for kw in sig_keywords)

def list_modified_files_fallback():
    """payload 비어 있을 때를 대비한 안전장치: 변경 파일 대강 추출."""
    names = set()
    try:
        out = run(["git","diff","--name-only","HEAD"])
        for ln in out.splitlines():
            if ln.strip(): names.add(ln.strip())
    except Exception:
        pass
    try:
        out = run(["git","diff","--name-only","--cached"])
        for ln in out.splitlines():
            if ln.strip(): names.add(ln.strip())
    except Exception:
        pass
    try:
        out = run(["git","diff","--name-only"])
        for ln in out.splitlines():
            if ln.strip(): names.add(ln.strip())
    except Exception:
        pass
    return list(names)

def main():
    try:
        payload=json.load(sys.stdin)
    except Exception:
        payload={}
    files = (payload.get("files")
             or payload.get("modified_files")
             or payload.get("file")
             or payload.get("filepath")
             or payload.get("path")
             or [])
    if isinstance(files, str):
        files = [files]
    if not files:
        files = list_modified_files_fallback()

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
            try:
                with open(p, "ab") as w:
                    w.write(("".join(comment_lines)).encode("utf-8"))
            except Exception:
                pass
            continue

        lines = content.splitlines(True)  # keepends
        last_hunk_end = parse_last_hunk_pos(diff)

        if last_hunk_end is None:
            # 변경 hunk 못찾으면: 파일 끝에 붙임(이미 근처에 있으면 생략)
            tail_window = lines[-50:] if len(lines) > 50 else lines
            if not already_nearby_has_signature(tail_window):
                with open(p, "a", encoding="utf-8") as w:
                    w.write("\n" + "".join(comment_lines) + "\n")
            continue

        # 마지막 hunk '바로 아래'에 삽입, 중복 방지(±10줄)
        window_start = max(0, last_hunk_end-10)
        window_end = min(len(lines), last_hunk_end+10)
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

