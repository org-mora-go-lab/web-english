param([Parameter(Mandatory=$true)][string]$OutputDirectory)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$lines = @(
  "Hi! I'm Momo, your English buddy.",
  "A little practice every day goes a long way.",
  "Let's try it together. Hello! How are you?",
  "Great job! Let's learn, one small step at a time."
)
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  $synth.SelectVoice('Microsoft Zira Desktop')
  $synth.Rate = 0
  $format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(24000, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
  for ($index = 0; $index -lt $lines.Length; $index++) {
    $synth.SetOutputToWaveFile((Join-Path $OutputDirectory "$index.wav"), $format)
    $escapedLine = [System.Security.SecurityElement]::Escape($lines[$index])
    $synth.SpeakSsml("<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'><prosody pitch='+12%' rate='-3%'>$escapedLine</prosody></speak>")
    $synth.SetOutputToNull()
  }
} finally { $synth.Dispose() }
Write-Output 'English narration written: 4 PCM WAV files.'
