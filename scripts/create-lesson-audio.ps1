param([Parameter(Mandatory=$true)][string]$OutputDirectory)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$plans = Get-Content -LiteralPath (Join-Path $OutputDirectory 'plans.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  $synth.SelectVoice('Microsoft Zira Desktop')
  $format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(24000, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
  foreach ($plan in $plans) {
    $targetDirectory = Join-Path $OutputDirectory $plan.id
    New-Item -ItemType Directory -Force -Path $targetDirectory | Out-Null
    for ($index = 0; $index -lt $plan.segments.Count; $index++) {
      $synth.SetOutputToWaveFile((Join-Path $targetDirectory "$index.wav"), $format)
      $escapedLine = [System.Security.SecurityElement]::Escape($plan.segments[$index].text)
      $synth.SpeakSsml("<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'><prosody pitch='+12%' rate='-3%'>$escapedLine</prosody></speak>")
      $synth.SetOutputToNull()
    }
    $plan | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath (Join-Path $targetDirectory 'plan.json') -Encoding utf8
    Write-Output "Narrated $($plan.id)"
  }
} finally { $synth.Dispose() }
