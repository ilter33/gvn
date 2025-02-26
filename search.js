export async function search(dork, engine) {
  try {
    const response = await fetch(`${searchEngines[engine]}${encodeURIComponent(dork)}+in:file&per_page=10`, {
      headers: {
        'Authorization': 'token YOUR_GITHUB_TOKEN',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    // HTTP hatalarını yakala
    if (!response.ok) {
      throw new Error(`HTTP Hatası: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();

    // items dizisinin varlığını kontrol et
    if (!data.items || !Array.isArray(data.items)) {
      throw new Error('GitHub API geçersiz yanıt döndürdü.');
    }

    return data.items.map(item => item.html_url);
  } catch (error) {
    throw new Error('GitHub API hatası: ' + error.message);
  }
}
