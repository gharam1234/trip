import { NextRequest } from 'next/server';

// 주의: 이 라우트는 테스트 환경 전용입니다. 간단한 스텁 응답을 제공합니다.

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let query = '';
    let variables: any = {};

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const operations = formData.get('operations');
      if (typeof operations === 'string') {
        try {
          const parsed = JSON.parse(operations);
          query = parsed?.query || '';
          variables = parsed?.variables || {};
        } catch (parseError) {
          console.error('Failed to parse multipart operations:', parseError);
        }
      }
    } else {
      const body = await req.json();
      query = body?.query || '';
      variables = body?.variables || {};
    }

    // 간단한 오퍼레이션 식별 (문자열 포함으로 판별)
    const isOperation = (name: string) => {
      const pattern = new RegExp(`\\b${name}\\b`);
      return pattern.test(query);
    };

    // fetchUserLoggedIn 쿼리
    if (isOperation('fetchUserLoggedIn')) {
      return Response.json({
        data: {
          fetchUserLoggedIn: {
            _id: 'user-001',
            name: '테스트유저',
            picture: null,
            userPoint: { amount: 23000 },
            __typename: 'User',
          },
        },
      });
    }

    // 로그인 뮤테이션
    if (isOperation('loginUser')) {
      return Response.json({
        data: {
          loginUser: {
            accessToken: 'test-access-token',
            __typename: 'AuthPayload',
          },
        },
      });
    }

    // fetchBoards & fetchBoardsCount 쿼리
    if (isOperation('fetchBoards') || isOperation('FetchBoards')) {
      // 단순 페이징 목 데이터 (10개 고정)
      const page = variables?.page || 1;
      const items = Array.from({ length: 10 }).map((_, idx) => {
        const no = (page - 1) * 10 + (10 - idx);
        return {
          _id: `board${no.toString().padStart(3, '0')}`,
          writer: `작성자${no}`,
          title: `테스트 제목 ${no}`,
          contents: `내용 ${no}`,
          createdAt: new Date().toISOString(),
          __typename: 'Board',
        };
      });
      return Response.json({ data: { fetchBoards: items } });
    }

    if (isOperation('fetchBoardsCount') || isOperation('FetchBoardsCount')) {
      return Response.json({ data: { fetchBoardsCount: 42 } });
    }

    // fetchBoard 쿼리
    if (isOperation('fetchBoard') || isOperation('getBoard')) {
      const boardId = variables?.boardId || 'test-board-id';
      return Response.json({
        data: {
          fetchBoard: {
            _id: boardId,
            writer: '테스트작성자',
            title: '테스트 제목',
            contents: '테스트 내용입니다.',
            youtubeUrl: 'https://www.youtube.com/watch?v=test',
            images: ['https://picsum.photos/800/400'],
            boardAddress: {
              zipcode: '06236',
              address: '서울 강남구 테헤란로',
              addressDetail: '테스트 타워 10층',
              __typename: 'BoardAddress',
            },
            likeCount: 0,
            dislikeCount: 0,
            user: {
              _id: 'user-001',
              email: 'test@example.com',
              name: '테스트유저',
              __typename: 'User',
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
            __typename: 'Board',
          },
          getBoard: {
            _id: boardId,
            writer: '작성자1',
            title: '테스트 제목 1',
            contents: '테스트 내용 1',
            youtubeUrl: 'https://www.youtube.com/watch?v=test',
            images: [],
            boardAddress: {
              zipcode: '12345',
              address: '서울시 강남구',
              addressDetail: '테스트 빌딩',
              __typename: 'BoardAddress',
            },
            __typename: 'Board',
          },
        },
      });
    }

    // createBoard 뮤테이션
    if (isOperation('createBoard')) {
      const newId = 'mock-' + Math.random().toString(36).slice(2, 10);
      const input = variables?.createBoardInput || {};
      return Response.json({
        data: {
          createBoard: {
            _id: newId,
            writer: input.writer || '테스트작성자',
            title: input.title || '제목',
            contents: input.contents || '내용',
            youtubeUrl: input.youtubeUrl || null,
            likeCount: 0,
            dislikeCount: 0,
            images: input.images || [],
            boardAddress: input.boardAddress
              ? { ...input.boardAddress, __typename: 'BoardAddress' }
              : null,
            user: {
              _id: 'user-001',
              email: 'test@example.com',
              name: '테스트유저',
              __typename: 'User',
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
            __typename: 'Board',
          },
        },
      });
    }

    // updateBoard 뮤테이션
    if (isOperation('updateBoard')) {
      const input = variables?.updateBoardInput || {};
      const boardId = variables?.boardId || 'test-board-id';
      return Response.json({
        data: {
          updateBoard: {
            _id: boardId,
            writer: '테스트작성자',
            title: input.title || '수정된 제목',
            contents: input.contents || '수정된 내용입니다.',
            youtubeUrl: input.youtubeUrl || null,
            likeCount: 0,
            dislikeCount: 0,
            images: input.images || [],
            boardAddress: input.boardAddress
              ? { ...input.boardAddress, __typename: 'BoardAddress' }
              : null,
            user: {
              _id: 'user-001',
              email: 'test@example.com',
              name: '테스트유저',
              __typename: 'User',
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
            __typename: 'Board',
          },
        },
      });
    }

    // deleteBoard
    if (isOperation('deleteBoard')) {
      return Response.json({ data: { deleteBoard: true } });
    }

    if (isOperation('uploadFile')) {
      return Response.json({
        data: {
          uploadFile: {
            url: 'mock-bucket/test-image.png',
            __typename: 'File',
          },
        },
      });
    }

    // 댓글 관련 기본 목 (작성 후 바로 성공 처리)
    if (isOperation('createBoardComment')) {
      return Response.json({ data: { createBoardComment: { _id: 'comment-001', __typename: 'BoardComment' } } });
    }

    if (isOperation('fetchBoardComments')) {
      return Response.json({ data: { fetchBoardComments: [] } });
    }

    // 기본 응답: 빈 데이터
    return Response.json({ data: {} });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ errors: [{ message: e?.message || 'Internal Error' }] }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// === 변경 주석 (자동 생성) ===
// 시각: 2025-10-29 16:25:35
// 변경 이유: 요구사항 반영 또는 사소한 개선(자동 추정)
// 학습 키워드: 개념 식별 불가(자동 추정 실패)

