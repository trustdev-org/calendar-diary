<div align="center">

[简体中文](README.md) | [English](README_EN.md) | [繁體中文](README_TW.md) | [日本語](README_JA.md) | **한국어** | [Русский](README_RU.md)

# 📅 CalendarDiary - 캘린더 다이어리

<p align="center">
  <img src="logo.png" alt="CalendarDiary Logo" width="120" height="120">
</p>

**일상을 기록하는 심플하고 우아한 캘린더 다이어리 앱**

[![Version](https://img.shields.io/badge/version-0.2.0--beta-blue.svg)](https://github.com/trustdev-org/calendar-diary/releases)
[![License](https://img.shields.io/badge/license-CC--BY--NC--4.0-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)](https://github.com/trustdev-org/calendar-diary/releases)

[📥 다운로드](#-설치) • [✨ 사용법](#-사용법) • [🚀 개발 가이드](#-개발-가이드) • [📝 변경 로그](CHANGELOG.md)

</div>

---

## 📖 앱 소개

CalendarDiary는 모던한 디자인 철학을 채택한 크로스 플랫폼 데스크톱 캘린더 다이어리 앱으로, 사용자에게 심플하고 직관적인 기록 경험을 제공합니다.

### 스크린샷

<img src="./img-preview-1.png"/>

<img src="./img-preview-2.png"/>

### ✨ 주요 기능

- **🎯 심플한 디자인** - 콘텐츠에 집중할 수 있는 미니멀한 인터페이스
- **📝 유연한 기록** - 멀티라인 텍스트 지원, 할 일과 일기 기록
- **🎨 무드 스티커** - 풍부한 이모지로 매일의 기분을 기록
- **📊 월간 뷰** - 한눈에 볼 수 있는 명확한 월별 캘린더 레이아웃
- **☁️ 클라우드 동기화** - WebDAV 클라우드 동기화 지원, 멀티 디바이스 데이터 동기화
- **🔐 프라이버시 보호** - PIN 코드 및 TOTP 인증 지원
- **💾 로컬 저장** - 완전한 로컬 데이터 저장으로 프라이버시 보호
- **🌍 다국어 지원** - 중국어 간체/번체, 영어, 일본어, 한국어, 러시아어 지원

## ⭐️ Stars 

[![Star History Chart](https://api.star-history.com/svg?repos=trustdev-org/calendar-diary&type=date&legend=top-left)](https://www.star-history.com/#trustdev-org/calendar-diary&type=date&legend=top-left)

## 🛠️ 기술 스택

| 기술 | 버전 | 용도 |
|------|------|------|
| **React** | 19.2.0 | UI 프레임워크 |
| **TypeScript** | 5.8.2 | 타입 안전성 |
| **Electron** | 39.2.3 | 데스크톱 프레임워크 |
| **Vite** | 6.4.1 | 빌드 도구 |
| **Tailwind CSS** | 4.1.8 | 스타일링 |
| **date-fns** | 4.1.0 | 날짜 처리 |
| **Lucide React** | 0.469.0 | 아이콘 라이브러리 |
| **webdav** | 5.8.0 | WebDAV 클라이언트 |

## 📥 설치

### 최신 버전: v0.2.0-beta

[Releases](https://github.com/trustdev-org/calendar-diary/releases) 페이지에서 시스템에 맞는 설치 파일을 다운로드하세요:

| 플랫폼 | 파일 형식 | 설명 |
|--------|----------|------|
| 🪟 **Windows** | `.exe` (NSIS 설치 프로그램) | 사용자 정의 설치 경로 지원 |
| 🪟 **Windows** | `.exe` (포터블) | 설치 없이 사용 |
| 🍎 **macOS** | `.dmg` | Apple Silicon (M1/M2/M3) 지원 |
| 🐧 **Linux** | `.AppImage` | 범용 Linux 형식 |
| 🐧 **Linux** | `.deb` | Debian/Ubuntu 시스템 |

### 설치 방법

#### Windows
1. `CalendarDiary-Setup-0.2.0-beta.exe` 다운로드
2. 더블 클릭하여 설치 프로그램 실행
3. 마법사를 따라 설치 완료

#### macOS
1. `CalendarDiary-0.2.0-beta-arm64.dmg` 다운로드
2. DMG 파일 열기
3. 앱을 Applications 폴더로 드래그
4. 첫 실행 시 "시스템 설정 > 개인 정보 보호 및 보안"에서 허용이 필요할 수 있음

#### Linux
```bash
# AppImage
chmod +x CalendarDiary-0.2.0-beta-arm64.AppImage
./CalendarDiary-0.2.0-beta-arm64.AppImage

# Debian/Ubuntu
sudo dpkg -i calendar-diary_0.2.0-beta_amd64.deb
```

## 📖 사용법

### 기본 조작

#### 1️⃣ 캘린더 보기
- 앱 실행 시 기본으로 이번 달 캘린더 표시
- 화살표 클릭으로 월 전환
- 날짜 숫자 클릭으로 특정 날짜로 이동

#### 2️⃣ 일기/할 일 기록
1. 원하는 날짜 셀 클릭
2. 팝업 에디터에 내용 입력
3. 각 항목에서:
   - 📝 멀티라인 텍스트 입력
   - 😊 이모지 마커 선택
   - 🗑️ 삭제 아이콘 클릭하여 삭제
4. "변경 사항 저장" 클릭으로 완료

#### 3️⃣ 무드 스티커 추가
- 날짜 에디터 하단에서 무드 스티커 선택
- 여러 스티커 추가 가능
- 다시 클릭하여 선택 해제

#### 4️⃣ 월간 계획
- 캘린더 상단에서 이번 달 목표 기록
- 3개의 독립적인 계획 항목 지원
- 계획은 자동 저장

### 고급 기능

#### 📦 데이터 백업 및 복원

**백업 내보내기:**
1. 우측 상단 설정 아이콘 ⚙️ 클릭
2. "백업 내보내기" 선택
3. 저장 위치 선택, 파일명 형식: `paperplan_backup_YYYY-MM-DD.json`

**백업 가져오기:**
1. 우측 상단 설정 아이콘 ⚙️ 클릭
2. "백업 가져오기" 선택
3. 이전에 내보낸 JSON 파일 선택
4. 확인 후 데이터 복원

#### 🌍 언어 변경
1. 설정 아이콘 ⚙️ 클릭
2. "언어" 드롭다운에서 선택
3. 언어가 즉시 변경됨, 재시작 불필요

#### 📂 데이터 저장 위치 확인
1. 설정 아이콘 ⚙️ 클릭
2. "데이터 저장 위치" 영역에서 "폴더 열기" 클릭
3. 시스템이 데이터 저장 디렉토리를 엶

**데이터 저장 경로:**
- Windows: `%APPDATA%\CalendarDiary\`
- macOS: `~/Library/Application Support/CalendarDiary/`
- Linux: `~/.config/CalendarDiary/`

#### 🔄 소프트웨어 업데이트
- 툴바의 "업데이트 확인" 버튼 클릭
- 새 버전이 있으면 버전 정보와 릴리스 페이지 링크 표시
- 링크 클릭하여 다운로드 페이지로 이동

#### ☁️ 클라우드 동기화 설정
1. 설정 아이콘 ⚙️ 클릭
2. "클라우드 동기화" 탭 선택
3. WebDAV 서버 주소, 경로, 사용자 이름, 비밀번호 설정
4. "연결 테스트" 클릭하여 확인
5. 툴바의 클라우드 아이콘 클릭하여 동기화 관리 열기

## 🚀 개발 가이드

### 요구 사항

- **Node.js**: 18.x 이상
- **npm**: Node.js에 포함
- **OS**: Windows 10+, macOS 10.13+, Linux

### 프로젝트 클론

```bash
git clone https://github.com/trustdev-org/calendar-diary.git
cd calendar-diary
```

### 의존성 설치

```bash
npm install
```

### 개발 모드

```bash
npm run dev
```

이 명령은:
1. Vite 개발 서버 시작 (포트 5173)
2. Electron 앱 자동 실행
3. 핫 모듈 교체 (HMR) 지원

### 빌드

#### 모든 플랫폼 빌드

```bash
npm run electron:build
```

#### 특정 플랫폼 빌드

```bash
# macOS
npm run electron:build:mac

# Windows
npm run electron:build:win

# Linux
npm run electron:build:linux
```

빌드 결과물은 `release/` 디렉토리에 출력됩니다.

### 아키텍처

#### Electron 아키텍처
- **메인 프로세스** (`electron/main.ts`): 앱 창, 파일 시스템 관리
- **렌더러 프로세스** (React App): 사용자 인터페이스 및 상호작용 로직
- **프리로드 스크립트** (`electron/preload.ts`): 안전한 IPC 통신 브릿지

#### 데이터 저장
모든 데이터는 로컬 파일 시스템에 저장:
- **calendar-data.json**: 일기 및 할 일 데이터
- **monthly-plans.json**: 월간 계획 데이터

저장 위치:
- **Windows**: `%APPDATA%\CalendarDiary\`
- **macOS**: `~/Library/Application Support/CalendarDiary/`
- **Linux**: `~/.config/CalendarDiary/`

## 🤝 기여 가이드

코드, 이슈, 제안은 언제나 환영합니다!

### Issue 제출
- 문제를 명확하게 설명하는 제목 사용
- 상세한 재현 절차 제공
- 시스템 정보 및 에러 로그 첨부

### Pull Request 제출
1. 이 저장소 포크
2. 기능 브랜치 생성: `git checkout -b feature/AmazingFeature`
3. 변경 사항 커밋: `git commit -m 'Add some AmazingFeature'`
4. 브랜치에 푸시: `git push origin feature/AmazingFeature`
5. Pull Request 열기

## 📄 라이선스

이 프로젝트는 [CC-BY-NC-4.0](LICENSE) 라이선스 하에 배포됩니다.

**허용 사항:**
- ✅ 공유 - 복사 및 재배포
- ✅ 개작 - 리믹스, 변형, 구축

**조건:**
- 📝 저작자 표시 - 적절한 크레딧 표시
- 🚫 비영리 - 상업적 목적으로 사용 불가

## 🙏 감사의 말

- 아이콘: [Lucide Icons](https://lucide.dev/)
- UI 프레임워크: [React](https://react.dev/)
- 데스크톱 프레임워크: [Electron](https://www.electronjs.org/)
- 날짜 처리: [date-fns](https://date-fns.org/)

## 📮 연락처

- **이슈 피드백**: [GitHub Issues](https://github.com/trustdev-org/calendar-diary/issues)
- **프로젝트 홈페이지**: [GitHub Repository](https://github.com/trustdev-org/calendar-diary)

---

<div align="center">

**이 프로젝트가 도움이 되었다면 ⭐ Star를 눌러주세요!**

Made with ❤️ by TrustDev

</div>
