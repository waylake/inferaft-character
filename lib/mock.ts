export function mockReply(characterName: string, input: string) {
  const trimmed = input.trim();
  return `${characterName}: “${trimmed.length > 36 ? trimmed.slice(0, 36) + "…" : trimmed}”라고 했지. 지금은 로컬 POC 모드라 실제 Inferaft 호출 대신 이 응답을 보여주고 있어. INFERAFT_API_KEY를 넣으면 스트리밍 모델 응답으로 바뀐다.`;
}
