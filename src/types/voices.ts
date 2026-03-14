export type GoogleVoiceName =
  | 'Google Deutsch'
  | 'Google US English'
  | 'Google UK English Female'
  | 'Google UK English Male'
  | 'Google español'
  | 'Google español de Estados Unidos'
  | 'Google français'
  | 'Google हिन्दी'
  | 'Google Bahasa Indonesia'
  | 'Google italiano'
  | 'Google 日本語'
  | 'Google 한국의'
  | 'Google Nederlands'
  | 'Google polski'
  | 'Google português do Brasil'
  | 'Google русский'
  | 'Google 普通话（中国大陆）'
  | 'Google 粤語（香港）'
  | 'Google 國語（臺灣）'

export type KnownVoiceName = GoogleVoiceName

/** All known voices with their BCP-47 language tag */
export const KNOWN_VOICES: Record<KnownVoiceName, string> = {
  'Google Deutsch':                   'de-DE',
  'Google US English':                'en-US',
  'Google UK English Female':         'en-GB',
  'Google UK English Male':           'en-GB',
  'Google español':                   'es-ES',
  'Google español de Estados Unidos': 'es-US',
  'Google français':                  'fr-FR',
  'Google हिन्दी':                    'hi-IN',
  'Google Bahasa Indonesia':          'id-ID',
  'Google italiano':                  'it-IT',
  'Google 日本語':                     'ja-JP',
  'Google 한국의':                     'ko-KR',
  'Google Nederlands':                'nl-NL',
  'Google polski':                    'pl-PL',
  'Google português do Brasil':       'pt-BR',
  'Google русский':                   'ru-RU',
  'Google 普通话（中国大陆）':            'zh-CN',
  'Google 粤語（香港）':                 'zh-HK',
  'Google 國語（臺灣）':                 'zh-TW',
}

/**
 * Looks up a known voice by name from the browser's available voices list.
 * Returns `undefined` if the voice isn't loaded yet or isn't available.
 */
export function findVoice(name: KnownVoiceName): SpeechSynthesisVoice | undefined {
  return speechSynthesis.getVoices().find((v) => v.name === name)
}
