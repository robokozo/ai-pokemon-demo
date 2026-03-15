export type VoiceGender = 'male' | 'female' | 'unknown'

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

interface VoiceMeta {
  lang: string
  gender: VoiceGender
}

/** All known voices with their BCP-47 language tag and gender */
export const KNOWN_VOICES: Record<KnownVoiceName, VoiceMeta> = {
  'Google Deutsch':                   { lang: 'de-DE', gender: 'female' },
  'Google US English':                { lang: 'en-US', gender: 'female' },
  'Google UK English Female':         { lang: 'en-GB', gender: 'female' },
  'Google UK English Male':           { lang: 'en-GB', gender: 'male'   },
  'Google español':                   { lang: 'es-ES', gender: 'male'   },
  'Google español de Estados Unidos': { lang: 'es-US', gender: 'female' },
  'Google français':                  { lang: 'fr-FR', gender: 'female' },
  'Google हिन्दी':                    { lang: 'hi-IN', gender: 'female' },
  'Google Bahasa Indonesia':          { lang: 'id-ID', gender: 'female' },
  'Google italiano':                  { lang: 'it-IT', gender: 'female' },
  'Google 日本語':                     { lang: 'ja-JP', gender: 'female' },
  'Google 한국의':                     { lang: 'ko-KR', gender: 'female' },
  'Google Nederlands':                { lang: 'nl-NL', gender: 'female' },
  'Google polski':                    { lang: 'pl-PL', gender: 'female' },
  'Google português do Brasil':       { lang: 'pt-BR', gender: 'female' },
  'Google русский':                   { lang: 'ru-RU', gender: 'female' },
  'Google 普通话（中国大陆）':            { lang: 'zh-CN', gender: 'female' },
  'Google 粤語（香港）':                 { lang: 'zh-HK', gender: 'female' },
  'Google 國語（臺灣）':                 { lang: 'zh-TW', gender: 'female' },
}

/**
 * Looks up a known voice by name from the browser's available voices list.
 * Returns `undefined` if the voice isn't loaded yet or isn't available.
 */
export function findVoice(name: KnownVoiceName): SpeechSynthesisVoice | undefined {
  return speechSynthesis.getVoices().find((v) => v.name === name)
}

/**
 * Returns all known voices matching the given gender that are currently
 * loaded in the browser (i.e. present in speechSynthesis.getVoices()).
 */
export function findVoicesByGender(gender: VoiceGender): Array<SpeechSynthesisVoice> {
  const available = speechSynthesis.getVoices()
  return (Object.entries(KNOWN_VOICES) as Array<[KnownVoiceName, VoiceMeta]>)
    .filter(([, meta]) => meta.gender === gender)
    .flatMap(([name]) => available.filter((v) => v.name === name))
}

