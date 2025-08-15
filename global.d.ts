// global.d.ts
interface Window {
  SpeechRecognition?: typeof SpeechRecognition;
  webkitSpeechRecognition?: typeof SpeechRecognition;
  SpeechGrammarList?: typeof SpeechGrammarList;
  webkitSpeechGrammarList?: typeof SpeechGrammarList;
}