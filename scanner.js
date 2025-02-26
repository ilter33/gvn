export async function scanURL(url, vulnerabilityType) {
  try {
    const repoPath = url.replace('https://github.com/', '').split('/blob/')[0];
    const response = await fetch(`https://api.github.com/repos/${repoPath}/code-scanning/alerts`, {
      headers: {
        'Authorization': 'token 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',
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    const alerts = await response.json();
    return {
      vulnerable: alerts.length > 0,
      details: alerts.map(alert => `- Tür: ${alert.rule.description}\n- Önem: ${alert.rule.severity}`).join('\n'),
      severity: alerts.length > 0 ? 'Yüksek' : 'Yok'
    };
  } catch (error) {
    return { vulnerable: false, details: 'Tarama başarısız' };
  }
}
